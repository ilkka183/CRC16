const net = require('net');
const { ConcoxTerminalPacket } = require('./concoxPacket');
const { ConcoxServerLogin } = require('./concoxLogin');
const { ConcoxServerHeartbeat } = require('./concoxHeartbeat');
const { ConcoxServerInformationTransmission } = require('./concoxInformationTransmission');

const PORT = 1234;


class ConcoxServer {
  constructor(port = PORT) {
    this.port = port;
    this.server = null;
  }

  responseTo(connection, packet) {
    switch (packet.protocolNumber) {
      case 0x01:
        this.response(
          connection,
          ConcoxServerLogin.build({ year: 19, month: 12, day: 13, hour: 2, min: 57, second: 12 }, [], packet.informationSerialNumber));

        break;

      case 0x23:
        this.response(
          connection,
          ConcoxServerHeartbeat.build(packet.informationSerialNumber));

        break;

      case 0x98:
        this.response(
          connection,
          ConcoxServerInformationTransmission.build([], packet.informationSerialNumber));

        break;
    }
  }

  response(connection, data) {
    connection.write(Buffer.from(data));
    connection.end();
  }

  start() {
    this.server = net.createServer(connection => {
      console.log('Client connected from ' + connection.remoteAddress + ':' + connection.remotePort);
    
      connection.on('data', (data) => {
        console.log('Client sent: ' + data.toString('hex'));

        const object = ConcoxTerminalPacket.parse([...data]);

        if (object) {
          console.log(object);
          this.responseTo(connection, object);
        }
      });
    
      connection.on('end', () => {
        console.log('Client disconnected');
      });
    
      connection.on('error', (err) => {
        console.log('Connection error: ' + err.message);
      });
    });

    this.server.listen(this.port, () => {
      console.log('TCP server listening on', this.server.address());
    });
  }
}

const server = new ConcoxServer();
server.start();
