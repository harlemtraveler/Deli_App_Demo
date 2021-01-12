const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Declare a new express app
 * @type {app}
 */
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

/**
 * Enable CORS for all methods
 */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/**
 * Calculates the order total on server-side
 * @param items
 */
const calcOrderTotal = items => {};


/****************************
* Example post method *
****************************/

app.post('/charge', async (req, res) => {

  /**
   * Parsed variables from the Request body
   */
  const {
    amount,
    currency,
    description,
    receipt_email
  } = req.body;

  const {
    name,
    email
  } = req.body.charge.billing_details;

  const {
    line1,
    line2,
    city,
    address_state,
    country,
    address_zip
  } = req.body.charge.billing_details.address;

  const {
    line1: shippingLine1,
    line2: shippingLine2,
    city: shippingCity,
    address_state: shippingState,
    country: shippingCountry,
    address_zip: shippingZip
  } = req.body.shipping.address;

  const {
    name: shippingName,
    phone: shippingPhone,
    carrier,
    tracking_number
  } = req.body.shipping;

  const customerName = name;

  const { customer: { id, phone } } = req.body;

  /**
   * Creating the Payment Intent
   */
  const paymentIntent = await stripe.paymentIntents.create({
    // amount: calcOrderTotal(items),
    amount: amount,
    currency: currency || 'USD',
    shipping: {
      address: {
        line1: shippingLine1,
        line2: shippingLine2 || null,
        city: shippingCity || null,
        state: shippingState || null,
        country: shippingCountry || 'US',
        postal_code: shippingZip || null
      },
      name: name,
      carrier: null,
      phone: phone || null,
      tracking_number: null
    },
    receipt_email: receipt_email || null
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  });
});


app.listen(3000, function() {
    console.log("App started");
});


module.exports = app;
