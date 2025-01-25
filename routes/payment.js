const express = require('express');
const router = express.Router();

const {
   sendStripeKey,
   capturePayment,
} = require('../controller/paymentController');


// bring middleware to make payments
const {isLoggedIn} = require('../middleware/user');

// payment routes
router.route('/stripekey').get(isLoggedIn, sendStripeKey);  // Stripe public key endpoint
router.route('/capturestripe').post(isLoggedIn, capturePayment);  // Capture payment endpoint

module.exports = router;
