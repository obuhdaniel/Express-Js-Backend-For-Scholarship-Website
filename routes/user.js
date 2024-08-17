// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming you have a User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Payment = require("../models/Payment");
const auth = require("../middlewares/auth");
const UserPaymentReference = require("../models/UserPaymentReference")

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
    const userId = req.user.sub; 
    
    const userEmail = req.user.email;

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
          email: userEmail,
        },
      });
    }

    // Extract amount from request body or set a default
    const { amount = '150000' } = req.body;

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
      email: userEmail,
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


router.post('/update-payment-status', auth2, async (req, res) => {
  try {
    // Extract userId and referenceNumber from request body
    const { userId, referenceNumber } = req.body;

    // Validate input
    if (!userId || !referenceNumber) {
      return res.status(400).json({ message: 'User ID and reference number are required' });
    }

    // Find the UserPaymentReference record
    let userPaymentReference = await UserPaymentReference.findOne({
      where: {
        userId,
        referenceNumber,
      },
    });

    if (!userPaymentReference) {
      // Create a new UserPaymentReference record if not found
      userPaymentReference = await UserPaymentReference.create({
        userId,
        referenceNumber,
      });

      console.log('New UserPaymentReference created:', userPaymentReference);
    }


    // Generate the application number based on userId
    const applicationNumber = generateApplicationNumber(userId);

    // Find the payment record using userId and applicationNumber
    const payment = await Payment.findOne({
      where: {
        userId,
        applicationNumber,
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status to 'success'
    payment.status = 'success';
    await payment.save();

    // Respond with success message
    res.status(200).json({
      message: 'Payment status updated to success',
      paymentData: {
        applicationNumber: payment.applicationNumber,
        userId: payment.userId,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server error' });
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
