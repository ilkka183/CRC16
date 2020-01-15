const net = require('net');
const colors = require('colors');
const readline = require('readline');
const ConcoxLogger = require('./logger');
const PacketParser = require('./lib/packetParser');
const { Device } = require('./lib/concox');
const { TerminalInformationTransmission } = require('./packets/informationTransmission');
const { TerminalHeartbeat } = require('./packets/heartbeat');
const { TerminalLocation } = require('./packets/location');
const { TerminalLogin } = require('./packets/login');
const { TerminalOnlineCommand } = require('./packets/onlineCommand');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.prompt();

rl.on('line', command => {
  switch (command) {
    case 'lock':
      device.lock();
      break;

    case 'unlock':
      device.unlock();
      break;

    case 'close':
    case 'stop':
      device.stop();
      break;
  }
});


class ConcoxDevice extends ConcoxLogger {
  constructor() {
    super();

    this.imei = '123456789012345',
    this.modelIdentificationCode = [0x36, 0x08];
    this.timeZone = 2;
    this.heartbeatDelay = 30000;
    this.heartbeatTimeout = null;
    this.serialNumber = undefined;
    this.maxSerialNumber = undefined;

    this.host = 'localhost';
    this.port = 1234;
    this.connection = null;
  }

  sendPacket(packet) {
    const data = packet.build();
    const buffer = Buffer.from(data);

    this.logPacket(packet, data);
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
    packet.assign(new Date(), 60.175, 24.928, 10, status);
    packet.serialNumber = this.serialNumber;

    this.sendPacket(packet);
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

  start() {
    this.connection = net.createConnection(this.port, this.host, () => {
      console.log(colors.green('Terminal connected to server ' + this.connection.remoteAddress + ':' + this.connection.remotePort));

      this.sendLoginPacket();
    });
 
    this.connection.on('data', (buffer) => {
      const data = [...buffer];
      const packets = PacketParser.parse(data, Device.SERVER);

      for (const packet of packets) {
        this.logPacket(packet, data);

        switch (packet.protocolNumber) {
          case 0x01:
            this.sendInformationTransmissionPacket();
            break;
  
          case 0x23:
            if (this.maxSerialNumber && (this.serialNumber >= this.maxSerialNumber)) {
              this.stop();
            }
            else {
              this.heartbeatTimeout = setTimeout(() => {
                this.sendHeartbeatPacket();
              }, this.heartbeatDelay);
            }
  
            break;
  
          case 0x32:
            this.sendHeartbeatPacket();
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
    clearTimeout(this.heartbeatTimeout);
    this.connection.end();
  }
}


const device = new ConcoxDevice();
device.detailLog = false;
device.imei = '355951092918858',
device.modelIdentificationCode = [0x36, 0x08];
device.timeZone = 2;
device.heartbeatDelay = 30000;
device.host = 'localhost';
device.port = 1234;
device.start();
