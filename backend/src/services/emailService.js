const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Allow self-signed certificates in local/dev environments to avoid
    // "self-signed certificate in certificate chain" errors.
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
}

async function sendOrderArrivalEmail({ to, order }) {
  if (!to) {
    throw new Error('Missing recipient email');
  }

  const from = process.env.SMTP_FROM || 'no-reply@swiftmovers.local';

  const subject = `Your SwiftDeliver order has arrived`;

  const lines = [
    `Hello,`,
    '',
    `Your SwiftDeliver order is now marked as delivered.`,
    '',
    `Pickup: ${order.pickupAddress}`,
    `Dropoff: ${order.dropoffAddress}`,
    `Price: KES ${order.priceKes}`,
    '',
    `Thank you for using SwiftDeliver!`,
  ];

  const text = lines.join('\n');

  const transport = getTransporter();

  await transport.sendMail({
    from,
    to,
    subject,
    text,
  });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  if (!to) {
    throw new Error('Missing recipient email');
  }

  const from = process.env.SMTP_FROM || 'no-reply@swiftmovers.local';
  const subject = 'Reset your SwiftDeliver password';

  const lines = [
    'Hello,',
    '',
    'You requested to reset your SwiftDeliver password.',
    'If you did not make this request, you can ignore this email.',
    '',
    `To reset your password, click the link below or paste it into your browser:`,
    resetUrl,
    '',
    'This link will expire in 1 hour.',
  ];

  const text = lines.join('\n');

  const transport = getTransporter();

  await transport.sendMail({
    from,
    to,
    subject,
    text,
  });
}

async function sendOrderCreatedEmail({ to, clientName, order }) {
  if (!to) return;

  const from = process.env.SMTP_FROM || 'no-reply@swiftmovers.local';
  const subject = `Order Confirmation - SwiftDeliver #${order._id?.toString().slice(-6) || 'NEW'}`;

  const text = [
    `Hello ${clientName},`,
    '',
    `Your delivery order has been created successfully!`,
    '',
    `Order Details:`,
    `Pickup: ${order.pickupAddress}`,
    `Dropoff: ${order.dropoffAddress}`,
    `Service: ${order.serviceType || 'Standard'}`,
    `Price: KES ${order.priceKes}`,
    '',
    `We'll notify you once a driver is assigned.`,
    '',
    `Track your order at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/Client`,
    '',
    `Thank you for choosing SwiftDeliver!`,
  ].join('\n');

  try {
    const transport = getTransporter();
    await transport.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error('Error sending order created email:', err.message);
  }
}

async function sendOrderAssignedEmail({ to, clientName, order, driverName }) {
  if (!to) return;

  const from = process.env.SMTP_FROM || 'no-reply@swiftmovers.local';
  const subject = `Driver Assigned - SwiftDeliver #${order._id?.toString().slice(-6)}`;

  const text = [
    `Hello ${clientName},`,
    '',
    `Great news! Your order has been assigned to ${driverName}.`,
    '',
    `Order Details:`,
    `Pickup: ${order.pickupAddress}`,
    `Dropoff: ${order.dropoffAddress}`,
    `Price: KES ${order.priceKes}`,
    '',
    `Track your driver in real-time from your dashboard.`,
    '',
    `Thank you for using SwiftDeliver!`,
  ].join('\n');

  try {
    const transport = getTransporter();
    await transport.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error('Error sending order assigned email:', err.message);
  }
}

async function sendOrderInTransitEmail({ to, clientName, order, driverName }) {
  if (!to) return;

  const from = process.env.SMTP_FROM || 'no-reply@swiftmovers.local';
  const subject = `On the Way - SwiftDeliver #${order._id?.toString().slice(-6)}`;

  const text = [
    `Hello ${clientName},`,
    '',
    `${driverName} is on the way with your delivery!`,
    '',
    `Dropoff: ${order.dropoffAddress}`,
    `Recipient: ${order.recipientName || 'You'}`,
    '',
    `Track the driver's location in real-time from your dashboard.`,
    '',
    `Thank you for using SwiftDeliver!`,
  ].join('\n');

  try {
    const transport = getTransporter();
    await transport.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error('Error sending order in-transit email:', err.message);
  }
}

async function sendProfileIncompleteEmail({ to, userName, missingFields }) {
  if (!to) return;

  const from = process.env.SMTP_FROM || 'no-reply@swiftmovers.local';
  const subject = 'Complete Your SwiftDeliver Profile';

  const text = [
    `Hello ${userName},`,
    '',
    `We noticed your profile is incomplete. To enjoy the full benefits of SwiftDeliver, please complete your profile.`,
    '',
    `Missing information:`,
    ...missingFields.map(field => `- ${field}`),
    '',
    `Complete your profile at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`,
    '',
    `Thank you for being part of SwiftDeliver!`,
  ].join('\n');

  try {
    const transport = getTransporter();
    await transport.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error('Error sending profile incomplete email:', err.message);
  }
}

async function sendDriverRatingEmail({ to, driverName, rating, comment }) {
  if (!to) return;

  const from = process.env.SMTP_FROM || 'no-reply@swiftmovers.local';
  const subject = 'You Received a New Rating - SwiftDeliver';

  const stars = '⭐'.repeat(Math.round(rating));

  const text = [
    `Hello ${driverName},`,
    '',
    `Great job! You received a ${rating}/5 rating ${stars}`,
    '',
    comment ? `Feedback: "${comment}"` : '',
    '',
    `Keep up the excellent work!`,
    '',
    `View your ratings dashboard at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/DriverDashboard`,
  ].join('\n');

  try {
    const transport = getTransporter();
    await transport.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error('Error sending driver rating email:', err.message);
  }
}

async function sendDriverAcceptedEmail({
  to,
  recipientName,
  clientName,
  order,
  driver,
}) {
  if (!to) return;

  const from = process.env.SMTP_FROM || 'no-reply@swiftmovers.local';
  const trackingId = order._id?.toString().toUpperCase().slice(-8);
  const subject = `Your Delivery is On Its Way! Tracking #${trackingId}`;

  const driverFullName = driver?.user?.fullName || driver?.fullName || 'Your driver';
  const driverPhone = driver?.user?.phone || driver?.phone || '—';
  const vehicleType = driver?.vehicleType || '—';
  const plateNumber = driver?.plateNumber || '—';
  const rating = driver?.rating ? `${Number(driver.rating).toFixed(1)} / 5.0 ⭐` : '—';

  const trackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/Client`;

  const lines = [
    `Hello ${recipientName || 'there'},`,
    '',
    `Great news! A delivery is on its way to you from ${clientName || 'a SwiftDeliver customer'}.`,
    '',
    '─────────────────────────────',
    '  TRACKING INFORMATION',
    '─────────────────────────────',
    `  Tracking Number : #${trackingId}`,
    `  Pickup Address  : ${order.pickupAddress}`,
    `  Delivery Address: ${order.dropoffAddress}`,
    `  Service Type    : ${order.serviceType || 'Standard'}`,
    '',
    '─────────────────────────────',
    '  YOUR DRIVER',
    '─────────────────────────────',
    `  Name            : ${driverFullName}`,
    `  Phone           : ${driverPhone}`,
    `  Vehicle Type    : ${vehicleType}`,
    `  Plate Number    : ${plateNumber}`,
    `  Driver Rating   : ${rating}`,
    '',
    '─────────────────────────────',
    '',
    `You can track your delivery in real time at:`,
    trackUrl,
    '',
    `If you have questions, please contact us or call your driver directly on ${driverPhone}.`,
    '',
    'Thank you for choosing SwiftDeliver!',
    'The SwiftDeliver Team',
  ];

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from,
      to,
      subject,
      text: lines.join('\n'),
    });
  } catch (err) {
    console.error('Error sending driver-accepted email to recipient:', err.message);
  }
}

module.exports = {
  sendOrderArrivalEmail,
  sendPasswordResetEmail,
  sendOrderCreatedEmail,
  sendOrderAssignedEmail,
  sendOrderInTransitEmail,
  sendProfileIncompleteEmail,
  sendDriverRatingEmail,
  sendDriverAcceptedEmail,
};
