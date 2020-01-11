const net = require('net');
const colors = require('colors');
const ConcoxLogger = require('./logger');
const PacketParser = require('./lib/packetParser');
const { terminals } = require('./terminals')
const { Device } = require('./lib/concox');
const { ServerHeartbeat } = require('./packets/heartbeat');
const { ServerLocation } = require('./packets/location');
const { ServerLogin } = require('./packets/login');
const { ServerInformationTransmission } = require('./packets/informationTransmission');
const { ServerOnlineCommand } = require('./packets/onlineCommand');


/*

ssh ilkka@superapp1.superapp.fi
https://docs.google.com/document/d/1laqBur8dCCLdN_wswdgb3KhQrnBgXfdjtgCCoN1dHhY/edit

*/

class ConcoxServer extends ConcoxLogger {
  constructor() {
    super();

    this.server = null;
  }

  sendPacket(connection, packet) {
    const data = packet.build();
    const buffer = Buffer.from(data);

    this.logPacket(packet, data);
    connection.write(buffer);
  }

  sendCommand(terminal, command) {
    if (terminal.connection) {
      const response = new ServerOnlineCommand();
      response.assign(command);
      response.serialNumber = terminal.serialNumber;
  
      this.sendPacket(terminal.connection, response);
    }
  }

  sendLoginResponse(connection, request) {
    const imei = request.infoContent.imei;
    const terminal = terminals.findByImei(imei);

    if (terminal) {
      const time = new Date();

      const response = new ServerLogin();
      response.assign(time, []);
      response.serialNumber = request.serialNumber;
  
      this.sendPacket(connection, response);

      terminal.server = this;
      terminal.connection = connection;
      terminal.address = connection.remoteAddress;
      terminal.port = connection.remotePort;
      terminal.loginTime = time;
      terminal.serialNumber = request.serialNumber;
    } else {
      this.logError(`IMEI ${imei} not found`);
    }
  }

  sendHeartbeatResponse(connection, request, terminal) {
    let response = new ServerHeartbeat();
    response.assign();
    response.serialNumber = request.serialNumber;

    this.sendPacket(connection, response);
  }

  sendLocationResponse(connection, request, terminal) {
    if (request.infoContent.gpsInformation) {
      terminal.latitude = request.infoContent.gpsInformation.latitude/1800000;
      terminal.longitude = request.infoContent.gpsInformation.longitude/1800000;
      terminal.speed = request.infoContent.gpsInformation.speed;
    }

    let response = new ServerLocation();
    response.assign();
    response.serialNumber = request.serialNumber;

    this.sendPacket(connection, response);
  }

  sendInformationTransmissionResponse(connection, request, terminal) {
    const response = new ServerInformationTransmission();
    response.assign([]);
    response.serialNumber = request.serialNumber;

    this.sendPacket(connection, response);
  }

  processRequest(connection, request) {
    const terminal = terminals.findByConnection(connection);

    if (terminal) {
      const time = new Date();

      terminal.serialTime = time;
      terminal.serialNumber = request.serialNumber;
    }

    switch (request.protocolNumber) {
      case 0x01: this.sendLoginResponse(connection, request); break;
      case 0x23: this.sendHeartbeatResponse(connection, request, terminal); break;
      case 0x32: this.sendLocationResponse(connection, request, terminal, request); break;
      case 0x33: this.sendLocationResponse(connection, request, terminal); break;
      case 0x98: this.sendInformationTransmissionResponse(connection, request, terminal); break;
    }
  }

  listen(port, callback) {
    this.server = net.createServer(connection => {
      console.log(colors.green('Client connected from ' + connection.remoteAddress + ':' + connection.remotePort));
    
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
        const terminal = terminals.findByConnection(connection);

        if (terminal)
          terminal.disconnect();

        console.log(terminals);
        this.logAction('Client disconnected');
      });
    
      connection.on('error', (error) => {
        this.logError('Error', error);
      });
    });

    this.server.listen(port, callback);
  }
}

module.exports = ConcoxServer;
