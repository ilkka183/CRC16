const net = require('net');
const { ConcoxTerminalLogin } = require('./concoxLogin');
const { ConcoxTerminalHeartbeat } = require('./concoxHeartbeat');
const { ConcoxTerminalInformationTransmission } = require('./concoxInformationTransmission');

const HOST = 'localhost';
const PORT = 1234;


class ConcoxTerminal {
  constructor(imei, modelIdentificationCode, host = HOST, port = PORT) {
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
      
      const buffer = Buffer.from(data);
      this.client.write(buffer);
      console.log('Client sent:', buffer.toString('hex'));
    });
 
    this.client.on('data', (data) => {
      console.log('Client received:', data.toString('hex'));
    });
     
    this.client.on('close', () => {
      console.log('Client disconnected');
    });
     
    this.client.on('error', (err) => {
      console.error(err);
    });
  }

  login(timeZone) {
    this.informationSerialNumber = 1;
    this.send(ConcoxTerminalLogin.build(this.imei, this.modelIdentificationCode, timeZone, this.informationSerialNumber));
  }

  heartbeat() {
    this.informationSerialNumber++;
    this.send(ConcoxTerminalHeartbeat.build(1, 402, 4, 1, this.informationSerialNumber));
  }

  informationTransmission() {
    this.informationSerialNumber++;
    this.send(ConcoxTerminalInformationTransmission.build(1, 402, 4, 1, this.informationSerialNumber));
  }
}

const terminal = new ConcoxTerminal('0355951091347489', [0x36, 0x08]);
terminal.login(1);
//terminal.heartbeat();
//terminal.heartbeat();
//terminal.heartbeat();
//terminal.informationTransmission();
