const Packet = require('./packet');


class HeartbeatPacket extends Packet {
  getProtocolNumber() {
    return 0x23;
  }
}


class TerminalHeartbeat extends HeartbeatPacket {
  getTitle() {
    return 'Heartbeat';
  }

  assign(terminalInformationContent, voltageLevel, gsmSignalLength, languageExtend) {
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
    const languageExtend = reader.readWord();

    this.infoContent = {
      terminalInformationContent,
      voltageLevel,
      gsmSignalLength,
      languageExtend
    }
  }
}


class ServerHeartbeat extends HeartbeatPacket {
  getTitle() {
    return 'Heartbeat server response';
  }

  assign() {
  }

  writeContent(writer) {
  }

  readContent(reader) {
  }
}

module.exports = { TerminalHeartbeat, ServerHeartbeat };
