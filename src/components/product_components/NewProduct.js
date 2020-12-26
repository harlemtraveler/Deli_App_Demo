import React, { Component } from "react";
import { UserContext } from "../../App";
import aws_exports from "../../aws-exports";
import { API, graphqlOperation } from "aws-amplify";
import { createProduct } from "../../graphql/mutations";
//** MaterialUI Imports **//
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from "@material-ui/core/Grid";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from "@material-ui/core/Paper";
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

const initialState = {
  description: "",
  store: "",
  file: {},
  price: "",
  delivery: false,
  tags: [],
  owner: "",
};

class NewProduct extends Component {
  state = { ...initialState };

  render() {
    const { classes } = this.props;

    return (
      <UserContext.Consumer>
        {({ user }) =>
          <>
            <Grid
              container
              spacing={3}
              direction={'row'}
              justify={'center'}
              alignItems={'center'}
              alignContent={'center'}
            >
              <Grid item xs={12}>
                <Paper style={{ height: '16em' }}>
                  <Button variant={'outlined'} color={'primary'} onClick={() => {}} style={{ margin: '40px' }}>
                    Add New Menu Item
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </>
        }
      </UserContext.Consumer>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '25ch',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

export default withStyles(styles)(NewProduct);