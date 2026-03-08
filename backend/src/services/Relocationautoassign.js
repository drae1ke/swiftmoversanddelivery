/**
 * relocationAutoAssign.js
 *
 * Fair, bias-free driver assignment for relocation requests.
 *
 * Priority order (no human decision-making):
 *   Tier 1 – Self-dispatch:   Driver sees the job and accepts it themselves
 *   Tier 2 – Auto-assign:     Algorithm picks the best match after window expires
 *   Tier 3 – Admin override:  Emergency only, fully audited, restricted by time window
 *
 * Scoring algorithm (higher = better match):
 *   - Distance to pickup:    closer = more points  (max 40 pts)
 *   - Workload balance:      fewer active jobs = more points  (max 30 pts)
 *   - Last job completed:    longer ago = more points  (max 20 pts, prevents monopoly)
 *   - Rating:                higher = more points  (max 10 pts, tiebreaker only)
 */

const Driver = require('../models/Driver');
const RelocationRequest = require('../models/Relocationrequest');
const { createNotification } = require('./notificationService');
const { getIO } = require('./socketService');

// Self-dispatch window: drivers have 30 minutes to self-assign
// before auto-assign kicks in. For Express/Same Day jobs: 15 min.
const SELF_DISPATCH_WINDOW_MS = {
  Standard: 30 * 60 * 1000,
  'Same Day': 15 * 60 * 1000,
  Express: 10 * 60 * 1000,
};

/**
 * Calculate the Haversine distance between two [lng, lat] coordinate pairs (km).
 */
function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Score a candidate driver against a relocation request.
 * Returns a number 0–100. Higher = better fit.
 */
async function scoreDriver(driver, relocation) {
  let score = 0;

  // ── Distance score (40 pts) ───────────────────────────────────────────────
  const driverCoords = driver.location?.coordinates;
  const pickupCoords = relocation.pickupCoordinates?.coordinates;

  if (driverCoords && pickupCoords && (driverCoords[0] !== 0 || driverCoords[1] !== 0)) {
    const distKm = haversineKm(driverCoords, pickupCoords);
    // 0 km → 40 pts, 50+ km → 0 pts (linear decay)
    score += Math.max(0, 40 - (distKm / 50) * 40);
  } else {
    // No GPS data: give average distance score so they're not permanently penalised
    score += 20;
  }

  // ── Workload balance (30 pts) ─────────────────────────────────────────────
  // Count active jobs (assigned + in-transit) for this driver
  const [activeOrders, activeRelocations] = await Promise.all([
    require('../models/Order').countDocuments({
      driver: driver._id,
      status: { $in: ['assigned', 'in-transit'] },
    }),
    RelocationRequest.countDocuments({
      assignedDriver: driver._id,
      status: { $in: ['assigned', 'in-transit'] },
    }),
  ]);
  const totalActive = activeOrders + activeRelocations;
  // 0 active → 30 pts, 5+ active → 0 pts
  score += Math.max(0, 30 - totalActive * 6);

  // ── Recency / fairness (20 pts) ───────────────────────────────────────────
  // Find their most recently completed relocation
  const lastReloc = await RelocationRequest.findOne({
    assignedDriver: driver._id,
    status: 'completed',
  }).sort({ completedAt: -1 });

  if (!lastReloc) {
    // Never done a relocation – give them priority to build experience
    score += 20;
  } else {
    const hoursSince = (Date.now() - lastReloc.completedAt.getTime()) / (1000 * 60 * 60);
    // 24+ hrs ago → full 20 pts; just finished → 0 pts
    score += Math.min(20, (hoursSince / 24) * 20);
  }

  // ── Rating tiebreaker (10 pts) ────────────────────────────────────────────
  const rating = driver.rating || driver.averageRating || 5;
  score += (rating / 5) * 10;

  return Math.round(score * 10) / 10;
}

/**
 * Find all eligible drivers for a relocation request.
 * Eligible = online + correct vehicle type + no current active relocation.
 */
async function findEligibleDrivers(relocation) {
  const drivers = await Driver.find({
    isOnline: true,
    vehicleType: relocation.vehicleType,
  }).populate('user', 'fullName phone');

  // Filter out drivers who already have an active relocation (they're busy moving)
  const eligible = [];
  for (const driver of drivers) {
    const busyWithReloc = await RelocationRequest.countDocuments({
      assignedDriver: driver._id,
      status: { $in: ['assigned', 'in-transit'] },
    });
    if (busyWithReloc === 0) {
      eligible.push(driver);
    }
  }
  return eligible;
}

/**
 * Notify all eligible drivers about a new relocation job via socket + in-app notification.
 * Records which drivers were notified for audit purposes.
 */
async function notifyEligibleDrivers(relocation, drivers) {
  const io = getIO();
  const notifiedEntries = [];

  for (const driver of drivers) {
    // In-app notification
    if (driver.user) {
      await createNotification({
        userId: driver.user._id,
        type: 'new_relocation',
        title: '🏠 New Relocation Job Available',
        message: `Move from ${relocation.pickupAddress} → ${relocation.destinationAddress} on ${new Date(relocation.scheduledDate).toLocaleDateString()}. KES ${relocation.price.toLocaleString()}`,
        data: { relocationId: relocation._id },
        actionUrl: `/driver/relocations/${relocation._id}`,
        priority: 'high',
      }).catch(() => {}); // non-blocking
    }

    // Real-time socket push
    if (io) {
      io.to('drivers').emit('new_relocation', {
        relocationId: relocation._id,
        pickupAddress: relocation.pickupAddress,
        destinationAddress: relocation.destinationAddress,
        scheduledDate: relocation.scheduledDate,
        vehicleType: relocation.vehicleType,
        price: relocation.price,
        distanceKm: relocation.distanceKm,
        serviceType: relocation.serviceType,
        expiresAt: new Date(Date.now() + (SELF_DISPATCH_WINDOW_MS[relocation.serviceType] || SELF_DISPATCH_WINDOW_MS.Standard)),
      });
    }

    notifiedEntries.push({
      driver: driver._id,
      notifiedAt: new Date(),
      responded: false,
    });
  }

  // Persist the notification audit trail
  await RelocationRequest.findByIdAndUpdate(relocation._id, {
    $push: { notifiedDrivers: { $each: notifiedEntries } },
  });
}

/**
 * Run the auto-assign algorithm.
 * Called after the self-dispatch window expires with no taker.
 * Scores all eligible drivers and assigns the highest scorer.
 */
async function runAutoAssign(relocationId) {
  const relocation = await RelocationRequest.findById(relocationId);
  if (!relocation) return;

  // Don't auto-assign if already taken or cancelled
  if (relocation.status !== 'pending' || relocation.assignedDriver) {
    console.log(`[AutoAssign] Relocation ${relocationId} already handled, skipping.`);
    return;
  }

  console.log(`[AutoAssign] Running for relocation ${relocationId}...`);

  const eligible = await findEligibleDrivers(relocation);
  if (eligible.length === 0) {
    console.log(`[AutoAssign] No eligible drivers for relocation ${relocationId}. Leaving pending.`);
    // Notify admin that manual intervention is needed
    const io = getIO();
    if (io) {
      io.to('admin').emit('relocation_needs_attention', {
        relocationId: relocation._id,
        reason: 'No eligible drivers available after self-dispatch window expired.',
        pickupAddress: relocation.pickupAddress,
        scheduledDate: relocation.scheduledDate,
      });
    }
    return;
  }

  // Score all candidates
  const scored = await Promise.all(
    eligible.map(async (driver) => ({
      driver,
      score: await scoreDriver(driver, relocation),
    }))
  );

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);
  const winner = scored[0];

  console.log(
    `[AutoAssign] Winner: ${winner.driver.user?.fullName || winner.driver._id} ` +
    `(score: ${winner.score})`
  );

  // Assign atomically - use findOneAndUpdate with status check to prevent race conditions
  const updated = await RelocationRequest.findOneAndUpdate(
    { _id: relocationId, status: 'pending', assignedDriver: null },
    {
      $set: {
        assignedDriver: winner.driver._id,
        status: 'assigned',
        assignmentMethod: 'auto-assign',
        assignedAt: new Date(),
        autoAssignScore: winner.score,
        selfDispatchExpiredAt: new Date(),
      },
    },
    { new: true }
  ).populate('client', 'fullName email phone');

  if (!updated) {
    console.log(`[AutoAssign] Relocation ${relocationId} was taken by another driver during scoring.`);
    return;
  }

  // Notify the winning driver
  if (winner.driver.user) {
    await createNotification({
      userId: winner.driver.user._id,
      type: 'relocation_auto_assigned',
      title: '📦 Relocation Job Assigned to You',
      message: `You've been automatically matched to a move: ${relocation.pickupAddress} → ${relocation.destinationAddress}`,
      data: { relocationId: relocation._id },
      actionUrl: `/driver/relocations/${relocation._id}`,
      priority: 'high',
    }).catch(() => {});

    const io = getIO();
    if (io) {
      io.to('drivers').emit('relocation_auto_assigned', {
        driverId: winner.driver._id.toString(),
        relocationId: relocation._id,
        pickupAddress: relocation.pickupAddress,
        destinationAddress: relocation.destinationAddress,
        scheduledDate: relocation.scheduledDate,
        price: relocation.price,
      });
    }
  }

  // Notify client their move is confirmed
  if (updated.client) {
    await createNotification({
      userId: updated.client._id,
      type: 'relocation_assigned',
      title: '✅ Driver Confirmed for Your Move',
      message: `A driver has been matched for your relocation on ${new Date(relocation.scheduledDate).toLocaleDateString()}.`,
      data: { relocationId: relocation._id },
      actionUrl: `/relocations/${relocation._id}`,
      priority: 'high',
    }).catch(() => {});
  }

  return updated;
}

/**
 * Called immediately after a new relocation is created.
 * 1. Finds eligible drivers and notifies them (self-dispatch window opens).
 * 2. Schedules the auto-assign job to run after the window expires.
 */
async function initiateSelfDispatchWindow(relocation) {
  const windowMs = SELF_DISPATCH_WINDOW_MS[relocation.serviceType] || SELF_DISPATCH_WINDOW_MS.Standard;

  // Update the window expiry on the record
  await RelocationRequest.findByIdAndUpdate(relocation._id, {
    selfDispatchWindowMs: windowMs,
  });

  // Find and notify eligible drivers
  const eligible = await findEligibleDrivers(relocation);
  if (eligible.length > 0) {
    await notifyEligibleDrivers(relocation, eligible);
    console.log(
      `[SelfDispatch] Notified ${eligible.length} drivers for relocation ${relocation._id}. ` +
      `Window: ${windowMs / 60000} minutes.`
    );
  } else {
    console.log(`[SelfDispatch] No eligible drivers online for relocation ${relocation._id}. Will auto-assign when drivers come online.`);
  }

  // Schedule auto-assign after window expires
  // NOTE: In production, replace setTimeout with a proper job queue (Bull, Agenda, etc.)
  // setTimeout works fine for single-server deployments.
  setTimeout(async () => {
    try {
      await runAutoAssign(relocation._id.toString());
    } catch (err) {
      console.error(`[AutoAssign] Error running auto-assign for ${relocation._id}:`, err.message);
    }
  }, windowMs);
}

/**
 * Check if an admin override is allowed.
 * Admins can only manually assign when:
 *   (a) The relocation is still pending (not already taken)
 *   (b) It's within ADMIN_OVERRIDE_WINDOW_HOURS of the scheduled date
 *       OR the self-dispatch window has expired
 */
const ADMIN_OVERRIDE_WINDOW_HOURS = 4; // Within 4 hours of scheduled move

async function canAdminOverride(relocation) {
  if (relocation.status !== 'pending') {
    return { allowed: false, reason: 'Relocation is no longer pending.' };
  }

  const now = Date.now();
  const scheduledMs = new Date(relocation.scheduledDate).getTime();
  const hoursUntilMove = (scheduledMs - now) / (1000 * 60 * 60);
  const windowExpiry = relocation.createdAt.getTime() + (relocation.selfDispatchWindowMs || SELF_DISPATCH_WINDOW_MS.Standard);
  const windowExpired = now > windowExpiry;

  if (hoursUntilMove <= ADMIN_OVERRIDE_WINDOW_HOURS || windowExpired) {
    return { allowed: true };
  }

  const minutesUntilAllowed = Math.ceil((windowExpiry - now) / 60000);
  return {
    allowed: false,
    reason: `Self-dispatch window is still open. Admin override available in ~${minutesUntilAllowed} minutes, or when the move is within ${ADMIN_OVERRIDE_WINDOW_HOURS} hours.`,
  };
}

module.exports = {
  initiateSelfDispatchWindow,
  runAutoAssign,
  canAdminOverride,
  findEligibleDrivers,
  scoreDriver,
  SELF_DISPATCH_WINDOW_MS,
};