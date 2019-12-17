const ConcoxReader = require('./concoxReader');
/*
const { ConcoxTerminalLogin, ConcoxServerLogin } = require('./concoxLogin');
const { ConcoxTerminalHeartbeat, ConcoxServerHeartbeat } = require('./concoxHeartbeat');
const { ConcoxTerminalOnlineCommand, ConcoxServerOnlineCommand } = require('./concoxOnlineCommand');
const { ConcoxTerminalInformationTransmission, ConcoxServerInformationTransmission } = require('./concoxInformationTransmission');
*/

class ConcoxPacket {
  constructor() {
  }

  getTitle() {
    return undefiled;
  }

  getProtocolNumber() {
    return undefiled;
  }

  getEncryptedCrc() {
    return false;
  }

  build() {
    const writer = new ConcoxWriter(this.getProtocolNumber());
    this.write(writer);
    return writer.encapsulate(this.getEncryptedCrc());
  }
}


class ConcoxTerminalPacket extends ConcoxPacket {
  constructor() {
    super();
  }

  static parse(data) {
    const reader = new ConcoxReader(data, true);
    let packet = null;
 
/*    
    switch (reader.protocolNumber) {
      case 0x01: packet = ConcoxTerminalLogin(); break;
      case 0x21: packet = ConcoxTerminalOnlineCommand(); break;
      case 0x23: packet = ConcoxTerminalHeartbeat(); break;
      case 0x98: packet = ConcoxTerminalInformationTransmission(); VideoTrack;
    }
*/

    if (packet)
      return packet.parse(reader);

    return undefined;
  }
}


class ConcoxServerPacket extends ConcoxPacket {
  static parse(data) {
    const reader = new ConcoxReader(data);
    let packet = null;

/*    
    switch (reader.protocolNumber) {
      case 0x01: packet = ConcoxServerLogin(); break;
      case 0x23: packet = ConcoxServerHeartbeat(); break;
      case 0x80: packet = ConcoxServerOnlineCommand(); break;
      case 0x98: packet = ConcoxServerInformationTransmission(); break;
    }
*/

    if (packet)
      return packet.parse(reader);

    return undefined;
  }
}

module.exports = { ConcoxTerminalPacket, ConcoxServerPacket };
