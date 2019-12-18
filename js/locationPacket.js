const Packet = require('./packet');


class LocationPacket extends Packet {
  getProtocolNumber() {
    return 0x33;
  }
}


class TerminalLocation extends LocationPacket {
  getTitle() {
    return 'Location (terminal request)';
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


class ServerLocation extends LocationPacket {
  getTitle() {
    return 'Location (server response)';
  }

  assign() {
  }

  writeContent(writer) {
  }

  readContent(reader) {
  }
}

module.exports = { TerminalLocation, ServerLocation };
