const ConcoxReader = require('./concoxReader');
const ConcoxWriter = require('./concoxWriter');


class ConcoxTerminalInformationTransmission {
  static build(terminalInformationContent, voltageLevel, gsmSignalLength, languageExtend, informationSerialNumber) {
    const writer = new ConcoxWriter(0x98);

    writer.writeByte(terminalInformationContent);
    writer.writeWord(voltageLevel);
    writer.writeByte(gsmSignalLength);
    writer.writeWord(languageExtend);
    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(reader) {
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


class ConcoxServerInformationTransmission {
  static build(reservedExtensionBit, informationSerialNumber) {
    const writer = new ConcoxWriter(0x98);

    writer.writeByte(reservedExtensionBit.length);
    writer.writeBytes(reservedExtensionBit);
    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(reader) {
    const reservedExtensionBitLength = reader.readByte();
    const reservedExtensionBit = reader.readBytes(reservedExtensionBitLength);
    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      reservedExtensionBitLength,
      reservedExtensionBit,
      informationSerialNumber
    }
  }
}

module.exports = { ConcoxTerminalInformationTransmission, ConcoxServerInformationTransmission };
