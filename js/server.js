const net = require('net');
const ConcoxDevice = require('./device');
const { ConcoxTerminalPacket } = require('./concoxPacket');
const { ConcoxServerLogin } = require('./concoxLogin');
const { ConcoxServerHeartbeat } = require('./concoxHeartbeat');
const { ConcoxServerOnlineCommand } = require('./concoxOnlineCommand');
const { ConcoxServerInformationTransmission } = require('./concoxInformationTransmission');


class ConcoxServer extends ConcoxDevice {
  constructor(port = ConcoxDevice.defaultPort) {
    super();
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

        this.response(
          connection,
          ConcoxServerOnlineCommand.build('UNLOCK#', packet.informationSerialNumber));

        break;

      case 0x98:
        this.response(
          connection,
          ConcoxServerInformationTransmission.build([], packet.informationSerialNumber));

        break;
    }
  }

  response(connection, data) {
    const buffer = Buffer.from(data);

    this.log('Server response', buffer);

    connection.write(buffer);
  }

  start() {
    this.server = net.createServer(connection => {
      console.log('Client connected from ' + connection.remoteAddress + ':' + connection.remotePort);
    
      connection.on('data', (data) => {
        this.log('Client request', data);

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
