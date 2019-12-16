const net = require('net');
const { ConcoxLoginTerminal } = require('./concoxLogin');

const HOST = 'localhost';
const PORT = 1234;


class ConcoxClient {
  constructor(host, port) {
    this.host = host || HOST;
    this.port = port || PORT;
    this.client = null;
  }

  get address() {
    return this.host + ':' + this.port;
  }

  send(data) {
    this.client = new net.Socket();
 
    this.client.connect(this.port, this.host, () => {
      console.log('Client connected to ' + this.address);
      this.client.write(Buffer.from(data));
    });
     
    this.client.on('data', (data) => {
      console.log('Client received:', data.toString('hex'));
    
      if (data.toString().endsWith('exit')) {
        this.client.destroy();
      }
    });
     
    this.client.on('close', () => {
      console.log('Client disconnected');
    });
     
    this.client.on('error', (err) => {
      console.error(err);
    });
  }
}

const client = new ConcoxClient();
client.send(ConcoxLoginTerminal.build('0355951091347489', [0x36, 0x08], 1, 1));
