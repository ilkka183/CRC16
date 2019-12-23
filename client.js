const net = require('net');
const colors = require('colors');
const ConcoxLogger = require('./logger');
const PacketParser = require('./lib/packetParser');
const { Device } = require('./lib/concox');
const { TerminalInformationTransmission } = require('./packets/informationTransmission');
const { TerminalHeartbeat } = require('./packets/heartbeat');
const { TerminalLogin } = require('./packets/login');

const HOST = 'localhost';


class ConcoxClient extends ConcoxLogger {
  constructor(imei, modelIdentificationCode, timeZone) {
    super();

    this.imei = imei,
    this.modelIdentificationCode = modelIdentificationCode;
    this.timeZone = timeZone;
    this.host = HOST;
    this.port = 1234;
    this.connection = null;
    this.serialNumber = undefined;
  }

  writePacket(packet) {
    const data = packet.build();
    const buffer = Buffer.from(data);

    this.logPacket(packet, data);
    this.connection.write(buffer);
  }

  writeLoginPacket() {
    this.serialNumber = 1;

    const packet = new TerminalLogin();
    packet.assign(this.imei, this.modelIdentificationCode, this.timeZone);
    packet.serialNumber = this.serialNumber;

    this.writePacket(packet);
  }

  writeHeartbeatPacket() {
    this.serialNumber++;

    const packet = new TerminalHeartbeat();
    packet.assign(1, 402, 4, 1);
    packet.serialNumber = this.serialNumber;

    this.writePacket(packet);
  }

  writeInformationTransmissionPacket() {
    this.serialNumber++;

    const packet = new TerminalInformationTransmission();
    packet.assign(1, 402, 4, 1);
    packet.serialNumber = this.serialNumber;

    this.writePacket(packet);
  }

  start() {
    this.connection = net.createConnection(this.port, this.host, () => {
      console.log(colors.green('Connection local address: ' + this.connection.localAddress + ':' + this.connection.localPort));
      console.log(colors.green('Connection remote address: ' + this.connection.remoteAddress + ':' + this.connection.remotePort));

      this.writeLoginPacket();
    });
 
    this.connection.on('data', (buffer) => {
      const data = [...buffer];
      const packet = PacketParser.parse(data, Device.SERVER);
      this.logPacket(packet, data);

      switch (packet.protocolNumber) {
        case 0x01:
          this.writeHeartbeatPacket();
          break;

        case 0x23:
          if (this.serialNumber > 2)
            this.connection.end();
          else
            this.writeHeartbeatPacket();

          break;
      }
    });
     
    this.connection.on('close', () => {
      this.logAction('Client disconnected');
    });
     
    this.connection.on('error', (err) => {
      console.error(err.red);
    });
  }
}

/*

SERVER,0,185.26.50.123,1234,0#
044 950 9899

*/

const imei = '355951091347489';
const modelIdentificationCode = [0x36, 0x08];
const timeZone = 2;

const client = new ConcoxClient(imei, modelIdentificationCode, timeZone);
//client.host = '185.26.50.123';
//client.detailLog = true;
client.start();