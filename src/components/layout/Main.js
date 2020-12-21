import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
// MaterialUI Imports
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ClearIcon from '@material-ui/icons/Clear';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FormControl from "@material-ui/core/FormControl";
import InputAdornment from '@material-ui/core/InputAdornment';

class Main extends Component {
  state = {};

  render() {
    const { title } = this.props;

    return (
      <Grid item xs={12} md={8}>
        <Typography variant={"h6"} gutterBottom>
          {title}
        </Typography>

        <Divider />

        <div>Main Content Here...</div>
      </Grid>
    );
  }
}

export default Main;