import React,{ useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import AWS from 'aws-sdk';
// Material UI Styles
import {
  withStyles,
  makeStyles,
  ThemeProvider,
  createMuiTheme
} from '@material-ui/core/styles';
// Material UI Colors
import {
  green,
  purple
} from '@material-ui/core/colors';
// Material UI Icons
import PaymentRoundedIcon from '@material-ui/icons/PaymentRounded';
import AttachMoneyRoundedIcon from '@material-ui/icons/AttachMoneyRounded';
import MonetizationOnRoundedIcon from '@material-ui/icons/MonetizationOnRounded';
import CancelPresentationRoundedIcon from '@material-ui/icons/CancelPresentationRounded';
// Material UI Core
import {
  Grid,
  Dialog,
  Button,
  Divider,
  TextField,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@material-ui/core';
// Element React Imports
import { Notification, Message } from 'element-react';
// Stripe imports
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
// ENV Imports
import config from '../config';
// Util Imports
import {
  getOwnerEmail,
  createShippingAddress,
  convertCentsToDollars
} from '../utils';
import emailHandler from '../utils/emailHandler';
// GraphQL Imports
import { createOrder } from '../graphql/mutations';
// Component Imports
import { history } from '../App';

const awsconfig = {
  accessKeyId: config.awsConfig.accessKeyId,
  secretAccessKey: config.awsConfig.secretAccessKey,
  region: config.awsConfig.region,
  adminEmail: config.awsConfig.adminEmail,
};

const ses = new AWS.SES(awsconfig);

const Checkout = ({ product, user, userAttributes }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [shippingName, setShippingName] = useState('');
  const [address, setAddress] = useState({
    line1: null,
    line2: null,
    city: null,
    state: null,
    country: 'US',
    postal_code: null
  });
  const [shipping, setShipping] = useState({
    carrier: null,
    phone: null,
    tracking_number: null
  });

  const stripe = useStripe();
  const elements = useElements();

  /*************************
  * Toggle Dialog Modal    *
  *************************/
  const toggleDialog = () => {
    openDialog ? setOpenDialog(false) : setOpenDialog(true);
  };

  /*******************************
  * Handle Card Detail Change    *
  *******************************/

  const handleCardDetailsChange = e => {
    e.error ? setError(e.error.message) : setError(null);
  };

  /*******************************
  * Handle Form Detail Change    *
  *******************************/
  const handleAddressChange = e => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingNameChange = e => {
    setShippingName({
      ...shippingName,
      [e.target.name]: e.target.value
    });
  };

  /*************************
  * Handle Form Submit     *
  *************************/
  const handleFormSubmit = async e => {
    e.preventDefault();
    console.log('[+] Form submit successfully triggers handleFormSubmit().');
    console.log('[+] Current value of the "processing" State property', processing);
    setProcessing(true);

    const cardElement = elements.getElement('card');

    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      const body = {
        currency: 'usd',
        amount: product.price,
        description: product.description,
        charge: {
          currency: 'usd',
          amount: product.price,
          billing_details: {
            address: {
              line1: '',
              line2: '',
              city: '',
              state: '',
              country: 'US',
              postal_code: ''
            },
            name: userAttributes.sub,
            email: userAttributes.email
          }
        },
        shipping: {
          name: shippingName,
          address: {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            country: address.country,
            postal_code: address.postal_code
          },
          phone: shipping.phone,
          carrier: shipping.carrier,
          tracking_number: shipping.tracking_number
        },
        email: {
          customerEmail: userAttributes.email,
          ownerEmail,
          delivery: product.delivery
        },
        receipt_email: userAttributes.email,
        customer: {
          id: userAttributes.sub,
          // TODO: Go into the Cognito and see if possible to config user attributes to include phone number
          phone: '18666666666'
        }
      };
      const result = await API.post('stripeAPI', '/charge', { body });
      console.log(result);
      const client_secret = result.clientSecret;
      console.log(client_secret);

      // format the shipping address
      let shippingAddress = null;
      if (product.delivery) {
        shippingAddress = await createShippingAddress(body);
        console.log(shippingAddress);
      };

      // create the stripe PaymentMethod via the Stripe sdk
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: body.charge.billing_details.name,
          email: body.charge.billing_details.email,
          address: body.charge.billing_details.address
        }
      });

      // initiate the stripe Payment Intent process
      if (!error) {
        try {
          const { id } = paymentMethod;
          const { paymentIntent: paymentIntentObj } = await stripe.confirmCardPayment(client_secret, { payment_method: id });
          const { error, status } = paymentIntentObj;

          if (status === 'succeeded') {
            const input = {
              orderUserId: userAttributes.sub,
              orderProductId: product.id,
              deliveryAddress: {
                city: body.shipping.address.city,
                country: body.shipping.address.country,
                address_line1: body.shipping.address.line1,
                address_state: body.shipping.address.state,
                address_zip: body.shipping.address.postal_code
              },
              order_status: 'paid'
            };

            const order = await API.graphql(graphqlOperation(createOrder, { input }));

            Notification({
              title: 'Success',
              message: `Payment Successful!`,
              type: 'success',
              duration: 3000
            });

            setTimeout(() => {
              history.push('/');
              Message({
                type:'info',
                message: 'Check your verified email for order details.',
                duration: 5000,
                showClose: true
              });
            }, 3000);
          }

          if (!error) {
            // TODO: remove the "console.log()" below in prod
            console.log({ body });
            const sendEmail = await emailHandler(body);
            sendEmail ? console.log('[+] Email handler success!') : console.error(sendEmail);
            toggleDialog();
          }

        } catch (err) {
          console.error('[!] Error when confirming payment.', err);
        }
      }

    } catch (err) {
      console.error('[!] Error when checking out.', err);
      setProcessing(false);
    }
  };

  /****************************
  * Stripe Element Styling    *
  ****************************/
  const cardElementOpts = {
    iconStyle: 'solid',
    hidePostalCode: true
  };

  /*******************************
  * MaterialUI Custom Styling    *
  *******************************/
  const theme = createMuiTheme({
    palette: {
      primary: green,
    },
  });

  return (
    <div className={'card-container'}>
      <ThemeProvider theme={theme}>
        <Button
          color={'primary'}
          variant={'contained'}
          onClick={toggleDialog}
          startIcon={<MonetizationOnRoundedIcon style={{ color: '#fff' }} />}
        >
          {` $${convertCentsToDollars(product.price)}`}
        </Button>
      </ThemeProvider>

      <Dialog
        maxWidth={'md'}
        fullWidth={true}
        open={openDialog}
        customClass={'dialog'}
        onCancel={toggleDialog}
        title={'Purchase Product'}
      >
        <DialogTitle>Enter Your Payment Details</DialogTitle>
        <DialogContent dividers={true}>
          <form id={'payment-form'} onSubmit={handleFormSubmit}>

            {/* INPUT FIELD SECTION */}
            <Grid>
              <TextField
                fullWidth
                id={'name'}
                name={'name'}
                label={'Name'}
                autoComplete={'given-name'}
                onChange={handleShippingNameChange}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                id={'line1'}
                name={'line1'}
                label={'Address'}
                autoComplete={'shipping street-address'}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                id={'city'}
                name={'city'}
                label={'City'}
                autoComplete={'shipping address-level2'}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                id={'stae'}
                name={'state'}
                label={'State'}
                autoComplete={'shipping address-level1'}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                id={'postal_code'}
                name={'postal_code'}
                label={'Zip'}
                autoComplete={'shipping postal-code'}
                onChange={handleAddressChange}
              />
            </Grid>

            {/* CARD ELEMENT */}
            <CardElement options={cardElementOpts} onChange={handleCardDetailsChange} />

          </form>
        </DialogContent>

        <DialogActions>
          {/* SUBMIT/CANCEL BUTTON */}
          <Button
            color={'secondary'}
            variant={'contained'}
            onClick={toggleDialog}
            startIcon={<CancelPresentationRoundedIcon style={{ color: "#fff" }} />}
          >
            Cancel
          </Button>
          <Button
            type={'submit'}
            color={'primary'}
            form={'payment-form'}
            variant={'contained'}
            disabled={processing || !stripe}
            startIcon={<PaymentRoundedIcon style={{ color: "#fff" }} />}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );

}

export default Checkout;