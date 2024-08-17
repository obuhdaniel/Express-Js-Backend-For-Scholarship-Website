// server.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store); // Add this line
const sequelize = require('./config/database');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');
const examRoutes = require('./routes/exam');
const cors = require('cors');
const infoRoutes = require('./routes/info');
const institutionDataRoutes = require('./routes/institution_details');
const BankDetailsRoutes = require('./routes/bankDetails');
const AcknowledgementRoutes = require('./routes/acknowledgement');
const path = require('path');
const UserPaymentReference = require('./models/UserPaymentReference'); // Import your model



console.log('Starting the server...');

const app = express();
app.use(bodyParser.json());
const allowedOrigins = [
  'http://localhost:5173',
  'http://example.com',
  'https://thealgorithm.onrender.com/',
  '*',
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: 'your_secret_key',
  store: new SequelizeStore({
    db: sequelize,
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));




console.log('Configuring routes...');
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users/info', infoRoutes);
app.use('/api/users/institution-data', institutionDataRoutes);
app.use('/api/users/bank', BankDetailsRoutes);
app.use('/api/users/acknowledgement', AcknowledgementRoutes); // Add this line to include the acknowledgement route





// INTEGRATING FRONTEND ON SAME SERVER

app.use(express.static(path.join(__dirname, './dist')));

// Serve the index.html file for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist', 'index.html'));
});





















const PORT = process.env.PORT || 3001;

console.log('Syncing database...');


sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
