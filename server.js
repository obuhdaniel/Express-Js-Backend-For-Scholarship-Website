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


console.log('Starting the server...');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));


const sessionConfig = {
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true for https connections
}

app.use(session(sessionConfig));

console.log('Configuring routes...');
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users/info', infoRoutes);

app.get('/', (req, res) => {
  res.send('Scholarship Exam API');
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
