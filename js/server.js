const net = require('net');
const ConcoxDevice = require('./device');
const PacketParser = require('./packetParser');
const { Device } = require('./concox');
const { ServerLogin } = require('./loginPacket');
const { ServerHeartbeat } = require('./heartbeatPacket');
const { ServerOnlineCommand } = require('./onlineCommandPacket');
const { ServerInformationTransmission } = require('./informationTransmissionPacket');


class ConcoxServer extends ConcoxDevice {
  constructor(port = ConcoxDevice.defaultPort) {
    super();

    this.port = port;
    this.server = null;
  }

  sendPacket(connection, packet) {
    const data = packet.build();
    const buffer = Buffer.from(data);

    this.logPacket(packet, data);
    connection.write(buffer);
  }

  responseToLogin(request, connection) {
    const response = new ServerLogin();
    response.assign({ year: 19, month: 12, day: 13, hour: 2, min: 57, second: 12 }, []);
    response.serialNumber = request.serialNumber;

    this.sendPacket(connection, response);
  }

  responseToHeartbeat(request, connection) {
    let response = new ServerHeartbeat();
    response.assign();
    response.serialNumber = request.serialNumber;

    this.sendPacket(connection, response);

    response = new ServerOnlineCommand();
    response.assign('UNLOCK#');
    response.serialNumber = request.serialNumber;

    this.sendPacket(connection, response);
  }

  responseToInformationTransmission(request, connection) {
    const response = new ServerInformationTransmission();
    response.assign([]);
    response.serialNumber = request.serialNumber;

    this.sendPacket(connection, response);
  }

  responseTo(request, connection) {
    switch (request.protocolNumber) {
      case 0x01:
        this.responseToLogin(request, connection);
        break;

      case 0x23:
        this.responseToHeartbeat(request, connection);
        break;

      case 0x98:
        this.responseToInformationTransmission(request, connection);
        break;
    }
  }

  start() {
    this.server = net.createServer(connection => {
      console.log('Client connected from ' + connection.remoteAddress + ':' + connection.remotePort);
    
      connection.on('data', (buffer) => {
        const data = [...buffer];
        const request = PacketParser.parse(data, Device.TERMINAL);

        if (request) {
          this.logPacket(request, data);
          this.responseTo(request, connection);
        } else {
          this.logData('Unknown client request', data);
        }
      });
    
      connection.on('end', () => {
        this.logAction('Client disconnected');
      });
    
      connection.on('error', (error) => {
        this.logError('Error', error);
      });
    });

    this.server.listen(this.port, () => {
      console.log('TCP server listening on', this.server.address());
    });
  }
}

const server = new ConcoxServer();
server.start();
