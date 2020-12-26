import React from "react";
// Material-UI Imports
import Grid from '@material-ui/core/Grid';
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import { makeStyles } from "@material-ui/core";
// Component Imports
import Main from "../components/layout/Main";

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    marginTop: theme.spacing(3),
  },
}));

export default function HomePage() {
  const classes = useStyles();

  return (
    <>
      <main>
        <h1>Deli App</h1>
        <Grid container spacing={5} className={classes.mainGrid}>
          <Main title={"Main Content Component"} />
        </Grid>
      </main>
    </>
  );
}