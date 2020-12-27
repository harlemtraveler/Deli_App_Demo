import React, { Component } from 'react';
import { UserContext } from '../../App';
import aws_exports from '../../aws-exports';
//** Amplify & GraphQL Imports **//
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import { PhotoPicker } from "aws-amplify-react";
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
  name: "",
  store: "",
  price: "",
  owner: "",
  image: "",
  description: "",
  imagePreview: "",
  delivery: false,
  isUploading: false,
  addProductDialog: false,
  file: {},
  options: [],
  selectedTags: [],
  tags: [
    "Beverages",
    "Entree",
    "Snacks",
    "Sides",
    "Salads",
    "Vegan"
  ],
};

class NewProduct extends Component {
  state = { ...initialState };

  handleAddProduct = async () => {
    try {
      this.setState({ isUploading: true });
      const visibility = 'public';
      const { indentityId } = await Auth.currentCredentials();
      const { username } = await Auth.currentUserInfo();
      const filename = `/${visibility}/${indentityId}/${Date.now()}-${this.state.image.name()}`;
      const uploadedFile = await Storage.put(filename, this.state.image.file, {
        contentType: this.state.image.type,
        progressCallback: progress => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          const percentUploaded = Math.round((progress.loaded / progress.total) * 100);
          this.setState({ percentUploaded });
        }
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_user_files_s3_bucket_region
      };
      const input = {
        owner: username,
        name: this.state.name,
        description: this.state.description,
        price: this.state.price,
        delivery: this.state.delivery,
        tags: this.state.selectedTags,
        file
      };
      const result = await API.graphql(graphqlOperation(createProduct, { input }));
      console.log(result);
      console.info(`Created product id: ${result.data.createProduct.id}`);
      this.setState({ ...initialState });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('[!] Error adding new product', err);
    }
  };

  handleClickOpen = async () => {
    this.setState({ addProductDialog: true });
  };

  handleClose = () => {
    this.setState({ addProductDialog: false });
    this.setState({ name: '', description: '', price: null, delivery: false, imagePreview: '', selectedTags: [] });
  };

  handleChange = event => {
    event.preventDefault();
    const targetName = event.target.name;
    const targetValue = event.target.value;
    this.setState({
      ...targetName,
      [targetName]: targetValue
    });
  };

  handleFilterTags = query => {
    const options = this.state.tags
      .map(tag => ({ value: tag, label: tag }))
      .filter(tag => tag.label.toLowerCase().includes(query.toLowerCase()));
    this.setState({ options });
  };

  render() {
    const { classes } = this.props;
    const {
      name,
      tags,
      price,
      delivery,
      description,
      isUploading,
      selectedTags,
      imagePreview,
      addProductDialog
    } = this.state;

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
                  <Button variant={'outlined'} color={'primary'} onClick={this.handleClickOpen} style={{ margin: '40px' }}>
                    Add New Menu Item
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            <Dialog
              fullWidth
              maxWidth={'sm'}
              open={addProductDialog}
              onClose={this.handleClose}
              aria-labelledby={'form-dailog.title'}
            >
              <DialogTitle id={'form-dialog-title'}>New Product</DialogTitle>
              <DialogContent className={classes.root}>
                {/* Product Name Field */}
                <TextField
                  required
                  autoFocus
                  fullWidth
                  id={'name'}
                  value={name}
                  name={'name'}
                  label={'Name'}
                  margin={'normal'}
                  variant={'filled'}
                  style={{ margin: 8 }}
                  placeholder={'Product Name'}
                  onChange={this.handleChange}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Product Description Field */}
                <TextField
                  required
                  fullWidth
                  multiline={true}
                  id={'description'}
                  value={description}
                  name={'description'}
                  label={'Description'}
                  margin={'normal'}
                  variant={'filled'}
                  style={{ margin: 8 }}
                  placeholder={'Product Description'}
                  onChange={this.handleChange}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Product Price Field */}
                <TextField
                  required
                  fullWidth
                  id={'price'}
                  value={price}
                  name={'price'}
                  label={'Price'}
                  margin={'normal'}
                  variant={'filled'}
                  style={{ margin: 8 }}
                  placeholder={'Product Price'}
                  onChange={this.handleChange}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Image Pick & Upload */}
                <Box>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt={'Product Preview'}
                      className={'image-preview'}
                    />
                  )}
                  <PhotoPicker
                    preview={'hidden'}
                    title={'Product Image'}
                    onPick={file => this.setState({ image: file })}
                    onLoad={photoUrl => this.setState({ imagePreview: photoUrl })}
                    theme={{
                      formContainer: {
                      margin: 0,
                      padding: "0.8em"
                      },
                      sectionBody: {
                        margin: 0,
                        width: "250px"
                      },
                      formSection: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                      },
                      sectionHeader: {
                        padding: "0.2em",
                        color: "var(--darkAmazonOrange)"
                      },
                      amplifyButton: {
                        display: "none"
                      }
                    }}
                  />
                </Box>

                <FormControl className={classes.formControl}>
                  <InputLabel id={'category-tags'}>Tags</InputLabel>
                  <Select
                    multiple
                    id={'addTags'}
                    labelId={'addTags'}
                    value={selectedTags}
                    name={'selectedTags'}
                    onChange={this.handleChange}
                  >
                    <MenuItem value={''} />
                    {tags.map(tag => (
                      <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </DialogContent>
              <DialogActions>
                <Button color={'secondary'} onClick={this.handleClose}>Cancel</Button>
                <Button
                  color={'primary'}
                  onClick={this.handleAddProduct}
                  disabled={!name || !description || isUploading}
                >
                  {isUploading ? "Uploading..." : "Add Product"}
                </Button>
              </DialogActions>
            </Dialog>
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