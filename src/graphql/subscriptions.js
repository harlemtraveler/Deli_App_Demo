/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateStore = /* GraphQL */ `
  subscription OnCreateStore {
    onCreateStore {
      id
      name
      products {
        items {
          id
          description
          price
          delivery
          owner
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateStore = /* GraphQL */ `
  subscription OnUpdateStore {
    onUpdateStore {
      id
      name
      products {
        items {
          id
          description
          price
          delivery
          owner
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteStore = /* GraphQL */ `
  subscription OnDeleteStore {
    onDeleteStore {
      id
      name
      products {
        items {
          id
          description
          price
          delivery
          owner
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;
export const onCreateProduct = /* GraphQL */ `
  subscription OnCreateProduct {
    onCreateProduct {
      id
      description
      store {
        id
        name
        products {
          nextToken
        }
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
  }
`;
export const onUpdateProduct = /* GraphQL */ `
  subscription OnUpdateProduct {
    onUpdateProduct {
      id
      description
      store {
        id
        name
        products {
          nextToken
        }
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
  }
`;
export const onDeleteProduct = /* GraphQL */ `
  subscription OnDeleteProduct {
    onDeleteProduct {
      id
      description
      store {
        id
        name
        products {
          nextToken
        }
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
  }
`;
export const onCreateProfile = /* GraphQL */ `
  subscription OnCreateProfile {
    onCreateProfile {
      id
      user {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      handle
      avatar
      facebook_username
      instagram_username
      twitter_username
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateProfile = /* GraphQL */ `
  subscription OnUpdateProfile {
    onUpdateProfile {
      id
      user {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      handle
      avatar
      facebook_username
      instagram_username
      twitter_username
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteProfile = /* GraphQL */ `
  subscription OnDeleteProfile {
    onDeleteProfile {
      id
      user {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      handle
      avatar
      facebook_username
      instagram_username
      twitter_username
      createdAt
      updatedAt
    }
  }
`;
export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost {
    onCreatePost {
      id
      user {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      title
      body
      likes {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      comments {
        user {
          id
          username
          email
          registered
          createdAt
          updatedAt
        }
        body
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost {
    onUpdatePost {
      id
      user {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      title
      body
      likes {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      comments {
        user {
          id
          username
          email
          registered
          createdAt
          updatedAt
        }
        body
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost {
    onDeletePost {
      id
      user {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      title
      body
      likes {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      comments {
        user {
          id
          username
          email
          registered
          createdAt
          updatedAt
        }
        body
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;
