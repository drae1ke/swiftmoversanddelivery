const Driver = require('../models/Driver');
const RelocationRequest = require('../models/Relocationrequest');
const { initiateSelfDispatchWindow, canAdminOverride } = require('../services/Relocationautoassign');

// ─── Pricing ──────────────────────────────────────────────────────────────────

async function getPricing(req, res) {
  try {
    res.json({
      basePrice: 2500,
      pricePerKm: 80,
      vehicleMultipliers: {
        bicycle: 0.6,
        bike: 0.8,
        car: 1.0,
        van: 1.4,
        lorry: 2.0,
      },
      serviceMultipliers: {
        Standard: 1.0,
        'Same Day': 1.3,
        Express: 1.6,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pricing' });
  }
}

async function estimatePrice(req, res) {
  try {
    const { distanceKm, vehicleType, serviceType } = req.body;
    const vehicleMultipliers = { bicycle: 0.6, bike: 0.8, car: 1.0, van: 1.4, lorry: 2.0 };
    const serviceMultipliers = { Standard: 1.0, 'Same Day': 1.3, Express: 1.6 };
    const base = 2500 + (distanceKm || 0) * 80;
    const price = Math.round(
      base *
        (vehicleMultipliers[vehicleType] || 1) *
        (serviceMultipliers[serviceType] || 1)
    );
    res.json({ price, distanceKm });
  } catch (err) {
    res.status(500).json({ message: 'Error estimating price' });
  }
}

// ─── Client: Create Relocation ────────────────────────────────────────────────

async function createRelocation(req, res) {
  try {
    const {
      pickupAddress,
      pickupCoordinates,
      destinationAddress,
      destinationCoordinates,
      scheduledDate,
      itemsDescription,
      estimatedVolume,
      vehicleType,
      serviceType,
      price,
      distanceKm,
      notes,
    } = req.body;

    const relocationRequest = await RelocationRequest.create({
      client: req.user.id,
      pickupAddress,
      pickupCoordinates: pickupCoordinates || { type: 'Point', coordinates: [0, 0] },
      destinationAddress,
      destinationCoordinates: destinationCoordinates || { type: 'Point', coordinates: [0, 0] },
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

    // ── Open self-dispatch window immediately (non-blocking) ──────────────────
    // Drivers will be notified; auto-assign fires after window expires.
    initiateSelfDispatchWindow(relocationRequest).catch((err) =>
      console.error('[SelfDispatch] Error initiating window:', err.message)
    );

    res.status(201).json(relocationRequest);
  } catch (err) {
    console.error('Create relocation request error:', err.message);
    res.status(500).json({ message: 'Error creating relocation request' });
  }
}

// ─── Client: Get My Relocations ───────────────────────────────────────────────

async function getMyRelocations(req, res) {
  try {
    const requests = await RelocationRequest.find({ client: req.user.id })
      .populate({
        path: 'assignedDriver',
        populate: { path: 'user', select: 'fullName phone' },
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Get my relocation requests error:', err.message);
    res.status(500).json({ message: 'Error fetching relocation requests' });
  }
}

// ─── Admin: List All Relocations ─────────────────────────────────────────────

async function listRelocations(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      RelocationRequest.find(query)
        .populate('client', 'fullName email phone')
        .populate({ path: 'assignedDriver', populate: { path: 'user', select: 'fullName phone' } })
        .populate('adminOverrideBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      RelocationRequest.countDocuments(query),
    ]);

    res.json({
      requests,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error('Get relocation requests error:', err.message);
    res.status(500).json({ message: 'Error fetching relocation requests' });
  }
}

// ─── Shared: Get Single Relocation ───────────────────────────────────────────

async function getRelocationById(req, res) {
  try {
    const request = await RelocationRequest.findById(req.params.id)
      .populate('client', 'fullName email phone')
      .populate({ path: 'assignedDriver', populate: { path: 'user', select: 'fullName phone' } })
      .populate('adminOverrideBy', 'fullName email');

    if (!request) return res.status(404).json({ message: 'Relocation request not found' });

    const isAdmin = req.user.role === 'admin';
    const isClient = request.client._id.toString() === req.user.id;
    const isDriver =
      request.assignedDriver &&
      request.assignedDriver.user?._id?.toString() === req.user.id;

    if (!isAdmin && !isClient && !isDriver) {
      return res.status(403).json({ message: 'Not authorized to view this request' });
    }

    res.json(request);
  } catch (err) {
    console.error('Get relocation request error:', err.message);
    res.status(500).json({ message: 'Error fetching relocation request' });
  }
}

// ─── Admin: Override Assignment (last resort, audited) ───────────────────────

async function assignDriver(req, res) {
  try {
    const { driverId, reason } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: 'driverId is required' });
    }

    const relocationRequest = await RelocationRequest.findById(req.params.id);
    if (!relocationRequest) {
      return res.status(404).json({ message: 'Relocation request not found' });
    }

    // ── Check if admin override is permitted ──────────────────────────────────
    const { allowed, reason: blockReason } = await canAdminOverride(relocationRequest);
    if (!allowed) {
      return res.status(403).json({
        message: blockReason,
        hint: 'Allow the self-dispatch window to expire, or wait until the move is within 4 hours.',
      });
    }

    // ── Validate driver is eligible ───────────────────────────────────────────
    const driver = await Driver.findById(driverId).populate('user', 'fullName');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    if (!driver.isOnline) {
      return res.status(400).json({
        message: `Driver ${driver.user?.fullName || driverId} is currently offline. Please choose an online driver.`,
      });
    }

    if (driver.vehicleType !== relocationRequest.vehicleType) {
      return res.status(400).json({
        message: `This relocation requires a ${relocationRequest.vehicleType}, but this driver has a ${driver.vehicleType}.`,
      });
    }

    // ── Perform assignment with full audit record ─────────────────────────────
    const updated = await RelocationRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' }, // atomic: only if still pending
      {
        $set: {
          assignedDriver: driverId,
          status: 'assigned',
          assignmentMethod: 'admin-override',
          assignedAt: new Date(),
          adminOverrideBy: req.user.id,
          adminOverrideReason: reason || 'No reason provided',
        },
      },
      { new: true }
    )
      .populate('client', 'fullName email phone')
      .populate({ path: 'assignedDriver', populate: { path: 'user', select: 'fullName phone' } });

    if (!updated) {
      return res.status(409).json({
        message: 'This relocation was just assigned by a driver. Refresh and check again.',
      });
    }

    console.log(
      `[AdminOverride] Admin ${req.user.id} assigned driver ${driverId} ` +
      `to relocation ${req.params.id}. Reason: "${reason || 'none'}"`
    );

    res.json(updated);
  } catch (err) {
    console.error('Assign driver error:', err.message);
    res.status(500).json({ message: 'Error assigning driver' });
  }
}

// ─── Admin/Driver: Update Status ──────────────────────────────────────────────

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ['assigned', 'in-transit', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const relocationRequest = await RelocationRequest.findById(req.params.id);
    if (!relocationRequest) return res.status(404).json({ message: 'Relocation request not found' });

    // Drivers can only update their own assigned requests
    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user.id });
      if (
        !driver ||
        !relocationRequest.assignedDriver ||
        driver._id.toString() !== relocationRequest.assignedDriver.toString()
      ) {
        return res.status(403).json({ message: 'Not authorized to update this request' });
      }
    }

    relocationRequest.status = status;
    if (status === 'completed') relocationRequest.completedAt = new Date();
    await relocationRequest.save();

    res.json(relocationRequest);
  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).json({ message: 'Error updating status' });
  }
}

// ─── Client/Admin: Cancel ─────────────────────────────────────────────────────

async function cancelRelocation(req, res) {
  try {
    const relocationRequest = await RelocationRequest.findById(req.params.id);
    if (!relocationRequest) return res.status(404).json({ message: 'Relocation request not found' });

    if (req.user.role === 'client' && relocationRequest.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    if (['in-transit', 'completed'].includes(relocationRequest.status)) {
      return res.status(400).json({ message: 'Cannot cancel a request that is in transit or completed' });
    }

    relocationRequest.status = 'cancelled';
    await relocationRequest.save();

    res.json({ message: 'Relocation request cancelled successfully' });
  } catch (err) {
    console.error('Cancel relocation request error:', err.message);
    res.status(500).json({ message: 'Error cancelling relocation request' });
  }
}

// ─── Admin: Audit Log for a Relocation ───────────────────────────────────────

async function getRelocationAudit(req, res) {
  try {
    const relocation = await RelocationRequest.findById(req.params.id)
      .populate('adminOverrideBy', 'fullName email')
      .populate('notifiedDrivers.driver', 'vehicleType')
      .populate({
        path: 'notifiedDrivers.driver',
        populate: { path: 'user', select: 'fullName' },
      });

    if (!relocation) return res.status(404).json({ message: 'Relocation not found' });

    res.json({
      id: relocation._id,
      assignmentMethod: relocation.assignmentMethod,
      assignedAt: relocation.assignedAt,
      selfDispatchWindowMs: relocation.selfDispatchWindowMs,
      selfDispatchExpiredAt: relocation.selfDispatchExpiredAt,
      autoAssignScore: relocation.autoAssignScore,
      adminOverrideBy: relocation.adminOverrideBy,
      adminOverrideReason: relocation.adminOverrideReason,
      notifiedDrivers: relocation.notifiedDrivers,
    });
  } catch (err) {
    console.error('Relocation audit error:', err.message);
    res.status(500).json({ message: 'Error fetching audit log' });
  }
}

module.exports = {
  getPricing,
  estimatePrice,
  createRelocation,
  getMyRelocations,
  listRelocations,
  getRelocationById,
  assignDriver,
  updateStatus,
  cancelRelocation,
  getRelocationAudit,
};