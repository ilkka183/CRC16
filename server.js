const net = require('net');
const colors = require('colors');
const ConcoxLogger = require('./logger');
const PacketParser = require('./lib/packetParser');
const { terminals } = require('./terminals')
const { Sender } = require('./lib/concox');
const { ServerHeartbeat } = require('./packets/heartbeat');
const { ServerInformationTransmission } = require('./packets/informationTransmission');
const { ServerLocation } = require('./packets/location');
const { ServerLogin } = require('./packets/login');
const { ServerOnlineCommand } = require('./packets/onlineCommand');


/*

ssh ilkka@superapp1.superapp.fi
https://docs.google.com/document/d/1laqBur8dCCLdN_wswdgb3KhQrnBgXfdjtgCCoN1dHhY/edit
185.26.50.123
044 950 9899

*/

class ConcoxServer extends ConcoxLogger {
  constructor() {
    super();

    this.server = null;
    this.commandTimeoutDelay = 10000;
  }

  sendPacket(terminal, packet) {
    const data = packet.build();
    const buffer = Buffer.from(data);

    this.logPacket(packet, data, terminal.number);
    terminal.connection.write(buffer);
  }

  sendOnlineCommand(terminal, command) {
    return new Promise((resolve, reject) => {
      if (terminal.connection) {
        const response = new ServerOnlineCommand();
        response.assign(command);
        response.serialNumber = terminal.serialNumber;
    
        this.sendPacket(terminal, response);

        terminal.onlineCommandResolve = resolve;

        const delay = 5000;

        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          reject(`Command "${command}" timed out in ${this.commandTimeoutDelay} ms.`)
        }, this.commandTimeoutDelay);
      }
    });
  }

  handleOnlineCommandResponse(packet, terminal) {
    if (terminal.onlineCommandResolve) {
      terminal.onlineCommandResolve(packet.infoContent.command);
    }
  }

  sendLoginResponse(connection, request) {
    const imei = request.infoContent.imei.substr(1, 15);
    const terminal = terminals.findByImei(imei);

    if (terminal) {
      const time = new Date();

      const response = new ServerLogin();
      response.assign(time, []);
      response.serialNumber = request.serialNumber;
  
      terminal.server = this;
      terminal.connection = connection;
      terminal.address = connection.remoteAddress;
      terminal.port = connection.remotePort;
      terminal.loginTime = time;
      terminal.serialNumber = request.serialNumber;

      this.sendPacket(terminal, response);
    } else {
      this.logError(`IMEI ${imei} not found`);
    }
  }

  sendHeartbeatResponse(request, terminal) {
    let response = new ServerHeartbeat();
    response.assign();
    response.serialNumber = request.serialNumber;

    this.sendPacket(terminal, response);
  }

  sendLocationResponse(request, terminal) {
    if (request.infoContent.gpsInformation) {
      terminal.latitude = request.infoContent.gpsInformation.latitude/1800000;
      terminal.longitude = request.infoContent.gpsInformation.longitude/1800000;
      terminal.speed = request.infoContent.gpsInformation.speed;
    }

    let response = new ServerLocation(request.protocolNumber);
    response.assign();
    response.serialNumber = request.serialNumber;

    this.sendPacket(terminal, response);

    if (request.protocolNumber == 0x33) {
      switch (request.infoContent.status) {
        case 0xA0:
          console.log(`Terminal ${terminal.number} has been locked`);
          terminal.locked = true;
          terminal.stopUsage();
          break;

        case 0xA1:
          console.log(`Terminal ${terminal.number} has been unlocked`);
          terminal.locked = false;
          terminal.startUsage();
          break;
      }
    }
  }

  sendInformationTransmissionResponse(request, terminal) {
    const response = new ServerInformationTransmission();
    response.assign([]);
    response.serialNumber = request.serialNumber;

    this.sendPacket(terminal, response);
  }

  processRequest(connection, request, terminal) {
    if (terminal) {
      const time = new Date();

      terminal.serialTime = time;
      terminal.serialNumber = request.serialNumber;
    }

    switch (request.protocolNumber) {
      case 0x01: this.sendLoginResponse(connection, request); break;
      case 0x21: this.handleOnlineCommandResponse(request, terminal); break;
      case 0x23: this.sendHeartbeatResponse(request, terminal); break;
      case 0x32: this.sendLocationResponse(request, terminal); break;
      case 0x33: this.sendLocationResponse(request, terminal); break;
      case 0x98: this.sendInformationTransmissionResponse(request, terminal); break;
    }
  }

  listen(port, callback) {
    this.server = net.createServer(connection => {
      const date = new Date();
      console.log(colors.green('Client connected on ' + date.toString() + 'from ' + connection.remoteAddress + ':' + connection.remotePort));
    
      connection.on('data', (buffer) => {
        const data = [...buffer];
        const requests = PacketParser.parse(data, Sender.TERMINAL);

        if (requests.length > 0) {
          for (const request of requests) {
            const terminal = terminals.findByConnection(connection);

            this.logPacket(request, data, terminal ? terminal.number : undefined);
            this.processRequest(connection, request, terminal);
          }
        } else {
          this.logData('Unknown client request', data);
        }
      });
    
      connection.on('end', () => {
        const terminal = terminals.findByConnection(connection);

        if (terminal)
          terminal.disconnect();

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
