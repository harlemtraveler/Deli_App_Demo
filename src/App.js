import React, { Component } from 'react';
import './App.css';
import clsx from "clsx";
import {API, Auth, graphqlOperation, Hub} from "aws-amplify";
import { Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Authenticator, AmplifyTheme, withAuthenticator } from "aws-amplify-react";
//** MaterialUI Imports **//
import CssBaseline from "@material-ui/core/CssBaseline";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {createMuiTheme, makeStyles, ThemeProvider} from '@material-ui/core/styles';
//** Font Imports **//
import "fontsource-merriweather";
import "fontsource-libre-franklin";
//** Page Imports **//
import HomePage from "./pages/HomePage";
//** Component Imports **//
import AppbarMenu from "./components/layout/AppbarMenu";
import DrawerMenu from "./components/layout/DrawerMenu";

export const history = createBrowserHistory();
export const UserContext = React.createContext();

class App extends Component {
  state ={
    user: null,
    menuOpen: false,
    expanded: false
  };

  handleDrawerOpen = () => {
    this.setState({ menuOpen: true });
  };

  handleDrawerClose = () => {
    this.setState({ menuOpen: false });
  };

  render() {
    const { user, menuOpen } = this.state;
    const { classes } = this.props;

    return (
      <Router history={history}>
        <>
          <ThemeProvider theme={themeFont}>
            <CssBaseline />

            {/* Appbar */}
            <AppbarMenu
              classes={classes}
              title={"Deli App"}
              handleDrawerOpen={this.handleDrawerOpen}
              open={menuOpen}
              position={"fixed"}
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
                {/*<Route path={"/profile"} component={() => (*/}
                {/*//  TODO: add a Profile component*/}
                {/*)} />*/}
              </div>
            </main>
          </ThemeProvider>
        </>
      </Router>
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
