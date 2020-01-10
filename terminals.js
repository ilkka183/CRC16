const axios = require('axios');

const REST_HOST = 'http://localhost:59893/wp-json/juro/v1';


class Terminal {
  constructor(number, imei, phoneNumber, enabled) {
    this.number = number;
    this.imei = imei;
    this.phoneNumber = phoneNumber;
    this.enabled = enabled;

    this.connection = null;
    this.remoteAddress = null;
    this.remotePort = null;
    this.loginTime = null;
    this.lastTime = null;
    this.serialNumber = null;

    this.latitude = undefined;
    this.longitude = undefined;
    this.speed = undefined;
  }

  saveLogin() {
    axios.put(REST_HOST + '/login', {
      number: this.number,
      address: this.remoteAddress,
      port: this.remotePort,
      loginTime: this.loginTime,
      serialNumber: this.serialNumber
    })
    .then(response => {
      console.log('Login', response.data);
    });
  }

  savePacket() {
    axios.put(REST_HOST + '/packet', {
      number: this.number,
      lastTime: this.lastTime,
      serialNumber: this.serialNumber
    })
    .then(response => {
      console.log('Packet', response.data);
    });
  }

  saveLocation() {
    axios.put(REST_HOST + '/location', {
      number: this.number,
      latitude: this.latitude,
      longitude: this.longitude,
      speed: this.speed,
      lastTime: this.lastTime,
      serialNumber: this.serialNumber
    })
    .then(response => {
      console.log('Location', response.data);
    });
  }
}


class Terminals {
  constructor() {
    this.items = [];
  }

  findByNumber(number) {
    return this.items.find(item => item.number == number);
  }

  findByImei(imei) {
    return this.items.find(item => item.imei == imei);
  }

  findByConnection(connection) {
    return this.items.find(item => item.connection == connection);
  }

  findIndex(imei) {
    return this.items.findIndex(item => item.imei == imei);
  }

  add(item) {
    this.items.push(item);
  }

  removeAt(index) {
    this.items.splice(index, 1);
  }

  clear() {
    this.items = [];
  }

  populate() {
    this.clear();
    this.add(new Terminal('0355951091347489', '+358 44 950 9899', true));
    this.add(new Terminal('1234567890123456', '+358 44 950 9900', true));
    this.add(new Terminal('0123456789012345', '+358 44 950 0000', true));
  }

  addItem(item) {
    this.add(new Terminal(item.number, item.imei, item.phoneNumber, item.enabled));
  }

  async load() {
    const response = await axios.get(REST_HOST + '/bicycles');
    const items = response.data;
    const numbers = [];

    this.clear();

    for (const item of items) {
      this.addItem(item);
      numbers.push(item.number);
    }

    console.log('Load terminals', numbers);
  }

  async update() {
    const response = await axios.get(REST_HOST + '/bicycles');
    const items = response.data;

    // Remove old terminals
    const oldNumbers = [];

    for (let i = this.items.length - 1; i >= 0; i--) {
      const terminal = this.items[i];

      if (items.findIndex(item => item.number === terminal.number) == -1) {
        this.items.splice(i, 1);
        oldNumbers.push(terminal.number);
      }
    }

    if (oldNumbers.length > 0) {
      console.log('Terminals removed:', oldNumbers);
    }

    // Add new terminals
    const newItems = [];

    for (const item of items) {
      if (this.findByNumber(item.number) == null)
        newItems.push(item);
    }

    if (newItems.length > 0) {
      const addedNumbers = [];

      for (const item of newItems) {
        this.addItem(item);
        addedNumbers.push(item.number);
      }

      console.log('Terminals added:', addedNumbers);
    }
  }
}

const terminals = new Terminals();

module.exports = { Terminals, terminals };
