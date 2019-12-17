const ConcoxReader = require('./concoxReader');
const ConcoxWriter = require('./concoxWriter');


class ConcoxTerminalHeartbeat {
  static build(terminalInformationContent, voltageLevel, gsmSignalLength, languageExtend, informationSerialNumber) {
    const writer = new ConcoxWriter(0x23);

    writer.writeByte(terminalInformationContent);
    writer.writeWord(voltageLevel);
    writer.writeByte(gsmSignalLength);
    writer.writeWord(languageExtend);

    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(reader) {
    const terminalInformationContent = reader.readByte();
    const voltageLevel = reader.readWord();
    const gsmSignalLength = reader.readByte();
    const languageExtend= reader.readWord();

    const infoContent = {
      terminalInformationContent,
      voltageLevel,
      gsmSignalLength,
      languageExtend
    }

    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      infoContent,
      informationSerialNumber
    }
  }
}


class ConcoxServerHeartbeat {
  static build(informationSerialNumber) {
    const writer = new ConcoxWriter(0x23);

    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(reader) {
    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      informationSerialNumber
    }
  }
}

module.exports = { ConcoxTerminalHeartbeat, ConcoxServerHeartbeat };
