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

  sendLoginResponse(connection, request) {
    const imei = request.infoContent.imei;
    const serialNumber = request.serialNumber;

    const terminal = terminals.findByImei(imei);

    if (terminal) {
      const now = new Date();

      const response = new ServerLogin();
  
      response.assign(now, []);
      response.serialNumber = this.serialNumber;
  
      this.sendPacket(connection, response);

      terminal.connection = connection;
      terminal.remoteAddress = connection.remoteAddress;
      terminal.remotePort = connection.remotePort;
      terminal.loginTime = now;
      terminal.serialNumber = serialNumber;

      terminal.saveLogin();
    } else {
      this.logError(`IMEI ${imei} not found`);
    }
  }

  sendHeartbeatResponse(connection, terminal) {
    let response = new ServerHeartbeat();
    response.assign();
    response.serialNumber = this.serialNumber;

    this.sendPacket(connection, response);

    if (terminal)
      terminal.savePacket();
  }

  sendLocationResponse(connection, terminal, request) {
    let response = new ServerLocation();
    response.assign();
    response.serialNumber = this.serialNumber;

    this.sendPacket(connection, response);

    if (terminal) {
      if (request.infoContent.gpsInformation) {
        terminal.latitude = request.infoContent.gpsInformation.latitude/1800000;
        terminal.longitude = request.infoContent.gpsInformation.longitude/1800000;
        terminal.speed = request.infoContent.gpsInformation.speed;
  
        terminal.saveLocation();
      } else {
        terminal.savePacket();
      }
    }
  }

  sendInformationTransmissionResponse(connection, terminal) {
    const response = new ServerInformationTransmission();
    response.assign([]);
    response.serialNumber = this.serialNumber;

    this.sendPacket(connection, response);

    if (terminal)
      terminal.savePacket();
  }

  processRequest(connection, request) {
    this.serialNumber = request.serialNumber;

    const terminal = terminals.findByConnection(connection);

    if (terminal) {
      const time = new Date();

      terminal.lastTime = time;
      terminal.serialNumber = this.serialNumber;
    }

    switch (request.protocolNumber) {
      case 0x01: this.sendLoginResponse(connection, request); break;
      case 0x23: this.sendHeartbeatResponse(connection, terminal); break;
      case 0x32: this.sendLocationResponse(connection, terminal, request); break;
      case 0x33: this.sendLocationResponse(connection, terminal); break;
      case 0x98: this.sendInformationTransmissionResponse(connection, terminal); break;
    }
  }

  async start(port) {
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

        if (terminal) {
          terminal.connection = null;
          terminal.remoteAddress = null;
          terminal.remotePort = null;
          terminal.loginTime = null;
          terminal.serialNumber = null;
        }

        console.log(terminals);
        this.logAction('Client disconnected');
      });
    
      connection.on('error', (error) => {
        this.logError('Error', error);
      });
    });

    this.server.listen(port, () => {
      console.log('Juro TCP server listening on', this.server.address());
    });
  }
}

module.exports = ConcoxServer;
