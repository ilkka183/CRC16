const axios = require('axios');

const REST_HOST = 'http://localhost:51411/wp-json/juro/v1';


class Terminal {
  constructor(number, imei, phoneNumber, enabled, locked, latitude, longitude) {
    this.number = number;
    this.imei = imei;
    this.phoneNumber = phoneNumber;
    this.enabled = enabled;
    this.locked = locked;

    this.server = null;
    this.connection = null;
    this.address = undefined;
    this.port = undefined;
    this.loginTime = undefined;
    this.serialTime = undefined;
    this.serialNumber = undefined;

    this.startTime = undefined;
    this.stopTime = undefined;

    this.latitude = latitude;
    this.longitude = longitude;
    this.speed = undefined;

    this.onlineCommandResolve = null;
  }

  connect(server, connection, serialNumber) {
    this.server = server;
    this.connection = connection;
    this.address = connection.remoteAddress;
    this.port = connection.remotePort;
    this.loginTime = new Date();
    this.serialNumber = serialNumber;
  }

  disconnect() {
    this.server = null;
    this.connection = null;
    this.address = undefined;
    this.port = undefined;
    this.loginTime = undefined;
    this.serialNumber = undefined;
  }

  startUsage() {
    this.startTime = new Date();
    this.stopTime = undefined;

    console.log(`Terminal ${this.number} has been unlocked`);
    this.locked = false;
  }

  stopUsage() {
    this.stopTime = new Date();

    console.log(`Terminal ${this.number} has been locked`);
    this.locked = true;
  }

  get duration() {
    return (this.startTime && this.stopTime) ? Math.floor((this.stopTime - this.startTime)/1000) : undefined;
  }

  getObject() {
    return {
      number: this.number,
      imei: this.imei,
      phoneNumber: this.phoneNumber,
      enabled: this.enabled,
      locked: this.locked,
      connected: this.connection != null,
      startTime: this.startTime,
      stopTime: this.stopTime,
      duration: this.duration,
      latitude: this.latitude,
      longitude: this.longitude,
      speed: this.speed,
      loginTime: this.loginTime,
      serialTime: this.serialTime,
      serialNumber: this.serialNumber,
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
  constructor(testingCity = undefined) {
    this.testingCity = testingCity;
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

  get testLocation() {
    const helsinki = { lat: 60.169035, lng: 24.936149 }
    const lahti = { lat: 60.982010, lng: 25.658957 }

    switch (this.testingCity) {
      case 'Helsinki': return helsinki;
      case 'Lahti': return lahti;
    }
  
    return undefined;
  }

  populate() {
    this.clear();

    switch (this.testingCity) {
      case 'Lahti':
        this.add(new Terminal('7551040072', '355951092918858', '+358 44 950 9899', true, true, 60.982010, 25.658957));
        this.add(new Terminal('1001', '123456789012345', '+358 44 950 9900', true, true, 60.982902, 25.657763, 10));
        this.add(new Terminal('1002', '012345678901234', '+358 44 950 9901', true, true, 60.981506, 25.661433, 10));
        break;

      case 'Helsinki':
        this.add(new Terminal('7551040072', '355951092918858', '+358 44 950 9899', true, true, 60.169035, 24.936149));
        this.add(new Terminal('1001', '123456789012345', '+358 44 950 9900', true, true, 60.170714, 24.941294, 10));
        this.add(new Terminal('1002', '012345678901234', '+358 44 950 9901', true, true, 60.171324, 24.935333, 10));
        this.add(new Terminal('1003', '111111111111111', '+358 44 950 9902', true, true, 60.172144, 24.938945, 10));
        this.add(new Terminal('1004', '222222222222222', '+358 44 950 9903', true, true, 60.171367, 24.937065, 10));
        break;
    }

    const numbers = [];

    for (const item of this.items)
      numbers.push(item.number);

    console.log('Testing terminals', numbers);
  }

  addItem(item) {
    this.add(new Terminal(item.number, item.imei, item.phoneNumber, item.enabled));
  }

  load(intervalInSeconds) {
    axios.get(REST_HOST + '/bicycles')
      .then(response => {
        const items = response.data;
        const numbers = [];

        this.clear();
    
        for (const item of items) {
          this.addItem(item);
          numbers.push(item.number);
        }
    
        console.log('Load terminals', numbers);

        setInterval(() => {
          this.update();
        }, intervalInSeconds*1000);

        console.log(`Terminals updated every ${intervalInSeconds} seconds`);
      });
  }

  update() {
    axios.get(REST_HOST + '/bicycles')
      .then(response => {
        const items = response.data;

        // Remove old terminals
        const removedNumbers = [];

        for (let i = this.items.length - 1; i >= 0; i--) {
          const terminal = this.items[i];

          if (items.findIndex(item => item.number === terminal.number) == -1) {
            this.items.splice(i, 1);

            removedNumbers.push(terminal.number);
          }
        }

        if (removedNumbers.length > 0)
          console.log('Removed terminals:', removedNumbers);

        // Add new and update exixtins terminals
        const addedNumbers = [];
        const updatedNumbers = [];

        for (const item of items) {
          const terminal = this.findByNumber(item.number);

          if (terminal) {
            // Update exixting if modified
            if ((terminal.imei != item.imei) ||
              (terminal.phoneNumber != item.phoneNumber) ||
              (terminal.enabled != item.enabled))
            {
              terminal.imei = item.imei;
              terminal.phoneNumber = item.phoneNumber;
              terminal.enabled = item.enabled;

              updatedNumbers.push(item.number);
            }
          } else {
            // Add new
            this.addItem(item);

            addedNumbers.push(item.number);
          }
        }

        if (addedNumbers.length > 0)
          console.log('Added terminals:', addedNumbers);

        if (updatedNumbers.length > 0)
          console.log('Updated terminals:', updatedNumbers);
      });
  }

  initialize(intervalInSeconds) {
    if (this.testingCity)
      this.populate();
    else
      this.load(intervalInSeconds);
  }
}

const terminals = new Terminals('Lahti');

module.exports = { Terminal, Terminals, terminals };
