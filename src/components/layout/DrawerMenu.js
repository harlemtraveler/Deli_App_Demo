import React, { useState } from "react";
import { Link } from "react-router-dom";
//** MaterialUI Component Imports **//
import List from "@material-ui/core/List";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import Toolbar from "@material-ui/core/Toolbar";
import ListItem from "@material-ui/core/ListItem";
import {useTheme} from "@material-ui/core/styles";
import Collapse from '@material-ui/core/Collapse';
import IconButton from "@material-ui/core/IconButton";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
//** MaterialUI Icon Imports **//
import HomeIcon from '@material-ui/icons/Home'; // home icon
import RedeemIcon from '@material-ui/icons/Redeem'; // gift card icon
import LoyaltyIcon from '@material-ui/icons/Loyalty'; // price tag icon
import HistoryIcon from '@material-ui/icons/History'; // history icon
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import FastfoodIcon from '@material-ui/icons/Fastfood'; // food entree icon
import MenuBookIcon from '@material-ui/icons/MenuBook'; // food menu icon
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import EmojiFoodBeverageIcon from '@material-ui/icons/EmojiFoodBeverage'; // tea-&-coffee icon

export default function DrawerMenu (props) {
  const [ expanded, setExpanded ] = useState(false);
  const { classes, open, onClose, handleDrawerClose } = props;
  const theme = useTheme();

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Drawer
        className={classes.drawer}
        variant={"persistent"}
        anchor={"left"}
        open={open}
        onClose={onClose}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        {/* Drawer Internals */}
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <Toolbar />

        {/* List Internals */}
        <div className={classes.drawerContainer}>
          <List>

            {/* Store Homepage */}
            <ListItem button component={Link} to={'/'}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={"Store Homepage"} />
            </ListItem>

            {/* Food Menu */}
            <ListItem button onClick={handleClick}>
              <ListItemIcon>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary={"Food Menu"} />
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={expanded} timeout={"auto"} unmountOnExit>
              <List>

                {/* TODO: update the list item Link paths to display Menu filtered by product tags */}
                {/* sub-menu - Beverages */}
                <ListItem button component={Link} to={'/'} className={classes.nested}>
                  <ListItemIcon>
                    <EmojiFoodBeverageIcon />
                  </ListItemIcon>
                  <ListItemText primary={"Beverages"} />
                </ListItem>

                {/* sub-menu - Entrees */}
                <ListItem button component={Link} to={'/'} className={classes.nested}>
                  <ListItemIcon>
                    <FastfoodIcon />
                  </ListItemIcon>
                  <ListItemText primary={"Entrees"} />
                </ListItem>

              </List>
            </Collapse>

            {/* Past Orders */}
            <ListItem button component={Link} to={'/order-history'}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary={"Past Orders"} />
            </ListItem>

            {/* Deals & Discounts */}
            <ListItem button>
              <ListItemIcon>
                <LoyaltyIcon />
              </ListItemIcon>
              <ListItemText primary={"Deals & Discounts!"} />
            </ListItem>

            {/* Rewards Program */}
            <ListItem button>
              <ListItemIcon>
                <RedeemIcon />
              </ListItemIcon>
              <ListItemText primary={"Rewards Program"} />
            </ListItem>
          </List>
        </div>
      </Drawer>
    </>
  );
}