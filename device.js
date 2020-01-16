const net = require('net');
const colors = require('colors');
const readline = require('readline');
const ConcoxLogger = require('./logger');
const PacketParser = require('./lib/packetParser');
const { Sender } = require('./lib/concox');
const { TerminalHeartbeat } = require('./packets/heartbeat');
const { TerminalInformationTransmission } = require('./packets/informationTransmission');
const { TerminalLocation } = require('./packets/location');
const { TerminalLogin } = require('./packets/login');
const { TerminalOnlineCommand } = require('./packets/onlineCommand');


class ConcoxDevice extends ConcoxLogger {
  constructor() {
    super();

    this.number = undefined,
    this.imei = undefined,
    this.modelIdentificationCode = [0x36, 0x08];
    this.timeZone = 2;
    this.heartbeatInterval = null;
    this.heartbeatDelay = 30000;
    this.serialNumber = undefined;
    this.maxSerialNumber = undefined;

    this.latitude = undefined;
    this.longitude = undefined;

    this.route = null;
    this.routeInterval = null;
    this.routeDelay = 10000;
    this.routeIndex = 0;
    this.routeEnabled = true;

    this.host = 'localhost';
    this.port = 1234;
    this.connection = null;

    this.readline = null;
  }

  sendPacket(packet) {
    const data = packet.build();
    const buffer = Buffer.from(data);

    this.logPacket(packet, data, this.number);
    this.connection.write(buffer);
  }

  sendLoginPacket() {
    this.serialNumber = 1;

    const packet = new TerminalLogin();
    packet.assign(this.imei, this.modelIdentificationCode, this.timeZone);
    packet.serialNumber = this.serialNumber;

    this.sendPacket(packet);
  }

  sendHeartbeatPacket() {
    this.serialNumber++;

    const packet = new TerminalHeartbeat();
    packet.assign(1, 402, 4, 1);
    packet.serialNumber = this.serialNumber;

    this.sendPacket(packet);
  }

  sendOnlineCommandPacket(request) {
    this.serialNumber++;

    const packet = new TerminalOnlineCommand();
    packet.assign([0, 0, 0, 0], 1, 'OK!');
    packet.serialNumber = this.serialNumber;

    this.sendPacket(packet);

    switch (request.infoContent.command) {
      case 'UNLOCK#':
        this.unlock();
        break;
    }
  }

  sendLocationPacket(protocolNumber, status = 15) {
    this.serialNumber++;

    const packet = new TerminalLocation(protocolNumber);
    packet.assign(new Date(), this.latitude, this.longitude, 10, status);
    packet.serialNumber = this.serialNumber;

    this.sendPacket(packet);
  }

  moveUp() {
    this.latitude += 0.001;
    this.sendLocationPacket(0x32);
  }

  moveDown() {
    this.latitude -= 0.001;
    this.sendLocationPacket(0x32);
  }

  moveLeft() {
    this.longitude -= 0.001;
    this.sendLocationPacket(0x32);
  }

  moveRight() {
    this.longitude += 0.001;
    this.sendLocationPacket(0x32);
  }

  stepRoute() {
    const step = this.route[this.routeIndex];

    this.latitude += step.lat;
    this.longitude += step.lng;
    this.sendLocationPacket(0x32);

    this.routeIndex = (this.routeIndex + 1)%this.route.length
  }

  lock() {
    this.sendLocationPacket(0x33, 0xA0);
  }

  unlock() {
    this.sendLocationPacket(0x33, 0xA1);
  }

  sendInformationTransmissionPacket() {
    this.serialNumber++;

    const packet = new TerminalInformationTransmission();
    packet.assign([]);
    packet.serialNumber = this.serialNumber;

    this.sendPacket(packet);
  }

  createReadline() {
    this.readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.readline.prompt();
    
    this.readline.on('line', command => {
      switch (command) {
        case 'lock': this.lock(); break;
        case 'unlock': this.unlock(); break;
        case 'up': this.moveUp(); break;
        case 'down': this.moveDown(); break;
        case 'left': this.moveLeft(); break;
        case 'right': this.moveRight(); break;
        case 'stop': this.stop(); break;
      }
    });
  }

  setIntervals() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeatPacket();
    }, this.heartbeatDelay);

    if (this.routeEnabled && this.route) {
      this.routeInterval = setInterval(() => {
        this.stepRoute();
      }, this.routeDelay);
    }
  }

  start() {
    this.createReadline();
    
    this.connection = net.createConnection(this.port, this.host, () => {
      console.log(colors.green('Terminal connected to server ' + this.connection.remoteAddress + ':' + this.connection.remotePort));

      this.sendLoginPacket();
      this.setIntervals();
    });
 
    this.connection.on('data', (buffer) => {
      const data = [...buffer];
      const packets = PacketParser.parse(data, Sender.SERVER);

      for (const packet of packets) {
        this.logPacket(packet, data, this.number);

        switch (packet.protocolNumber) {
          case 0x01:
            this.sendInformationTransmissionPacket();
            break;
  
          case 0x23:
            if (this.maxSerialNumber && (this.serialNumber >= this.maxSerialNumber))
              this.stop();
  
            break;
  
          case 0x80:
            this.sendOnlineCommandPacket(packet);
            break;
  
          case 0x98:
            this.sendLocationPacket(0x32);
            break;
          }
      }
    });
     
    this.connection.on('close', () => {
      this.logAction('Terminal disconnected');
      process.exit();
    });
     
    this.connection.on('error', (err) => {
      console.error(err.red);
    });
  }

  stop() {
    clearInterval(this.heartbeatInterval);

    if (this.routeInterval)
      clearInterval(this.routeInterval);

    this.connection.end();
  }
}

module.exports = ConcoxDevice;
