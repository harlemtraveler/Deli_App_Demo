const dotenv = require('dotenv').config();

// config() will read your .env file, parse the contents, assign it to process.env
// const envFound = dotenv.config();

// if (envFound.error) {
//   // This error should crash whole process
//   throw new Error("⚠️  Couldn't find .env file  ⚠️");
// }

export default {
  awsConfig: {
    /**
     * AWS Region
     */
    region: process.env.REACT_APP_REGION,

    /**
     * AWS Administrator Email
     */
    adminEmail: process.env.REACT_APP_ADMIN_EMAIL,

    /**
     * AWS Access Key ID
     */
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,

    /**
     * AWS Secret Access Key
     */
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
  },
  stripeConfig: {
    /**
     * Stripe Publishable Key (dev credentials)
     */
    pubKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  },
  userCred: {
    /**
     * Admin Cognito User Attr - "sub"
     */
    adminId: process.env.REACT_APP_ADMIN_USER_ID,
  },
}