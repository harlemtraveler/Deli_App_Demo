import React,{useState} from 'react';
import { Link } from "react-router-dom";
import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { S3Image } from "aws-amplify-react";
import { AmplifyS3Image } from "@aws-amplify/ui-react";
import Card from '@material-ui/core/Card';
import CheckIcon from '@material-ui/icons/Check';
import Chip from '@material-ui/core/Chip';
import DescriptionIcon from '@material-ui/icons/Description';
import Grid from '@material-ui/core/Grid';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import { Loading } from "element-react";
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

const ProductList = ({ searchResults }) => {
  const [link, setLink] = useState("");

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
            <Grid container spacing={3} justify={"center"}>

              {products.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  {console.log(product)}
                  <Product key={product.id} product={product} />
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