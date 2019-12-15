const ConcoxReader = require('./concoxReader');
const ConcoxWriter = require('./concoxWriter');


class ConcoxHeartbeatTerminal {
  static build(terminalInformationContent, voltageLevel, gsmSignalLength, languageExtend, informationSerialNumber) {
    const writer = new ConcoxWriter(0x23);

    writer.writeByte(terminalInformationContent);
    writer.writeWord(voltageLevel);
    writer.writeByte(gsmSignalLength);
    writer.writeWord(languageExtend);

    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(data) {
    const reader = new ConcoxReader(data, 0x23);

    const infoContent = {
      terminalInformationContent: reader.readByte(),
      voltageLevel: reader.readWord(),
      gsmSignalLength: reader.readByte(),
      languageExtend: reader.readWord()
    }

    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      infoContent,
      informationSerialNumber
    }
  }
}


class ConcoxHeartbeatServer {
  static build(informationSerialNumber) {
    const writer = new ConcoxWriter(0x23);

    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(data) {
    const reader = new ConcoxReader(data, 0x23);

    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      informationSerialNumber
    }
  }
}

module.exports = { ConcoxHeartbeatTerminal, ConcoxHeartbeatServer };
