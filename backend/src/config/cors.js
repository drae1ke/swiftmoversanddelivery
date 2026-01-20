const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  // Vite dev server
  // Add your production frontend URL here, e.g. 'https://swiftmovers.example.com'
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: false,
};

module.exports = corsOptions;
