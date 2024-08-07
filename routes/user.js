// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming you have a User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Payment = require("../models/Payment");
const auth = require("../middlewares/auth");

const { sendWelcomeEmail } = require("../middlewares/emailsServices");

require("dotenv").config();

const generateApplicationNumber = (userID) => {
  return `DALGO/2024/${1000 + userID}`;
};

const auth2 = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Assumes token is sent in "Bearer <token>" format
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    req.user = user; // Attach user info to the request object
    next();
  });
};

router.get('/pay', auth2, async (req, res) => {
  try {
    const userId = req.user.sub; // Access user ID from the JWT token

    // Find the user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate application number for the payment
    const applicationNumber = generateApplicationNumber(userId);

    // Check for existing payment
    const existingPayment = await Payment.findOne({
      where: { applicationNumber },
    });

    if (existingPayment) {
      console.log('Existing payment found:', existingPayment);
      // Respond with existing payment data and status code 200 (OK) 
      return res.status(200).json({
        message: 'Payment already initiated',
        paymentData: {
          applicationNumber: existingPayment.applicationNumber,
          fullName: `${user.surname} ${user.firstname}`,
          amount: existingPayment.amount,
          status: existingPayment.status,
        },
      });
    }

    // Extract amount from request body or set a default
    const { amount = '3500' } = req.body;

    // Validate amount (ensure it's a number and positive)
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid amount specified' });
    }

    // Create a new payment record
    const payment = await Payment.create({
      applicationNumber,
      userId,
      amount: parseFloat(amount), // Ensure amount is stored as a number
      status: 'pending',
    });

    // Prepare data for payment gateway
    const paymentData = {
      applicationNumber: payment.applicationNumber,
      fullName: `${user.surname} ${user.firstname}`,
      amount: payment.amount,
      status: payment.status,
    };

    // TODO: Integrate with payment gateway here
    // For example, you might need to send `paymentData` to an external payment service

    res.status(201).json({
      message: 'Payment initiated successfully',
      paymentData,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/initiate-payment', auth2, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { amount } = req.body; // Ensure amount is provided

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const applicationNumber = generateApplicationNumber(userId);

    // Create a new payment record
    const payment = await Payment.create({
      applicationNumber,
      userId,
      amount,
      status: 'pending', // Initial status
    });

    // Prepare data for payment gateway
    const paymentGatewayUrl = `https://paymentgateway.com/pay?amount=${payment.amount}&applicationNumber=${payment.applicationNumber}&callbackUrl=${encodeURIComponent('http://yourdomain.com/payment-callback')}`;

    res.redirect(paymentGatewayUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Payment Route
router.post("/pay", auth, async (req, res) => {
  const userId = req.session.userId;
  const amount = "5000";

  try {
    // Fetch user information
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate unique application number
    const applicationNumber = generateApplicationNumber(userId);

    // Use findOne with a query object to search for the application number
    const existingPayment = await Payment.findOne({
      applicationNumber: applicationNumber,
    });

    if (existingPayment) {
      console.log("Application number already exists:", existingPayment);
      res.status(500).send("You have already initiated Payment transaction");
      res.json(existingPayment);
      return;
    } else {
      // Create a new payment record
      const payment = await Payment.create({
        applicationNumber,
        userId,
        amount,
        status: "pending",
      });

      // Prepare data for payment gateway
      const paymentData = {
        applicationNumber: payment.applicationNumber,
        fullName: `${user.surname} ${user.firstname}`,
        amount: payment.amount,
        status: payment.status,
      };

      // TODO: Integrate with payment gateway here

      res.status(201).json({
        message: "Payment initiated successfully",
        paymentData,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Login route
router.get("/register", (req, res) => {
  res.send("You are in the registration process");
});
// User Registration
router.post("/register", async (req, res) => {
  const { surname, firstname, email, password } = req.body;

  if (!surname || !firstname || !email || !password) {
    return res
      .status(400)
      .json({
        message:
          "Please provide all required fields: surname, firstname, email, and password",
      });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    user = await User.create({
      surname,
      firstname,
      email,
      password: hashedPassword,
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstname);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Seems You dont have an account" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // Generate JWT
    const payload = { userId: user.id };

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.surname,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    req.session.userId = user.id;
    console.log(user.id);
    req.session.email = user.email;

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Server error");
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});
module.exports = router;
