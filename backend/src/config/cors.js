const allowedOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://localhost:5000',
    // Add your production frontend URL here, e.g. 'https://swiftmovers.example.com'
];

const corsOptions = {
   origin : (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
       
    },
     optionSuccessStatus: 200,
     methods: ['GET', 'POST', 'PUT',"PATCH", 'DELETE', 'OPTIONS'],
     credentials: false,
     
};

module.exports = corsOptions;
