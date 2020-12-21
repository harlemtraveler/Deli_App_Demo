import React from 'react';
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import clsx from "clsx";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import {handleSignOut} from "../../utils";
import {Link} from "react-router-dom";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AppBar from "@material-ui/core/AppBar";

export default function AppbarMenu (props) {
  const { classes, title, handleDrawerOpen, open, position, shiftClass } = props;

  return (
    <>
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

          <Button
            size={"small"}
            variant={"outlined"}
            onClick={() => handleSignOut()}
          >
            Sign Out
          </Button>

          <IconButton to={"/profile"} component={Link}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
}