import React from 'react';
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import clsx from "clsx";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import { handleSignIn, handleSignOut } from "../../utils";
import {Link} from "react-router-dom";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AppBar from "@material-ui/core/AppBar";
import {Auth} from "aws-amplify";
import FormCard from "../forms/FormCard";

export default function AppbarMenu (props) {
  const { classes, title, handleDrawerOpen, open, user, position, shiftClass } = props;

  return (
    <>
      {/*<AppBar color={"inherit"} position={position} className={shiftClass} style={{ background: '#344955' }}>*/}
      <AppBar color={"inherit"} position={position} className={shiftClass}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge={"start"}
            color={"inherit"}
            aria-label={"menu"}
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>

          <Button size={"small"}>Subscribe</Button>

          <Typography
            noWrap
            to={"/"}
            variant={"h5"}
            align={"center"}
            component={Link}
            color={"inherit"}
            className={classes.toolbarTitle}
            style={{ textDecoration: "none" }}
          >
            {title}
          </Typography>

          <IconButton>
            <SearchIcon />
          </IconButton>

          {/*{user ? (*/}
          {/*  <Button*/}
          {/*    size={"small"}*/}
          {/*    variant={"outlined"}*/}
          {/*    onClick={() => (*/}
          {/*      <FormCard />*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    Sign Out*/}
          {/*  </Button>*/}
          {/*) : (*/}
          {/*  <Button*/}
          {/*    size={"small"}*/}
          {/*    variant={"outlined"}*/}
          {/*    onClick={() => (*/}
          {/*      <FormCard />*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    Sign In*/}
          {/*  </Button>*/}
          {/*)}*/}
          <Button
            size={"small"}
            variant={"outlined"}
            onClick={() => {}}
          >
            {user ? "Sign Out" : "Sign In"}
          </Button>

          <IconButton to={"/profile"} component={Link}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
}