import React from "react";
import AWS from 'aws-sdk';
import { Notification } from 'element-react';
import { convertCentsToDollars } from './index';
import config from '../config';

const awsconfig = {
  accessKeyId: config.awsConfig.accessKeyId,
  secretAccessKey: config.awsConfig.secretAccessKey,
  region: config.awsConfig.region,
  adminEmail: config.awsConfig.adminEmail,
};

const ses = new AWS.SES(awsconfig);

export const emailHandler = async chargeObj => {
  const { currency, amount, description } = chargeObj;
  const {
    charge: {
      delivery,
      ownerEmail,
      customerEmail
    }
  } = chargeObj;
  const { billing_details: { name, email } } = chargeObj.charge;
  const {
    name: shippingName,
    phone: shippingPhone,
    carrier,
    tracking_number
  } = chargeObj.shipping;
  const {
    address: {
      line1,
      line2,
      city,
      state,
      country,
      postal_code
    }
  } = chargeObj.shipping;

  ses.sendEmail({
    Source: awsconfig.adminEmail,
    ReturnPath: awsconfig.adminEmail,
    Destination: {
      ToAddresses: [awsconfig.adminEmail]
    },
    Message: {
      Subject: {
        Data: 'Order Details - Your Favorite Deli'
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
          <h3>Order Processed</h3>
          <p><span>${description}</span> - $${convertCentsToDollars(amount)} - (${currency.toUpperCase()})</p>
          
          <p>Customer Email: ${customerEmail}</p>
          <p>Contact your seller: <a href="mailto:${ownerEmail}">${ownerEmail}</a></p>
          
          ${
            delivery ? `
              <h4>Delivery Address</h4>
              <p>${shippingName}</p>
              <p>${line1}</p>
              <p>${city}, ${state} ${postal_code}</p>
            ` : 'Ordered for takeout'
          }
          
          <p>${
            delivery ? 
              'Your order is being prepared and will be delivered soon!' 
              : 'Your takeout order is being prepared and will be ready for pickup soon!'
          }</p>
          
          `
        }
      }
    }
  }, (err, data) => {
    if (err) {
      console.error(`The call to SES failed - see returned error: `, err);
      Notification.error({
        title: 'Error',
        message: `${err.message || 'Email failed to send.'}`
      });
    }
    Notification({
      title: 'Success',
      message: 'Order processed successfully!',
      type: 'success'
    });
    // setTimeout(() => window.location.reload(), 3000);
  });
};

export default emailHandler;