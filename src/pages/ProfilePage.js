import React,{Component} from 'react';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import {
  Tag,
  Card,
  Tabs,
  Icon,
  Form,
  Table,
  Input,
  Button,
  Dialog,
  Message,
  MessageBox,
  Notification
} from 'element-react';
import { convertCentsToDollars, formatDateToISO, formatOrderDate, formatProductDate } from '../utils';
import Error from '../components/Error';
import NewProductForm from "../components/product_components/NewProductForm";

const getUser = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders {
        items {
          id
          order_status
          createdAt
          product {
            id
            name
            price
            delivery
          }
          deliveryAddress {
            city
            country
            address_zip
            address_line1
            address_state
          }
        }
        nextToken
      }
    }
  }
`;

class ProfilePage extends Component {
  state = {
    email: this.props.userAttributes && this.props.userAttributes.email,
    emailDialog: false,
    verificationCode: '',
    verificationForm: false,
    orders: [],
    columns: [
      { prop: 'name', width: '150' },
      { prop: 'value', width: '330' },
      {
        prop: 'tag',
        width: '150',
        render: row => {
          if (row.name === 'Email') {
            const emailVerified = this.props.userAttributes.email_verified;
            return emailVerified ? <Tag type={'success'}>Verified</Tag> : <Tag type={'danger'}>Unverified</Tag>;
          }
        }
      },
      {
        prop: 'operations',
        render: row => {
          switch (row.name) {
            case 'Email':
              return (
                <Button
                  type={'info'}
                  size={'small'}
                  onClick={() => this.setState({ emailDialog: true })}
                >
                  Edit
                </Button>
              );
            case 'Delete Profile':
              return (
                <Button
                  type={'danger'}
                  size={'small'}
                  onClick={this.handleDeleteProfile}
                >
                  Delete
                </Button>
              );
            default:
              return;
          }
        }
      }
    ]
  };

  componentDidMount() {
    if (this.props.userAttributes) {
      this.getUserOrders(this.props.userAttributes.sub);
    }
  }

  getUserOrders = async userId => {
    const input = { id: userId };
    const result = await API.graphql(graphqlOperation(getUser, input));
    if (result.data.getUser.orders.items) {
      this.setState({ orders: result.data.getUser.orders.items });
    }
  };

  handleUpdateEmail = async () => {
    console.log({ email: this.state.email });
    try {
      const updatedAttributes = {
        email: this.state.email
      };
      const result = await Auth.updateUserAttributes(
        this.props.user,
        updatedAttributes
      );
      if (result === 'SUCCESS') {
        await this.sendVerificationCode('email');
      }
    } catch (err) {
      console.error(err);
      Notification.error({
        title: 'Error',
        message: `${err.message || 'Error updating email'}`
      });
    }
  };

  sendVerificationCode = async attr => {
    await Auth.verifyCurrentUserAttribute(attr);
    this.setState({ verificationForm: true });
    Message({
      type: 'info',
      customClass: 'message',
      message: `Verification code sent to ${this.state.email}`
    });
  };

  handleVerifyEmail = async attr => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attr,
        this.state.verificationCode
      );
      Notification({
        title: 'Success',
        message: 'Email successfully verified',
        type: `${result.toLowerCase()}`
      });
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      console.error(err);
      Notification({
        title: 'Error',
        message: `${err.message || 'Error updating email'}`
      });
    }
  };

  handleDeleteProfile = () => {
    MessageBox.confirm(
      'This will permanently delete your account. Continue?',
      'Attention!',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          await this.props.user.deleteUser();
        } catch (err) {
          console.error(err);
        }
      })
      .catch(() => {
        Message({
          type: 'info',
          message: 'Delete canceled'
        });
      });
  };

  getFormatOrderDate = date => {
    const formatDate = formatDateToISO(date);
    return formatOrderDate(formatDate);
  };

  render() {
    const {
      email,
      orders,
      columns,
      emailDialog,
      verificationForm,
      verificationCode
    } = this.state;
    const { user, userAttributes, currentTab } = this.props;

    return userAttributes && (
      <>
        {/*<Tabs activeName={'1'} className={'profile-tabs'}>*/}
        <Tabs activeName={`${currentTab || '1'}`} className={'profile-tabs'}>
          <Tabs.Pane
            name={'1'}
            label={
              <>
                <Icon name={'document'} className={'icon'} />
                Summary
              </>
            }
          >
            <h2 className={'header'}>Profile Summary</h2>
            <Table
              columns={columns}
              showHeader={false}
              data={[
                {
                  name: 'Your ID',
                  value: userAttributes.sub
                },
                {
                  name: 'Username',
                  value: user.username
                },
                {
                  name: 'Email',
                  value: userAttributes.email
                },
                {
                  name: 'Phone Number',
                  value: userAttributes.phone_number
                },
                {
                  name: 'Delete Profile',
                  value: 'Sorry to see you go :('
                }
              ]}
              rowClassName={row =>
                row.name === 'Delete Profile' && 'delete-profile'
              }
            />
          </Tabs.Pane>

          <Tabs.Pane
            name={'2'}
            label={
              <>
                <Icon name={'message'} className={'icon'} />
                Orders
              </>
            }
          >
            <h2 className={'header'}>Order History</h2>

            {orders.map(order => (
              <div className={'mb-1'} key={order.id}>
                <Card>
                  <pre>
                    <p>Order ID: {order.id}</p>
                    <p>Product Description: {order.product.description}</p>
                    <p>Price: ${convertCentsToDollars(order.product.price)}</p>
                    <p>Purchased on {this.getFormatOrderDate(order.createdAt)}</p>
                    {order.deliveryAddress && (
                      <>
                        Delivery Address
                        <div className={'ml-2'}>
                          <p>{order.deliveryAddress.address_line1}</p>
                          <p>
                            {order.deliveryAddress.address_city},{''}
                            {order.deliveryAddress.address_state},{''}
                            {order.deliveryAddress.country},{''}
                            {order.deliveryAddress.address_zip},{''}
                          </p>
                        </div>
                      </>
                    )}
                  </pre>
                </Card>
              </div>
            ))}
          </Tabs.Pane>

          <Tabs.Pane
            name={'3'}
            label={
              <>
                <Icon name={'menu'} className={'icon'} />
                Add New Menu Items
              </>
            }
          >
            {/*<h2 className={'header'}>Add New Menu Items</h2>*/}

            <NewProductForm />
          </Tabs.Pane>
        </Tabs>

        {/* Email Dialog */}
        <Dialog
          size={'large'}
          title={'Edit Email'}
          visible={emailDialog}
          customClass={'dialog'}
          onCancel={() => this.setState({ emailDialog: false })}
        >
          <Dialog.Body>
            <Form labelPosition={'top'}>
              <Form.Item label={'Email'}>
                <Input
                  value={email}
                  onChange={email => this.setState({ email })}
                />
              </Form.Item>
              {verificationForm && (
                <Form.Item label={'Enter Verification Code'} labelWidth={'120'}>
                  <Input
                    value={verificationCode}
                    onChange={verificationCode => this.setState({ verificationCode })}
                  />
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => this.setState({ emailDialog: false })}>
              Cancel
            </Button>
            {!verificationForm && (
              <Button type={'primary'} onClick={this.handleUpdateEmail}>
                Save
              </Button>
            )}
            {verificationForm && (
              <Button type={'primary'} onClick={() => this.handleVerifyEmail('email')}>
                Submit
              </Button>
            )}
          </Dialog.Footer>
        </Dialog>
      </>
    );
  }
}

export default ProfilePage;