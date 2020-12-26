import React from 'react';
import { Link } from "react-router-dom";
import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import Card from '@material-ui/core/Card';
import CheckIcon from '@material-ui/icons/Check';
import Chip from '@material-ui/core/Chip';
import DescriptionIcon from '@material-ui/icons/Description';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import { Loading } from "element-react";
import Error from "../Error";

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
  return (
    <Connect query={graphqlOperation(listProducts)}>
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />;
        if (loading || !data.listProducts) return <Loading fullscreen={true} />;
        const products = searchResults.length > 0 ? searchResults : data.listProducts.items;

        return (
          <>
            {products.map(product => (
              <div key={product.id} className={"my-2"}>
                {product.name}
              </div>
            ))}
          </>
        );
      }}
    </Connect>
  );
};

export default ProductList;