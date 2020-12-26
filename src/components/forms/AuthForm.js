import React, { useState, useEffect } from 'react';
import { Auth, Hub } from 'aws-amplify';
import clsx from 'clsx';
//** MaterialUI Imports **//
import { createMuiTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';
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
} from "@material-ui/core";

const initialFormState = {
  username: "", password: "", email: "", authCode: "", formType: "signUp"
};

export default function AuthForm () {
  const [user, updateUser] = useState(null);
  const [formState, updateFormState] = useState(initialFormState);

  useEffect(() => {
    checkUser();
    setAuthListener();
  });

  const checkUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      updateUser(user);
      updateFormState(() => ({ ...formState, formType: "signedIn" }));
    } catch (err) {
      // updateUser(null);
      console.error(err);
    }
  };

  const setAuthListener = async () => {
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        // case 'signIn':
        //   console.log('[+] User signed in.');
        //   break;
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

  const signUp = async () => {
    const { username, email, password } = formState;
    try {
      await Auth.signUp({ username, password, attributes: { email } });
      updateFormState(() => ({ ...formState, formType: "confirmSignUp" }));
    } catch (err) {
      console.error('[!] Error signing up: ', err);
    }
  };

  const confirmSignUp = async () => {
    const { username, authCode } = formState;
    try {
      await Auth.confirmSignUp(username, authCode);
      updateFormState(() => ({ ...formState, formType: "signIn" }));
    } catch (err) {
      console.error('[!] Error confirming sign up: ',err);
    }
  };

  const signIn = async () => {
    const { username, password } = formState;
    try {
      await Auth.signIn(username, password);
      updateFormState(() => ({ ...formState, formType: "signedIn" }));
    } catch (err) {
      console.error('[!] Error signing in: ', err);
    }
  };

  const confirmSignIn = async () => {};

  const signOut = () => {
    Auth.signOut();
  };

  return (
    <>
      <div>
        {
          formType === 'signUp' && (
            <div>
              <input name={'username'} onChange={onChange} placeholder={'username'} />
              <input name={'password'} type={'password'} onChange={onChange} placeholder={'password'} />
              <input name={'email'} onChange={onChange} placeholder={'email'} />
              <button onClick={signUp}>Sign Up</button>
              <button onClick={() => updateFormState(() => ({
                ...formState, formType: "signIn"
              }))}>Sign In</button>
            </div>
          )
        }
        {
          formType === 'confirmSignUp' && (
            <div>
              <input name={'authCode'} onChange={onChange} placeholder={'Confirmation code'} />
              <button onClick={confirmSignUp}>Confirm Sign Up</button>
            </div>
          )
        }
        {
          formType === 'signIn' && (
            <div>
              <input name={'username'} onChange={onChange} placeholder={'username'} />
              <input name={'password'} type="password" onChange={onChange} placeholder={'password'} />
              <button onClick={signIn}>Sign In</button>
            </div>
          )
        }
        {
          formType === 'signedIn' && (
            <div>
              <h1>Welcome, to the Deli App!</h1>
              <button onClick={signOut}>Sign Out</button>
            </div>
          )
        }
      </div>
    </>
  );
};