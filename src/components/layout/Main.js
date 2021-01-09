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

import NewProduct from "../product_components/NewProduct";
import ProductList from "../product_components/ProductList";

const searchProducts = /* GraphQL */ `
  query SearchProducts(
    $filter: SearchableProductFilterInput
    $sort: SearchableProductSortInput
    $limit: Int
    $nextToken: String
  ) {
    searchProducts(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        tags
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
        owner
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;

class Main extends Component {
  state = {
    searchTerm: "",
    searchResults: [],
    isSearching: false
  };

  handleSearchChange = event => {
    event.preventDefault();

    const targetName = event.target.name;
    const targetValue = event.target.value;
    this.setState({
      ...targetName,
      [targetName]: targetValue
    });
  };

  handleClearSearch = () => this.setState({ searchTerm: "", searchResults: [] });

  handleSearch = async event => {
    try {
      event.preventDefault();

      this.setState({ isSearching: true });
      const result = await API.graphql(graphqlOperation(searchProducts, {
        filter: {
          or: [
            { name: { match: this.state.searchTerm } },
            { owner: { match: this.state.searchTerm } },
            { tags: { match: this.state.searchTerm } }
          ]
        }
      }));
      console.log({ result });
      this.setState({
        searchResults: result.data.searchProducts.items,
        isSearching: false
      });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { title } = this.props;

    return (
      <Grid item xs={12} md={12}>
        <Typography variant={"h6"} gutterBottom>
          {title}
        </Typography>

        <Divider />

        <FormControl fullWidth>
          <Input
            id={"menu-search"}
            name={"searchTerm"}
            label={"Search Menu Items"}
            value={this.state.searchTerm}
            placeholder={"Search Menu Items..."}
            onChange={this.handleSearchChange}
            endAdornment={
              <InputAdornment position={"end"}>
                <IconButton color={"inherit"} onClick={this.handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            }
          />
          <Button
            variant={"contained"}
            onClick={this.handleSearch}
            loading={this.state.isSearching}
          >
            Search
          </Button>
        </FormControl>

        <Divider />

        <NewProduct
          handleSearch={this.handleSearch}
          searchTerm={this.state.searchTerm}
          isSearching={this.state.isSearching}
          handleClearSearch={this.handleClearSearch}
          handleSearchChange={this.handleSearchChange}
        />

        <ProductList searchResults={this.state.searchResults} />
      </Grid>
    );
  }
}

export default Main;