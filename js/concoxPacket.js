const ConcoxReader = require('./concoxReader');
const { ConcoxTerminalLogin, ConcoxServerLogin } = require('./concoxLogin');
const { ConcoxTerminalHeartbeat, ConcoxServerHeartbeat } = require('./concoxHeartbeat');
const { ConcoxTerminalInformationTransmission, ConcoxServerInformationTransmission } = require('./concoxInformationTransmission');


class ConcoxTerminalPacket {
  static parse(data) {
    const reader = new ConcoxReader(data, true);
 
    switch (reader.protocolNumber) {
      case 0x01: return ConcoxTerminalLogin.parse(reader);
      case 0x23: return ConcoxTerminalHeartbeat.parse(reader);
      case 0x98: return ConcoxTerminalInformationTransmission.parse(reader);
    }

    return undefined;
  }
}


class ConcoxServerPacket {
  static parse(data) {
    const reader = new ConcoxReader(data);
  
    switch (reader.protocolNumber) {
      case 0x01: return ConcoxServerLogin.parse(reader);
      case 0x23: return ConcoxServerHeartbeat.parse(reader);
      case 0x98: return ConcoxServerInformationTransmission.parse(reader);
    }

    return undefined;
  }
}

module.exports = { ConcoxTerminalPacket, ConcoxServerPacket };
