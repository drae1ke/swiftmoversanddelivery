const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
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

module.exports = {
  sendOrderArrivalEmail,
  sendPasswordResetEmail,
};
