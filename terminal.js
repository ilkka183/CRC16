const net = require('net');
const ConcoxService = require('./service');
const PacketParser = require('./lib/packetParser');
const { Device } = require('./lib/concox');
const { TerminalInformationTransmission } = require('./packets/informationTransmission');
const { TerminalHeartbeat } = require('./packets/heartbeat');
const { TerminalLogin } = require('./packets/login');

const HOST = 'localhost';


class ConcoxTerminal extends ConcoxService {
  constructor(imei, modelIdentificationCode, host = HOST, port = ConcoxService.defaultPort) {
    super();

    this.imei = imei,
    this.modelIdentificationCode = modelIdentificationCode;
    this.host = host;
    this.port = port;
    this.connection = null;
    this.serialNumber = 0;
  }

  send(packet) {
    const data = packet.build();
    const buffer = Buffer.from(data);

    this.connection = net.createConnection(this.port, this.host, () => {
      console.log('Connection local address: ' + this.connection.localAddress + ':' + this.connection.localPort);
      console.log('Connection remote address: ' + this.connection.remoteAddress + ':' + this.connection.remotePort);
    
      this.logPacket(packet, data);
      this.connection.write(buffer);
    });
 
    this.connection.on('data', (buffer) => {
      const data = [...buffer];
      const packet = PacketParser.parse(data, Device.SERVER);

      this.logPacket(packet, data);
      this.connection.end();
    });
     
    this.connection.on('close', () => {
      this.logAction('Client disconnected');
    });
     
    this.connection.on('error', (err) => {
      console.error(err);
    });
  }

  login(timeZone, serialNumber) {
    this.serialNumber = serialNumber;

    const packet = new TerminalLogin();
    packet.assign(this.imei, this.modelIdentificationCode, timeZone);
    packet.serialNumber = this.serialNumber;

    this.send(packet);
  }

  heartbeat() {
    this.serialNumber++;

    const packet = new TerminalHeartbeat();
    packet.assign(1, 402, 4, 1);
    packet.serialNumber = this.serialNumber;

    this.send(packet);
  }

  informationTransmission() {
    this.serialNumber++;

    const packet = new TerminalInformationTransmission();
    packet.assign(1, 402, 4, 1);
    packet.serialNumber = this.serialNumber;

    this.send(packet);
  }
}

/*

SERVER,0,185.26.50.123,1234,0#
044 950 9899

*/

const imei = '355951091347489';
const modelIdentificationCode = [0x36, 0x08];

//const host = '185.26.50.123';
const host = 'localhost';

const terminal = new ConcoxTerminal(imei, modelIdentificationCode, host);
terminal.detailLog = true;
terminal.login(100, 1);
//terminal.heartbeat();
//terminal.heartbeat();
//terminal.heartbeat();
//terminal.informationTransmission();
