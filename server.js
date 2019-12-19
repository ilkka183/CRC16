const net = require('net');
const ConcoxService = require('./service');
const PacketParser = require('./lib/packetParser');
const { Device } = require('./lib/concox');
const { ServerHeartbeat } = require('./packets/heartbeatPacket');
const { ServerLocation } = require('./packets/locationPacket');
const { ServerLogin } = require('./packets/loginPacket');
const { ServerInformationTransmission } = require('./packets/informationTransmissionPacket');
const { ServerOnlineCommand } = require('./packets/onlineCommandPacket');


/*

ssh ilkka@superapp1.superapp.fi
https://docs.google.com/document/d/1laqBur8dCCLdN_wswdgb3KhQrnBgXfdjtgCCoN1dHhY/edit

*/

class ConcoxServer extends ConcoxService {
  constructor(port = ConcoxService.defaultPort) {
    super();

    this.port = port;
    this.server = null;
    this.serialNumber = null;
  }

  sendPacket(connection, packet) {
    const data = packet.build();
    const buffer = Buffer.from(data);

    this.logPacket(packet, data);
    connection.write(buffer);
  }

  sendCommand(connection, command) {
    const response = new ServerOnlineCommand();
    response.assign(command);
    response.serialNumber = this.serialNumber;

    this.sendPacket(connection, response);
  }

  sendLoginResponse(connection) {
    const time = new Date();

    const response = new ServerLogin();

    response.assign({
      year: time.getFullYear() - 2000,
      month: time.getMonth() + 1,
      day: time.getDate(),
      hour: time.getHours(),
      min: time.getMinutes(),
      second: time.getSeconds() },
      []);

    response.serialNumber = this.serialNumber;

    this.sendPacket(connection, response);
  }

  sendHeartbeatResponse(connection) {
    let response = new ServerHeartbeat();
    response.assign();
    response.serialNumber = this.serialNumber;

    this.sendPacket(connection, response);

    this.sendCommand(connection, 'UNLOCK#');
  }

  sendLocationResponse(connection) {
    let response = new ServerLocation();
    response.assign();
    response.serialNumber = this.serialNumber;

    this.sendPacket(connection, response);
  }

  sendInformationTransmissionResponse(connection) {
    const response = new ServerInformationTransmission();
    response.assign([]);
    response.serialNumber = this.serialNumber;

    this.sendPacket(connection, response);
  }

  processRequest(connection, request) {
    this.serialNumber = request.serialNumber;

    switch (request.protocolNumber) {
      case 0x01: this.sendLoginResponse(connection); break;
      case 0x23: this.sendHeartbeatResponse(connection); break;
      case 0x32: this.sendLocationResponse(connection); break;
      case 0x33: this.sendLocationResponse(connection); break;
      case 0x98: this.sendInformationTransmissionResponse(connection); break;
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
          this.processRequest(connection, request);
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
server.detailLog = true;
server.start();