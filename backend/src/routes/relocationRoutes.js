const express = require('express');
const https = require('https');

const RelocationRequest = require('../models/RelocationRequest');
const Driver = require('../models/Driver');
const PricingConfig = require('../models/PricingConfig');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Helper function to get distance from OpenRouteService
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

    const start = `${coords1[0]},${coords1[1]}`;
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

// Helper function to calculate price
async function calculateRelocationPrice(distanceKm, vehicleType, serviceType) {
  let baseRate = 50;
  let perKm = baseRate;

  try {
    const config = await PricingConfig.findOne().lean();
    if (config && typeof config.baseCostPerKm === 'number') {
      baseRate = config.baseCostPerKm;
      perKm = baseRate;
    }
  } catch (err) {
    console.error('Price config lookup error:', err.message);
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

// Get pricing configuration
router.get('/pricing', async (req, res) => {
  try {
    const config = await PricingConfig.findOne().lean();
    res.json({
      baseCostPerKm: config?.baseCostPerKm || 50,
      vehicleTypes: ['bicycle', 'bike', 'car', 'van', 'lorry'],
      serviceTypes: ['Standard', 'Same Day', 'Express'],
    });
  } catch (err) {
    console.error('Get pricing error:', err.message);
    res.status(500).json({ message: 'Error fetching pricing' });
  }
});

// Estimate relocation price
router.post('/estimate', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const { pickupAddress, destinationAddress, vehicleType, serviceType } = req.body;

    if (!pickupAddress || !destinationAddress) {
      return res.status(400).json({ message: 'Pickup and destination addresses are required' });
    }

    let distanceKm = 10;
    const orsDistance = await getDistanceKmFromOpenRouteService(pickupAddress, destinationAddress);
    if (orsDistance && Number.isFinite(orsDistance) && orsDistance > 0) {
      distanceKm = orsDistance;
    }

    const price = await calculateRelocationPrice(
      distanceKm,
      vehicleType || 'van',
      serviceType || 'Standard'
    );

    res.json({ distanceKm, priceKes: price });
  } catch (err) {
    console.error('Estimate price error:', err.message);
    res.status(500).json({ message: 'Error estimating price' });
  }
});

// Create relocation request (client)
router.post('/', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const {
      pickupAddress,
      destinationAddress,
      scheduledDate,
      itemsDescription,
      estimatedVolume,
      vehicleType,
      serviceType,
      notes,
    } = req.body;

    if (!pickupAddress || !destinationAddress || !scheduledDate || !itemsDescription || !estimatedVolume || !vehicleType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get distance
    let distanceKm = 10;
    const orsDistance = await getDistanceKmFromOpenRouteService(pickupAddress, destinationAddress);
    if (orsDistance && Number.isFinite(orsDistance) && orsDistance > 0) {
      distanceKm = orsDistance;
    }

    const price = await calculateRelocationPrice(
      distanceKm,
      vehicleType,
      serviceType || 'Standard'
    );

    // Get coordinates for pickup and destination
    let pickupCoordinates = { type: 'Point', coordinates: [0, 0] };
    let destinationCoordinates = { type: 'Point', coordinates: [0, 0] };

    // Try to get coordinates (simplified - would need full geocoding in production)
    
    const relocationRequest = await RelocationRequest.create({
      client: req.user.id,
      pickupAddress,
      pickupCoordinates,
      destinationAddress,
      destinationCoordinates,
      scheduledDate: new Date(scheduledDate),
      itemsDescription,
      estimatedVolume,
      vehicleType,
      serviceType: serviceType || 'Standard',
      price,
      distanceKm,
      notes,
      status: 'pending',
    });

    res.status(201).json(relocationRequest);
  } catch (err) {
    console.error('Create relocation request error:', err.message);
    res.status(500).json({ message: 'Error creating relocation request' });
  }
});

// Get client's relocation requests
router.get('/my', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const requests = await RelocationRequest.find({ client: req.user.id })
      .populate('assignedDriver', 'user vehicleType rating isOnline')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Get my relocation requests error:', err.message);
    res.status(500).json({ message: 'Error fetching relocation requests' });
  }
});

// Get all relocation requests (admin)
router.get('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await RelocationRequest.find(query)
      .populate('client', 'fullName email')
      .populate('assignedDriver')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await RelocationRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (err) {
    console.error('Get relocation requests error:', err.message);
    res.status(500).json({ message: 'Error fetching relocation requests' });
  }
});

// Get relocation request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await RelocationRequest.findById(req.params.id)
      .populate('client', 'fullName email')
      .populate('assignedDriver');

    if (!request) {
      return res.status(404).json({ message: 'Relocation request not found' });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isClient = request.client._id.toString() === req.user.id;
    const isDriver = request.assignedDriver && request.assignedDriver._id.toString() === req.user.id;

    if (!isAdmin && !isClient && !isDriver) {
      return res.status(403).json({ message: 'Not authorized to view this request' });
    }

    res.json(request);
  } catch (err) {
    console.error('Get relocation request error:', err.message);
    res.status(500).json({ message: 'Error fetching relocation request' });
  }
});

// Assign driver to relocation request (admin)
router.put('/:id/assign', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { driverId } = req.body;

    const relocationRequest = await RelocationRequest.findById(req.params.id);

    if (!relocationRequest) {
      return res.status(404).json({ message: 'Relocation request not found' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    relocationRequest.assignedDriver = driverId;
    relocationRequest.status = 'assigned';
    await relocationRequest.save();

    res.json(relocationRequest);
  } catch (err) {
    console.error('Assign driver error:', err.message);
    res.status(500).json({ message: 'Error assigning driver' });
  }
});

// Update relocation request status
router.put('/:id/status', authenticate, authorizeRoles('admin', 'driver'), async (req, res) => {
  try {
    const { status } = req.body;

    const relocationRequest = await RelocationRequest.findById(req.params.id);

    if (!relocationRequest) {
      return res.status(404).json({ message: 'Relocation request not found' });
    }

    // Drivers can only update their own assigned requests
    if (req.user.role === 'driver') {
      if (!relocationRequest.assignedDriver) {
        return res.status(403).json({ message: 'No driver assigned to this request' });
      }
      const driver = await Driver.findOne({ user: req.user.id });
      if (!driver || driver._id.toString() !== relocationRequest.assignedDriver.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this request' });
      }
    }

    relocationRequest.status = status;
    if (status === 'completed') {
      relocationRequest.completedAt = new Date();
    }

    await relocationRequest.save();

    res.json(relocationRequest);
  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// Cancel relocation request (client or admin)
router.delete('/:id', authenticate, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const relocationRequest = await RelocationRequest.findById(req.params.id);

    if (!relocationRequest) {
      return res.status(404).json({ message: 'Relocation request not found' });
    }

    // Only client who created it or admin can cancel
    if (req.user.role === 'client' && relocationRequest.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    if (relocationRequest.status === 'in-transit' || relocationRequest.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a request that is in transit or completed' });
    }

    relocationRequest.status = 'cancelled';
    await relocationRequest.save();

    res.json({ message: 'Relocation request cancelled successfully' });
  } catch (err) {
    console.error('Cancel relocation request error:', err.message);
    res.status(500).json({ message: 'Error cancelling relocation request' });
  }
});

module.exports = router;
