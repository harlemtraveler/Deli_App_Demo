import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
// Material UI Imports
import {
  Input,
  Paper,
  Button,
  InputBase,
  IconButton,
  FormControl,
  InputAdornment
} from '@material-ui/core';
// Material UI Icon Imports
import SearchIcon from '@material-ui/icons/Search';
// Material UI Style Imports
import { withTheme, withStyles } from "@material-ui/core/styles";

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

class Search extends Component {
  state = {
    searchTerm: '',
    isSearching: false,
    searchResults: []
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

  handleClearSearch = () => this.setState({ searchTerm: '', searchResults: [] });

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
    const { classes } = this.props;

    return (
      <Paper component={'form'} className={classes.root}>
        <InputBase
          id={'menu-search'}
          name={'searchTerm'}
          value={this.state.searchTerm}
          onChange={this.handleSearchChange}
          className={classes.input}
          placeholder={'Search our menu...'}
          inputProps={{ 'aria-label': 'Search our menu items' }}
        />
        <IconButton
          type={'submit'}
          aria-label={'search'}
          className={classes.icon}
          onClick={this.handleSearch}
        >
          <SearchIcon />
        </IconButton>
      </Paper>
    );
  }
}

const styles = theme => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
});

export default withStyles(styles)(Search);