const BigPromise = require('../middleware/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.sendStripeKey = BigPromise(async(req, res, next) => {
   console.log('sending Stripe key');
   res.status(200).json({
      stripekey: process.env.STRIPE_PUBLIC_KEY,
   });
});

exports.capturePayment = BigPromise(async(req, res, next) => {
   console.log('capturing payment');
   const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      metadata: {integration_check: 'accept_a_payment'},
   });

   res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
   });
});