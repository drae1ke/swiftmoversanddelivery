const express = require('express');
const https = require('https');

const Order = require('../models/Order');
const PricingConfig = require('../models/PricingConfig');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

async function getDistanceKmFromOpenRouteService(origin, destination) {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey || !origin || !destination) {
    return null;
  }

  function getJson(path) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.openrouteservice.org',
        path,
        method: 'GET',
        headers: {
          Authorization: apiKey,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            console.error('OpenRouteService parse error:', err.message);
            resolve(null);
          }
        });
      });

      req.on('error', (err) => {
        console.error('OpenRouteService request error:', err.message);
        resolve(null);
      });

      req.end();
    });
  }

  try {
    const encOrigin = encodeURIComponent(origin);
    const encDest = encodeURIComponent(destination);

    const geo1 = await getJson(`/geocode/search?text=${encOrigin}&size=1`);
    const geo2 = await getJson(`/geocode/search?text=${encDest}&size=1`);

    const coords1 =
      geo1 &&
      geo1.features &&
      geo1.features[0] &&
      geo1.features[0].geometry &&
      geo1.features[0].geometry.coordinates;
    const coords2 =
      geo2 &&
      geo2.features &&
      geo2.features[0] &&
      geo2.features[0].geometry &&
      geo2.features[0].geometry.coordinates;

    if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) {
      console.error('OpenRouteService geocoding failed');
      return null;
    }

    const start = `${coords1[0]},${coords1[1]}`; // lon,lat
    const end = `${coords2[0]},${coords2[1]}`;

    const directions = await getJson(`/v2/directions/driving-car?start=${start}&end=${end}`);
    if (
      directions &&
      directions.features &&
      directions.features[0] &&
      directions.features[0].properties &&
      directions.features[0].properties.summary &&
      typeof directions.features[0].properties.summary.distance === 'number'
    ) {
      const meters = directions.features[0].properties.summary.distance;
      return meters / 1000;
    }

    console.error('OpenRouteService directions missing distance');
    return null;
  } catch (err) {
    console.error('OpenRouteService distance error:', err.message);
    return null;
  }
}

async function getActivePricingConfig() {
  let config = await PricingConfig.findOne().lean();
  if (!config) {
    // Create a simple default configuration if none exists yet
    const created = await PricingConfig.create({
      baseCostPerKm: 50,
      weightBands: [
        { label: '0 - 5 kg', minKg: 0, maxKg: 5, pricePerKm: 50 },
        { label: '5 - 20 kg', minKg: 5, maxKg: 20, pricePerKm: 60 },
        { label: '20 - 50 kg', minKg: 20, maxKg: 50, pricePerKm: 80 },
        { label: '50 - 100 kg', minKg: 50, maxKg: 100, pricePerKm: 100 },
      ],
    });
    config = created.toObject();
  }
  return config;
}

async function calculatePrice(distanceKm, packageWeightKg, vehicleType, serviceType) {
  let baseRate = 50;
  let perKm = baseRate;

  try {
    const config = await getActivePricingConfig();
    baseRate = typeof config.baseCostPerKm === 'number' ? config.baseCostPerKm : baseRate;

    if (Array.isArray(config.weightBands) && config.weightBands.length > 0) {
      const band = config.weightBands.find(
        (b) =>
          typeof b.minKg === 'number' &&
          typeof b.maxKg === 'number' &&
          packageWeightKg >= b.minKg &&
          packageWeightKg <= b.maxKg
      );
      if (band && typeof band.pricePerKm === 'number') {
        perKm = band.pricePerKm;
      } else {
        perKm = baseRate;
      }
    } else {
      perKm = baseRate;
    }
  } catch (err) {
    console.error('Price config lookup error:', err.message);
    perKm = baseRate;
  }

  let vehicleFactor = 1;
  if (vehicleType === 'bike') vehicleFactor = 0.8;
  else if (vehicleType === 'car') vehicleFactor = 1;
  else if (vehicleType === 'van') vehicleFactor = 1.5;
  else if (vehicleType === 'lorry') vehicleFactor = 2;
  else if (vehicleType === 'bicycle') vehicleFactor = 0.6;

  let serviceFactor = 1;
  if (serviceType === 'Express') serviceFactor = 1.5;
  else if (serviceType === 'Same Day') serviceFactor = 1.3;

  const price = Math.round(distanceKm * perKm * vehicleFactor * serviceFactor);
  return price;
}

// Create order (client)
router.post('/', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const {
      pickupAddress,
      dropoffAddress,
      recipientName,
      recipientPhone,
      distanceKm,
      packageWeightKg,
      vehicleType,
      serviceType,
    } = req.body;

    if (!pickupAddress || !dropoffAddress || !distanceKm || !packageWeightKg || !vehicleType) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    // recipientName/recipientPhone are optional at the API level, but the client UI requires them.

    let effectiveDistanceKm = Number(distanceKm);
    if (!Number.isFinite(effectiveDistanceKm) || effectiveDistanceKm <= 0) {
      effectiveDistanceKm = 10; // simple fallback if client did not provide a distance
    }

    const orsDistance = await getDistanceKmFromOpenRouteService(pickupAddress, dropoffAddress);
    if (orsDistance && Number.isFinite(orsDistance) && orsDistance > 0) {
      effectiveDistanceKm = orsDistance;
    }

    const priceKes = await calculatePrice(
      effectiveDistanceKm,
      Number(packageWeightKg),
      vehicleType,
      serviceType || 'Standard'
    );

    const order = await Order.create({
      client: req.user.id,
      pickupAddress,
      dropoffAddress,
      recipientName,
      recipientPhone,
      distanceKm: effectiveDistanceKm,
      packageWeightKg,
      vehicleType,
      serviceType: serviceType || 'Standard',
      priceKes,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get current user's orders (client)
router.get('/my', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const orders = await Order.find({ client: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(orders);
  } catch (err) {
    console.error('Get my orders error:', err.message);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Price estimate without creating an order
router.post('/estimate', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const { pickupAddress, dropoffAddress, packageWeightKg, vehicleType, serviceType } = req.body;

    if (!pickupAddress || !dropoffAddress || !packageWeightKg || !vehicleType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let effectiveDistanceKm = 10;
    const orsDistance = await getDistanceKmFromOpenRouteService(pickupAddress, dropoffAddress);
    if (orsDistance && Number.isFinite(orsDistance) && orsDistance > 0) {
      effectiveDistanceKm = orsDistance;
    }

    const priceKes = await calculatePrice(
      effectiveDistanceKm,
      Number(packageWeightKg),
      vehicleType,
      serviceType || 'Standard'
    );

    res.json({ distanceKm: effectiveDistanceKm, priceKes });
  } catch (err) {
    console.error('Estimate price error:', err.message);
    res.status(500).json({ message: 'Error estimating price' });
  }
});

// Public pricing info for weight bands (used by client app)
router.get('/pricing/weight-bands', async (req, res) => {
  try {
    const config = await getActivePricingConfig();
    res.json({
      baseCostPerKm: config.baseCostPerKm,
      weightBands: config.weightBands || [],
    });
  } catch (err) {
    console.error('Get pricing weight-bands error:', err.message);
    res.status(500).json({ message: 'Error fetching pricing configuration' });
  }
});

// Track order by full or partial _id (public with auth)
router.get('/track/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;

    // Try exact match first
    if (id.match(/^[a-f\d]{24}$/i)) {
      order = await Order.findById(id)
        .populate('client', 'fullName')
        .populate({ path: 'driver', populate: { path: 'user', select: 'fullName' } });
    }

    // If not found, try partial match on hex suffix (last 8 chars)
    if (!order && id.length >= 6) {
      const orders = await Order.find()
        .populate('client', 'fullName')
        .populate({ path: 'driver', populate: { path: 'user', select: 'fullName' } })
        .limit(200);
      order = orders.find((o) => o._id.toString().endsWith(id.toLowerCase()));
    }

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only allow client who owns it, or admin
    if (req.user.role !== 'admin' && order.client?._id?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error('Track order error:', err.message);
    res.status(500).json({ message: 'Error tracking order' });
  }
});

module.exports = router;

