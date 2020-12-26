import React, { useState, useEffect } from 'react';
import { Auth, Hub } from 'aws-amplify';
import clsx from 'clsx';
//** MaterialUI Imports **//
import { createMuiTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import {
  Grid,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

const initialFormState = {
  username: "", password: "", email: "", authCode: "", formType: "signUp"
};

export default function FormCard () {
  const [user, updateUser] = useState(null);
  const [formState, updateFormState] = useState(initialFormState);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    checkUser();
    setAuthListener();
  });

  const checkUser = async () => {
    try {
      const result = await Auth.currentAuthenticatedUser();
      updateUser(result);
      updateFormState(() => ({ ...formState, formType: "signedIn" }));
    } catch (err) {
      // TODO: is the below line of code required for security?
      // updateUser(null);
      console.error(err);
    }
  };

  const setAuthListener = async () => {
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signIn':
          console.log('[+] User signed in.');
          break;
        case 'signOut':
          updateFormState(() => ({ ...formState, formType: "signedOut" }));
          break;
        default:
          return;
      }
    });
  };

  const onChange = e => {
    e.persist();
    updateFormState(() => ({ ...formState, [e.target.name]: e.target.value }))
  };

  const { formType } = formState;

  /************************************
   * Amplify Auth Component Methods   *
   ************************************/
  const signUp = async () => {
    const { username, email, password } = formState;
    try {
      await Auth.signUp({ username, password, attributes: { email } });
      updateFormState(() => ({ ...formState, formType: "confirmSignUp" }));
    } catch (err) {
      console.error('[!] Error signing up.', err);
    }
  };

  const confirmSignUp = async () => {
    const { username, authCode } = formState;
    try {
      await Auth.confirmSignUp(username, authCode);
      updateFormState(() => ({ ...formState, formType: "signIn" }));
    } catch (err) {
      console.error('[!] Error confirming sign up', err);
    }
  };

  const signIn = async () => {
    const { username, password } = formState;
    try {
      await Auth.signIn(username, password);
      updateFormState(() => ({ ...formState, formType: "signedIn" }));
    } catch (err) {
      console.error('[!] Error signing in.', err);
    }
  };

  // const confirmSignIn = async () => {};

  const signOut = async () => {
    Auth.signOut();
    // updateFormState(() => ({ ...formState, formType: "signedOut" }));
  };

  /*************************
   * Toggle Dialog Modal   *
   *************************/
  const toggleDialog = () => {
    openDialog ? setOpenDialog(false) : setOpenDialog(true);
  };

  return (
    <div className={'card-container'}>
      <Dialog
        maxWidth={"md"}
        fullWidth={true}
        open={openDialog}
        title={"Sign In"}
        customClass={'dialog'}
        onCancel={toggleDialog}
      >
        {
          formType === 'signUp' && (
            <>
              <DialogTitle>Sign Up</DialogTitle>
              <DialogContent dividers={true}>
                <form id={'signup-form'} onSubmit={signUp}>
                  <Grid>
                    <TextField
                      fullWidth
                      id={'username'}
                      name={'username'}
                      label={'Username'}
                      autoComplete={'username'}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      id={'email'}
                      name={'email'}
                      label={'Email'}
                      autoComplete={'email'}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      id={'password'}
                      type={'password'}
                      name={'password'}
                      label={'Password'}
                      autoComplete={'password'}
                      onChange={onChange}
                    />
                  </Grid>
                </form>
              </DialogContent>
              <DialogActions>
                <Button color={'secondary'} variant={'contained'} onClick={toggleDialog}>Cancel</Button>
                <Button
                  type={'submit'}
                  form={'signup-form'}
                  variant={'contained'}
                >
                  Sign Up
                </Button>
                <Button onClick={() => updateFormState(() => ({
                  ...formState, formType: "signIn"
                }))}>Sign In</Button>
              </DialogActions>
            </>
          )
        }
        {
          formType === 'confirmSignUp' && (
            <>
              <DialogTitle>Confirm Sign Up</DialogTitle>
              <DialogContent dividers={true}>
                <form id={'confirm-signup-form'} onSubmit={confirmSignUp}>
                  <Grid>
                    <TextField
                      fullWidth
                      id={'authCode'}
                      name={'authCode'}
                      label={'Confirmation Code'}
                      autoComplete={''}
                      onChange={onChange}
                    />
                  </Grid>
                </form>
              </DialogContent>
              <DialogActions>
                <Button color={'secondary'} variant={'contained'} onClick={toggleDialog}>Cancel</Button>
                <Button
                  type={'submit'}
                  form={'confirm-signup-form'}
                  variant={'contained'}
                >
                  Confirm Sign Up
                </Button>
              </DialogActions>
            </>
          )
        }
        {
          formType === 'signIn' && (
            <>
              <DialogTitle>Sign In</DialogTitle>
              <DialogContent dividers={true}>
                <form id={'signin-form'} onSubmit={signIn}>
                  <Grid>
                    <TextField
                      fullWidth
                      id={'username'}
                      name={'username'}
                      label={'Username'}
                      autoComplete={'username'}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      id={'password'}
                      type={'password'}
                      name={'password'}
                      label={'Password'}
                      autoComplete={'password'}
                      onChange={onChange}
                    />
                  </Grid>
                </form>
              </DialogContent>
              <DialogActions>
                <Button color={'secondary'} variant={'contained'} onClick={toggleDialog}>Cancel</Button>
                <Button
                  type={'submit'}
                  form={'signin-form'}
                  variant={'contained'}
                >
                  Sign In
                </Button>
              </DialogActions>
            </>
          )
        }
        {
          formType === 'signedIn' && (
            () => toggleDialog()
          )
        }
      </Dialog>
    </div>
  );
}