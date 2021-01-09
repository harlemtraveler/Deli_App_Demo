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
import {
  PaymentRoundedIcon,
  AttachMoneyRoundedIcon,
  MonetizationOnRoundedIcon,
  CancelPresentationRoundedIcon
} from '@material-ui/icons';
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
// Stripe imports
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
// ENV Imports
import config from './config';
// Util Imports
import {
  getOwnerEmail,
  createShippingAddress,
  convertCentsToDollars
} from '../utils';
// Component Imports
import { history } from "../App";

const awsconfig = {
  accessKeyId: config.awsConfig.accessKeyId,
  secretAccessKey: config.awsConfig.secretAccessKey,
  region: config.awsConfig.region,
  adminEmail: config.awsConfig.adminEmail,
};

const ses = new AWS.SES(awsconfig);

const Checkout = ({ product, user }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [address, setAddress] = useState({
    line1: null,
    line2: null,
    city: null,
    state: null,
    country: "US",
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
    setProcessing(true);

    const cardElement = elements.getElement("card");

    try {
      // TODO: Add form submission logic here...
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
              country: '',
              postal_code: ''
            },
            name: user.attributes.sub,
            email: user.attributes.email
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
          customerEmail: user.attributes.email,
          ownerEmail,
          delivery: product.delivery
        },
        receipt_email: user.attributes.email,
        customer: {
          id: user.attributes.sub,
          phone: '18666666666'
        }
      };
      // TODO: Create a new API & Lambda to perform the card charge logic,
      //  then make POST req passing it the "body" Obj as parameter.
    } catch (err) {
      console.error(err);
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