const net = require('net');
const Concox = require('./concox');
const { ConcoxLoginServer } = require('./concoxLogin');

const HOST = 'localhost';
const PORT = 1234;


class ConcoxServer {
  constructor(host, port) {
    this.host = host || HOST;
    this.port = port || PORT;
    this.server = null;
  }

  start() {
    this.server = net.createServer(connection => {
      const remoteAddress = connection.remoteAddress + ':' + connection.remotePort;
      console.log('Client connected from ' + remoteAddress);
    
      connection.on('data', (data) => {
        console.log('Client sent: ' + data.toString('hex'));

        const response = ConcoxLoginServer.build({ year: 19, month: 12, day: 13, hour: 2, min: 57, second: 12 }, [], 1);

        connection.write(Buffer.from(response));
        connection.write('exit');
      });
    
      connection.on('close', () => {
        console.log('Client disconnected');
      });
    
      connection.on('error', (err) => {
        console.log('Connection error: ' + err.message);
      });
    });

    this.server.listen(this.port, this.host, () => {
      console.log('TCP server listening on', this.server.address());
    });
  }
}

const server = new ConcoxServer();
server.start();