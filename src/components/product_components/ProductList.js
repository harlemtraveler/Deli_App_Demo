import React,{useState} from 'react';
import { Link } from "react-router-dom";
import { Loading } from "element-react";
import { Connect } from "aws-amplify-react";
import { graphqlOperation } from "aws-amplify";
// Material UI Imports
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
// Component Imports
import Error from "../Error";
import Product from "./Product";

const listProducts = /* GraphQL */ `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        store {
          id
          name
          tags
          owner
          createdAt
          updatedAt
        }
        file {
          bucket
          region
          key
        }
        price
        delivery
        tags
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  grid: {
    padding: theme.spacing(2),
    margin: 'auto',
  },
}));

const ProductList = ({ searchResults }) => {
  const [link, setLink] = useState("");
    const classes = useStyles();

  return (
    <Connect query={graphqlOperation(listProducts)}>
      {/* The below values are interpolated from the above "Connect" API query */}
      {/* "errors" - is returned as an array */}
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />;
        if (loading || !data.listProducts) return <Loading fullscreen={true} />;
        const products = searchResults.length > 0 ? searchResults : data.listProducts.items;

        return (
          <>
            <Grid container spacing={3} justify={"center"} className={classes.grid}>

              {products.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  {console.log(product)}
                  <Product key={product.id} product={product} />
                  {product.tags.map(tag => (
                    <div className={classes.root}>
                      <Chip size={'small'} label={tag} color={'primary'} key={tag}/>
                    </div>
                  ))}
                </Grid>
              ))}

            </Grid>
          </>
        );
      }}
    </Connect>
  );
};

export default ProductList;