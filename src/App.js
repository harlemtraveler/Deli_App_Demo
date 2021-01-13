import React, { Component } from 'react';
import './App.css';
import clsx from "clsx";
import {API, Auth, graphqlOperation, Hub} from 'aws-amplify';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Authenticator, AmplifyTheme, withAuthenticator } from 'aws-amplify-react';
//** MaterialUI Imports **//
import CssBaseline from "@material-ui/core/CssBaseline";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {createMuiTheme, makeStyles, ThemeProvider} from '@material-ui/core/styles';
// Stripe imports
import { loadStripe } from "@stripe/stripe-js/pure";
import { Elements } from "@stripe/react-stripe-js";
// Font Imports
import "fontsource-merriweather";
import "fontsource-libre-franklin";
// GraphQL Imports
import { getUser } from './graphql/queries';
import { registerUser } from './graphql/mutations';
//** Page Imports **//
import HomePage from './pages/HomePage';
//** Component Imports **//
import AppbarMenu from './components/layout/AppbarMenu';
import DrawerMenu from './components/layout/DrawerMenu';
import ProfilePage from './pages/ProfilePage';
import FormCard from './components/forms/FormCard';
// ENV Imports
import config from './config';
//** Util Imports **//
import { handleSignIn, handleSignOut, stringToBoolean, attributesToObject } from './utils';

export const history = createBrowserHistory();
const stripePromise = loadStripe(config.stripeConfig.pubKey);
export const UserContext = React.createContext();

class App extends Component {
  state ={
    user: null,
    userAttributes: null,
    menuOpen: false,
    expanded: false,
  };

  componentDidMount() {
    this.getUserData();
    Hub.listen("auth", this, "onHubCapsule");
  }

  getUserData = async () => {
    // NOTE: the "Auth.currentAuthenticatedUser()" method ONLY returns the attributes from ...
    // when account was originally created!
    const user = await Auth.currentAuthenticatedUser();
    user
      ? this.setState({ user }, () => this.getUserAttributes(this.state.user))
      : this.setState({ user: null });
    console.log(this.state.user);
  };

  getUserAttributes = async authUserData => {
    // NOTE: we use the "Auth.userAttributes()" to obtain CURRENT user attr
    // i.e. after a user updates their email, phone, etc.
    const attributeArr = await Auth.userAttributes(authUserData);
    const attributesObj = await attributesToObject(attributeArr);
    this.setState({ userAttributes: attributesObj });
    console.log(attributeArr);
    console.log(attributesObj);
  };

  onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case 'signIn':
        console.log('[!] User signed in.');
        this.getUserData();
        this.registerNewUser(capsule.payload.data);
        break;
      case 'signUp':
        console.log('signed up');
        break;
      case 'signOut':
        console.log('[!] User signed out.');
        this.setState({ user: null });
        break;
      default:
        return;
    }
  };

  registerNewUser = async signInData => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));

    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        );
        console.log({ newUser });
      } catch (err) {
        console.error('[!] Error registering new user.', err);
      }
    }
  };

  handleSignout = async () => {
    try {
      Auth.signOut();
    } catch (err) {
      console.error('[!] Error signing out user.', err);
    }
  };

  handleDrawerOpen = () => {
    this.setState({ menuOpen: true });
  };

  handleDrawerClose = () => {
    this.setState({ menuOpen: false });
  };

  render() {
    const { user, userAttributes, menuOpen } = this.state;
    const { classes } = this.props;

    return !user ? (
      <Authenticator theme={theme} />
    ) : (
      <Elements stripe={stripePromise}>
        <UserContext.Provider value={{ user, userAttributes }}>
          <Router history={history}>
            <>
              <ThemeProvider theme={themeFont}>
                <CssBaseline />

                {/* Appbar */}
                <AppbarMenu
                  user={user}
                  open={menuOpen}
                  classes={classes}
                  title={"Deli App"}
                  position={"fixed"}
                  handleSignout={this.handleSignout}
                  handleDrawerOpen={this.handleDrawerOpen}
                  shiftClass={clsx(classes.appBar, {
                    [classes.appBarShift]: menuOpen,
                  })}
                />

                {/* Drawer */}
                <DrawerMenu
                  classes={classes}
                  open={menuOpen}
                  handleDrawerClose={this.handleDrawerClose}
                />

                {/* Page Main Body */}
                <main
                  className={clsx(classes.content, {
                    [classes.contentShift]: menuOpen,
                  })}
                >
                  <div className={classes.drawerHeader} />

                  {/* Routes */}
                  <div className={"app-container"}>
                    <Route exact path={"/"} component={HomePage} />
                    <Route path={"/profile"} component={() => (
                      <ProfilePage user={user} userAttributes={userAttributes} />
                    )} />
                  </div>
                </main>
              </ThemeProvider>
            </>
          </Router>
        </UserContext.Provider>
      </Elements>
    );
  }
}

const drawerWidth = 240;

const themeFont = createMuiTheme({
  typography: {
    fontFamily: [
      "merriweather",
    ]
  },
});

const styles = theme => ({
  root: {
    display: 'flex',
  },
  // palette: {
  //   primary: {
  //     main: '#344955',
  //   },
  //   secondary: '#f9aa33',
  // },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    // marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    // zIndex: theme.zIndex.drawer + 1,
  },
  toolbarTitle: {
    flex: 1,
  },
  toolbarSecondary: {
    justifyContent: 'space-between',
    overflowX: 'auto',
  },
  toolbarLink: {
    padding: theme.spacing(1),
    flexShrink: 0,
  },
});

const merriweather = createMuiTheme({
  typography: {
    fontFamily: "Merriweather"
  }
});

const libreFranklin = createMuiTheme({
  typography: {
    fontFamily: "Libre Franklin"
  }
});

const theme = {
  ...AmplifyTheme,
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "#f9aa33"
  },
  formSection: {
    ...AmplifyTheme.formSection,
    padding: "25px"
  },
  formField: {
    ...AmplifyTheme.formField,
    padding: "5px"
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: "25px"
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: "#344955"
  }
};

export default withStyles(styles)(App);
