const ConcoxPacket = require('./concoxPacket');


class ConcoxHeartbeatPacket extends ConcoxPacket {
  getProtocolNumber() {
    return 0x23;
  }
}


class ConcoxTerminalHeartbeat extends ConcoxHeartbeatPacket {
  constructor(terminalInformationContent, voltageLevel, gsmSignalLength, languageExtend, informationSerialNumber) {
    super(informationSerialNumber);

    this.infoContent = {
      terminalInformationContent,
      voltageLevel,
      gsmSignalLength,
      languageExtend
    }
  }

  writeContent(writer) {
    writer.writeByte(this.infoContent.terminalInformationContent);
    writer.writeWord(this.infoContent.voltageLevel);
    writer.writeByte(this.infoContent.gsmSignalLength);
    writer.writeWord(this.infoContent.languageExtend);
  }

  readContent(reader) {
    const terminalInformationContent = reader.readByte();
    const voltageLevel = reader.readWord();
    const gsmSignalLength = reader.readByte();
    const languageExtend= reader.readWord();

    this.infoContent = {
      terminalInformationContent,
      voltageLevel,
      gsmSignalLength,
      languageExtend
    }
  }
}


class ConcoxServerHeartbeat extends ConcoxHeartbeatPacket {
  constructor(informationSerialNumber) {
    super(informationSerialNumber);
  }

  writeContent(writer) {
  }

  readContent(reader) {
  }
}

module.exports = { ConcoxTerminalHeartbeat, ConcoxServerHeartbeat };
