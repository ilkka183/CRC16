const axios = require('axios');

const REST_HOST = 'http://localhost:49511/wp-json/juro/v1';


class Terminal {
  constructor(number, imei, phoneNumber, enabled) {
    this.number = number;
    this.imei = imei;
    this.phoneNumber = phoneNumber;
    this.enabled = enabled;

    this.server = null;
    this.connection = null;
    this.address = undefined;
    this.port = undefined;
    this.loginTime = undefined;
    this.serialTime = undefined;
    this.serialNumber = undefined;

    this.latitude = undefined;
    this.longitude = undefined;
    this.speed = undefined;
  }

  disconnect() {
    this.server = null;
    this.connection = null;
    this.address = undefined;
    this.port = undefined;
    this.loginTime = undefined;
    this.serialNumber = undefined;
  }

  getObject() {
    return {
      number: this.number,
      imei: this.imei,
      phoneNumber: this.phoneNumber,
      enabled: this.enabled,
      connected: this.connection != null,
      loginTime: this.loginTime,
      serialTime: this.serialTime,
      serialNumber: this.serialNumber,
      latitude: this.latitude,
      longitude: this.longitude,
      speed: this.speed,
    }
  }

  sendCommand(command) {
    if (this.server) {
      this.server.sendCommand(this, command);
    }
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

  findIndexByNumber(number) {
    return this.items.findIndex(item => item.number == number);
  }

  findIndexByImei(imei) {
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
    this.add(new Terminal('1001', '0355951091347489', '+358 44 950 9899', true));
    this.add(new Terminal('1002', '1234567890123456', '+358 44 950 9900', true));
    this.add(new Terminal('1003', '0123456789012345', '+358 44 950 0000', true));
  }

  addItem(item) {
    this.add(new Terminal(item.number, item.imei, item.phoneNumber, item.enabled));
  }

  async getBicycles() {
    const response = await axios.get(REST_HOST + '/bicycles');
    return response.data;
  }

  async load() {
    const items = await this.getBicycles();
    const numbers = [];

    this.clear();

    for (const item of items) {
      this.addItem(item);
      numbers.push(item.number);
    }

    console.log('Load terminals', numbers);
  }

  async update() {
    const items = await this.getBicycles();

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

  async initialize(intervalInMinutes) {
    await terminals.load();
    console.log(`Terminals updated every ${intervalInMinutes} minutes`);

    setInterval(() => {
      terminals.update();
    }, intervalInMinutes*60*1000);
  }
}

const terminals = new Terminals();

module.exports = { Terminal, Terminals, terminals };
