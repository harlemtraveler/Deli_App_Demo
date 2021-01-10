import React, {useState, useEffect} from 'react';
import "../../App.css";
import clsx from 'clsx';
import { UserContext } from "../../App";
import { Link } from "react-router-dom";
import { S3Image } from "aws-amplify-react";
import { Storage, API, graphqlOperation } from "aws-amplify";
/*********************************
 * Material UI Component Imports *
**********************************/
import { makeStyles } from '@material-ui/core/styles';
import { red, grey, blue, green } from "@material-ui/core/colors";
// Component Imports
import Checkout from "../Checkout";
// MUI Card Component
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
// MUI Icon Component
import Avatar from '@material-ui/core/Avatar';
import ShareIcon from '@material-ui/icons/Share';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
// MUI Menu Component
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Collapse from '@material-ui/core/Collapse';
import Typography from "@material-ui/core/Typography";
// MUI Dialog Component
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
/************************************
 * GraphQL & Util Component Imports *
*************************************/
import {deleteProduct, updateProduct} from "../../graphql/mutations";
import { convertCentsToDollars, convertDollarsToCents, formatProductDate, formatDateToISO } from "../../utils";
// MUI Styling
const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  responsive: {
    [theme.breakpoints.up('xs')]: {
      maxHeight: 200,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    [theme.breakpoints.down('xs')]: {
      maxHeight: 200,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
  title: {
    [theme.breakpoints.up('xs')]: {
      maxHeight: 40,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    [theme.breakpoints.down('xs')]: {
      maxHeight: 40,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  media: {
    height: 140,
    paddingTop: '56.25%', // 16:9
  },
  mediaS3Obj: {
    display: 'block',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    // height: "25 rem",
    // width: "25 rem",
    // height: "248",
    // width: "248"
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
  iconUnlike: {
    color: grey[700],
  },
  iconLiked: {
    color: red[700],
  },
  iconUnshared: {
    color: grey[700],
  },
  iconShared: {
    color: blue[700],
  },
  iconCheckoutFalse: {
    color: grey[700],
  },
  iconCheckoutTrue: {
    color: green[700],
  },
}));


export default function Product ({ product }) {
  const onOpen = e => {
    setAnchorEl(e.currentTarget);
  };

  const onSettings = e => {
    handleDialogOpen();
    onClose(e);
  };

  const onDelete = e => {
    handleDeleteProduct();
    onClose(e);
  };

  const onClose = e => {
    if (e.currentTarget.textContent === 'Source URL') {
      // TODO: Add a trigger to copy source url to clipboard
    }
    setAnchorEl(null);
  };

  // TODO: declare State[s] here (i.e. 'useState')
  const classes = useStyles();
  const [url, setUrl] = useState("");
  const [name, setName] = useState(product.name || '');
  const [description, setDescription] = useState(product.description || '');
  const [publicBucket, setPublicBucket] = useState("deliapp-image-bucket-public-access-tk01052021");
  const [price, setPrice] = useState(product.price || null);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // TODO: update below list to enable Delete functionality
  const [items, setItems] = useState([
    { name: "Source URL", onClick: onClose },
    { name: "Edit", onClick: onSettings, disabled: true },
    { name: "Delete", onClick: onDelete, disabled: true }
  ]);

  const handleDialogOpen = () => {
    setUpdateDialog(true);
  };

  const handleDialogClose = () => {
    setUpdateDialog(false);
  };

  const handleUpdateProduct = async productId => {
    try {
      setUpdateDialog(false);
      const input = {
        id: productId,
        name: name,
        description: description,
        price: convertDollarsToCents(price),
        // url
      };
      const result = await API.graphql(graphqlOperation(updateProduct, { input }));
      console.log(result);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error(`[!] Failed to update product with id: ${productId} `, err);
    }
  };

  // TODO: Create a prompt when a DELETE is triggered
  const handleDeleteProduct = async productId => {
    try {
      setDeleteDialog(false);
      const input = {
        id: productId
      };
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error(`[!] Failed to delete product with id: ${productId} `, err);
    }
  };

  //"https://" + {bucket} + ".s3.amazonaws.com/" + {key}

  const getObjPublicUrl = objKey => {
    return `https://${publicBucket}.s3.amazonaws.com/public/${objKey}`;
  };

  const formatImage = async img => {
    return {
      id: img.id,
      src: await Storage.get(img)
    };
  };

  const getFormatProductDate = date => {
    const formatDate = formatDateToISO(date);
    return formatProductDate(formatDate);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleShare = () => {
    setShared(!shared);
  };

  const handleCheckout = () => {
    setCheckout(!checkout);
  };

  return (
    <UserContext.Consumer>
      {({ user }) => {
        const isProductOwner = user && user.attributes.sub === product.owner;
        const isEmailVerified = user && user.email_verified;

        return (
          <>
            <Card className={classes.root}>
              <CardHeader
                title={product.name}
                subheader={getFormatProductDate(product.createdAt)}
                classes={{
                  title: classes.title,
                }}
                avatar={
                  <Avatar className={classes.avatar} aria-label={'user-avatar'}>U</Avatar>
                }
                action={
                  <>
                    <IconButton
                      onClick={onOpen}
                      aria-label={'settings'}
                      disabled={!isProductOwner}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      keepMounted
                      onClose={onClose}
                      anchorEl={anchorEl}
                      id={'settings-menu'}
                      open={Boolean(anchorEl)}
                    >
                      {items.map((item, index) => (
                        <MenuItem
                          key={index}
                          onClick={item.onClick}
                          disabled={
                            isProductOwner ? false : item.disabled
                          }
                        >
                          {item.name}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                }
              />
              <CardMedia
                title={'Product Image'}
                className={classes.media}
                image={getObjPublicUrl(product.file.key)}
              />
              <CardContent>
                <Typography variant={'body1'}>
                  <Typography paragraph className={classes.responsive}>
                    {product.description}
                  </Typography>
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label={'like'}>
                  <FavoriteIcon
                    onClick={handleLike}
                    className={clsx(classes.iconUnlike, {
                      [classes.iconLiked]: liked
                    })}
                  />
                </IconButton>
                <IconButton aria-label={'share'}>
                  <ShareIcon
                    onClick={handleShare}
                    className={clsx(classes.iconUnshared, {
                      [classes.iconShared]: shared
                    })}
                  />
                </IconButton>
                {/* TODO: finish wiring the Checkout component into the Product card - 10JAN2021 */}
                {/*<IconButton aria-label={'share'}>*/}
                {/*  <ShoppingCartIcon*/}
                {/*    onClick={handleCheckout}*/}
                {/*    className={clsx(classes.iconCheckoutFalse, {*/}
                {/*      [classes.iconCheckoutTrue]: checkout*/}
                {/*    })}*/}
                {/*  />*/}
                {/*</IconButton>*/}
                <Checkout product={product} user={user} />
                <IconButton
                  aria-label={'show more'}
                  aria-expanded={expanded}
                  onClick={handleExpandClick}
                  className={clsx(classes.expand, {
                    [classes.expandOpen]: expanded
                  })}
                >
                  <ExpandMoreIcon/>
                </IconButton>
              </CardActions>
              <Collapse in={expanded} timeout={'auto'} unmountOnExit>
                <CardContent>
                  <Typography>
                    <Typography paragraph>
                      Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Sed
                      posuere consectetur est at lobortis. Cras mattis consectetur purus sit amet fermentum.
                    </Typography>
                    <Typography paragraph>
                      Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Sed
                      posuere consectetur est at lobortis. Cras mattis consectetur purus sit amet fermentum.
                    </Typography>
                    <Typography paragraph>
                      Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Sed
                      posuere consectetur est at lobortis. Cras mattis consectetur purus sit amet fermentum.
                    </Typography>
                  </Typography>
                </CardContent>
              </Collapse>
            </Card>

            {/* Update Product Dialog */}
            {/* TODO: Add Dialog to Update & Delete Products  */}

            <Dialog
              fullWidth
              maxWidth={'sm'}
              open={updateDialog}
              onClose={handleDialogClose}
              aria-labelledby={'update-product-dialog'}
            >
              {/* Dialog Title */}
              <DialogTitle id={'update-product-dialog-title'}>Update Product</DialogTitle>

              <DialogContent>

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
                  defaultValue={name}
                  placeholder={name}
                  onChange={e => setName(e.target.value)}
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
                  defaultValue={description}
                  placeholder={description}
                  onChange={e => setDescription(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Product Price Field */}
                <TextField
                  required
                  fullWidth
                  id={'price'}
                  // TODO: find a way to display value in "$0.00" format to prevent confusion
                  value={price}
                  name={'price'}
                  label={'Price'}
                  type={'number'}
                  margin={'normal'}
                  variant={'filled'}
                  style={{ margin: 8 }}
                  defaultValue={convertCentsToDollars(price)}
                  placeholder={convertCentsToDollars(price)}
                  onChange={e => setPrice(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Product URL Field */}
                {/*<TextField*/}
                {/*  fullWidth*/}
                {/*  id={'url'}*/}
                {/*  value={url}*/}
                {/*  name={'url'}*/}
                {/*  label={'URL'}*/}
                {/*  margin={'normal'}*/}
                {/*  variant={'filled'}*/}
                {/*  style={{ margin: 8 }}*/}
                {/*  // defaultValue={product.url}*/}
                {/*  placeholder={'http://myProductURL.com'}*/}
                {/*  onChange={e => setUrl(e.target.value)}*/}
                {/*  InputLabelProps={{ shrink: true }}*/}
                {/*/>*/}

              </DialogContent>

              {/* Dialog Buttons */}
              <DialogActions>
                <Button color={'secondary'} onClick={handleDialogClose}>Cancel</Button>
                <Button
                  color={'primary'}
                  onClick={() => handleUpdateProduct(product.id)}
                >
                  Update
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
      }}
    </UserContext.Consumer>
  );
}