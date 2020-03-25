import React, {Component} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {
  Container,
  Header,
  Button,
  Icon,
  Left,
  Body,
  Right,
  Title,
  Content,
  Toast,
} from 'native-base';
import Card from '../components/Card';
import Mqtt from 'sp-react-native-mqtt';

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);

    // Creating MQTT Client
    this.client = null;

    // state
    this.state = {
      devices: {
        'item-01': {
          name: 'Mr. Muller',
          value: {
            state: 'up',
            temp: 23,
            pres: 100,
            hum: 50,
            gas: 60,
            alt: 90,
          },
          updatedTime: Date.now() - 1,
        },
        'item-02': {
          name: 'Ms. Martin',
          value: {
            state: 'up',
            temp: 23,
            pres: 100,
            hum: 50,
            gas: 60,
            alt: 90,
          },
          updatedTime: Date.now() - 2,
        }
      },
    };
  }

  componentDidMount() {
    this.init();
  }

  randIdCreator() {
    const S4 = () =>
      (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return `random${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}`;
  }

  disconnect() {
    if (this.client) {
      console.log('MQTT now killing open realtime connection.');
      this.client.disconnect();
    }
  }

  onError(error) {
    console.log(`MQTT onError: ${error}`);
    Toast.show({
      text: "Error",
      type: "danger",
      duration: 5000
    })
  }

  onConnectionOpened() {
    console.log('MQTT onConnectionOpened');
    Toast.show({
      text: "Connect Successfully",
      type: "success",
      duration: 5000
    })
  }

  onConnectionClosed(err) {
    console.log(`MQTT onConnectionClosed: ${err}`);
    Toast.show({
      text: "Connection Closed",
      type: "warning",
      duration: 5000
    })
  }

  onMessageArrived(message) {
    // TODO
  }

  init() {
    this.onConnectionOpened = this.onConnectionOpened.bind(this);
    this.onConnectionClosed = this.onConnectionClosed.bind(this);
    this.onError = this.onError.bind(this);
    this.onMessageArrived = this.onMessageArrived.bind(this);
    this.disconnect = this.disconnect.bind(this);

    const deviceId = this.randIdCreator().replace(/[^a-zA-Z0-9]+/g, '');
    const conProps = {
      uri: 'mqtt://192.168.2.162:1883',
      clientId: deviceId,
      //auth: true,
      //user: 'mqttuser',
      //pass: 'mqttpassword',
      clean: true, // clean session YES deletes the queue when all clients disconnect
    };
    Mqtt.createClient(conProps)
      .then(client => {
        this.client = client;
        client.on('closed', this.onConnectionClosed);
        client.on('error', this.onError);
        client.on('message', this.onMessageArrived);
        client.on('connect', this.onConnectionOpened);
        client.connect();
      })
      .catch(err => {
        console.error(`MQTT createtClient error: ${err}`);
      });
  }

  // Updating value
  updateValue(key, value) {
    if (key in this.state.devices) {
      this.setState({
        devices: {
          ...this.state.devices,
          [key]: {
            name: this.state.devices[key].name,
            value: value,
            updatedTime: Date.now(),
          },
        },
      });
    }
  }

  // Updating device
  updateDevice(device) {
    const key = device.id;
    if (!(key in this.state.devices)) {
      this.setState({
        devices: {
          ...this.state.devices,
          [key]: {
            name: device.name,
            value: null,
            updatedTime: Date.now(),
          },
        },
      });
      //console.log('updateDevice', this.state.devices)
    }
  }

  // Checking devices
  checkDevices() {
    if (this.state.devices === {}) return;
    Object.keys(this.state.devices).map(key => {
      const now = Date.now();
      if (now - this.state.devices[key].updatedTime > 20 * 1000) {
        this.removeDevice(key);
      }
    });
  }

  // Removing device
  removeDevice(key) {
    let oldDevicesList = JSON.parse(JSON.stringify(this.state.devices));
    delete oldDevicesList[key];
    const newDevicesList = JSON.parse(JSON.stringify(oldDevicesList));
    this.setState({devices: {...newDevicesList}});
  }

  render() {
    return (
      <Container>
        <Header style={{backgroundColor: 'white'}}>
          <Left>
            <Button
              onPress={() => this.props.navigation.toggleDrawer()}
              transparent>
              <Icon name="menu" style={{color: 'dimgrey', fontSize: 40}}></Icon>
            </Button>
          </Left>
          <Body>
            <Title style={{color: 'dimgrey', fontSize: 25}}>
              PRINTED CARE CLOUD
            </Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon
                type="Entypo"
                name="icloud"
                style={{color: 'dimgrey', fontSize: 40}}></Icon>
            </Button>
          </Right>
        </Header>
        <Content>
          <ScrollView>
            {Object.keys(this.state.devices).map(key => {
              return <Card key={key} device={this.state.devices[key]} />;
            })}
          </ScrollView>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({});
