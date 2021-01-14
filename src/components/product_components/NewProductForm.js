import React, { Component } from 'react';
import { UserContext } from '../../App';
import aws_exports from '../../aws-exports';
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import { PhotoPicker } from "aws-amplify-react";
import { createProduct, createPicture } from "../../graphql/mutations";
import {withStyles} from "@material-ui/core/styles";
import { Form, Button, Input, Notification, Radio, Progress, Select } from "element-react";
import { convertDollarsToCents } from "../../utils";

const initialState = {
  name: '',
  store: '',
  price: '',
  owner: '',
  image: '',
  description: '',
  imagePreview: '',
  publicBucket: 'deliapp-image-bucket-public-access-tk01052021',
  percentUploaded: 0,
  delivery: false,
  isUploading: false,
  addProductDialog: false,
  options: [],
  selectedTags: [],
  tags: [
    'Beverages',
    'Entree',
    'Snacks',
    'Desserts',
    'Sides',
    'Salads',
    'Vegan'
  ]
};

class NewProductForm extends Component {
  state = { ...initialState };

  addImageToDB = async (name, owner, img, key) => {
    console.log('[+] Add image to DB.');
    try {
      const photo = {
        name: name,
        owner: owner,
        public_url: `https://${this.state.publicBucket}.s3.amazonaws.com/public/${key}`,
        file: img
      };
      await API.graphql(graphqlOperation(createPicture, { input: photo }));
      console.log('[+] Add image success!')
    } catch (err) {
      console.error(err);
    }
  };

  makePublicCopyImage = async (name, photo) => {
    return await Storage.put(name, photo.file, {
      contentType: photo.type,
      level: 'public',
      bucket: "deliapp-image-bucket-public-access-tk01052021",
      progressCallback: progress => {
        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
      }
    });
  };

  handleAddProduct = async () => {
    try {
      this.setState({ isUploading: true });
      const visibility = 'public';
      const { identityId } = await Auth.currentCredentials();
      const { username } = await Auth.currentUserInfo();
      const filename = `/${visibility}/${identityId}/${Date.now()}-${this.state.image.name}`;
      const uploadedFile = await Storage.put(filename, this.state.image.file, {
        contentType: this.state.image.type,
        progressCallback: progress => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          const percentUploaded = Math.round((progress.loaded / progress.total) * 100);
          this.setState({ percentUploaded });
        }
      });
      console.log(uploadedFile);

      // this creates a publicly accessible copy of the image file in a separate S3 bucket
      const uploadedPublicFile = await this.makePublicCopyImage(filename, this.state.image);
      console.log(uploadedPublicFile);

      // TODO: Where is the best place to insert the "addImageToDB()" function call?...after the "file" var declaration?
      // THIS IS WHERE REF CODE EXEC CMD: to add image to DynamoDB (*addImageToDB(...))

      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_user_files_s3_bucket_region
      };

      await this.addImageToDB(filename, username, file, file.key);

      const input = {
        owner: username,
        name: this.state.name,
        description: this.state.description,
        price: convertDollarsToCents(this.state.price),
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

  // handleChange = event => {
  //   event.preventDefault();
  //   const targetName = event.target.name;
  //   const targetValue = event.target.value;
  //   this.setState({
  //     ...targetName,
  //     [targetName]: targetValue
  //   });
  // };

  handleFilterTags = query => {
    const options = this.state.tags
      .map(tag => ({ value: tag, label: tag }))
      .filter(tag => tag.label.toLowerCase().includes(query.toLowerCase()));
    this.setState({ options });
  };

  render() {
    const { classes } = this.props;
    const { image, shipped, percentUploaded } = this.state;
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
        {({ user }) =>(
          <>
            <div className={'flex-center'}>
              <h2 className={'header'}>Add New Product</h2>
              <div>
                <Form className={'market-header'}>

                  {/* Product Name Field */}
                  <Form.Item label={'Add Product Name'}>
                    <Input
                      type={'text'}
                      value={name}
                      icon={'information'}
                      placeholder={'Name'}
                      // onChange={this.handleChange}
                      onChange={name => this.setState({ name })}
                    />
                  </Form.Item>

                  {/* Product Description Field */}
                  <Form.Item label={'Add Product Description'}>
                    <Input
                      type={'text'}
                      value={description}
                      icon={'information'}
                      placeholder={'Description'}
                      // onChange={this.handleChange}
                      onChange={description => this.setState({ description })}
                    />
                  </Form.Item>

                  {/* Product Price Field */}
                  <Form.Item label={'Set Product Price'}>
                    <Input
                      type={'number'}
                      value={price}
                      icon={'plus'}
                      placeholder={'Price ($USD'}
                      // onChange={this.handleChange}
                      onChange={price => this.setState({ price })}
                    />
                  </Form.Item>

                  {/* Image Pick & Upload */}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt={'Product Preview'}
                      className={'image-preview'}
                    />
                  )}
                  {percentUploaded > 0 && (
                    <Progress
                      type={"circle"}
                      status={"success"}
                      className={"progress"}
                      percentage={percentUploaded}
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

                  {/* Add Product Tags */}
                  <Form.Item label={'Add Tags'}>
                    <Select
                      remote={true}
                      multiple={true}
                      filterable={true}
                      placeholder={'Product Tags'}
                      remoteMethod={this.handleFilterTags}
                      onChange={selectedTags => this.setState({ selectedTags })}
                    >
                      {this.state.options.map(option => (
                        <Select.Option
                          key={option.value}
                          value={option.value}
                          label={option.label}
                        />
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type={'primary'}
                      loading={isUploading}
                      onClick={this.handleAddProduct}
                      disabled={!image || !description || !price || isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Add Product'}
                    </Button>
                  </Form.Item>

                </Form>
              </div>
            </div>
          </>
        )}
      </UserContext.Consumer>
    );
  }
};

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

export default withStyles(styles)(NewProductForm);