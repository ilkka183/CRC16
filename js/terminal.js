const net = require('net');
const ConcoxDevice = require('./device');
const { ConcoxTerminalLogin } = require('./concoxLogin');
const { ConcoxTerminalHeartbeat } = require('./concoxHeartbeat');
const { ConcoxTerminalInformationTransmission } = require('./concoxInformationTransmission');

const HOST = 'localhost';


class ConcoxTerminal extends ConcoxDevice {
  constructor(imei, modelIdentificationCode, host = HOST, port = ConcoxDevice.defaultPort) {
    super();
    this.imei = imei,
    this.modelIdentificationCode = modelIdentificationCode;
    this.host = host;
    this.port = port;
    this.client = null;
    this.informationSerialNumber = 0;
  }

  send(data) {
    this.client = net.createConnection(this.port, this.host, () => {
      console.log('Connection local address: ' + this.client.localAddress + ':' + this.client.localPort);
      console.log('Connection remote address: ' + this.client.remoteAddress + ':' + this.client.remotePort);
    
      this.log('Client request', data);
      this.client.write(data);
    });
 
    this.client.on('data', (data) => {
      this.log('Server response', data);
      this.client.end();
    });
     
    this.client.on('close', () => {
      console.log('Client disconnected');
    });
     
    this.client.on('error', (err) => {
      console.error(err);
    });
  }

  sendPacket(data) {
    this.send(Buffer.from(data));
  }  

  login(timeZone, informationSerialNumber) {
    this.informationSerialNumber = informationSerialNumber;
    this.sendPacket(ConcoxTerminalLogin.build(this.imei, this.modelIdentificationCode, timeZone, this.informationSerialNumber));
  }

  heartbeat() {
    this.informationSerialNumber++;
    this.sendPacket(ConcoxTerminalHeartbeat.build(1, 402, 4, 1, this.informationSerialNumber));
  }

  informationTransmission() {
    this.informationSerialNumber++;
    this.sendPacket(ConcoxTerminalInformationTransmission.build(1, 402, 4, 1, this.informationSerialNumber));
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
terminal.login(100, 1);
//terminal.heartbeat();
//terminal.heartbeat();
//terminal.heartbeat();
//terminal.informationTransmission();
