const ConcoxReader = require('./concoxReader');
const ConcoxWriter = require('./concoxWriter');


class ConcoxInformationTransmissionTerminal {
  static build(terminalInformationContent, voltageLevel, gsmSignalLength, languageExtend, informationSerialNumber) {
    const writer = new ConcoxWriter(0x98);

    writer.writeByte(terminalInformationContent);
    writer.writeWord(voltageLevel);
    writer.writeByte(gsmSignalLength);
    writer.writeWord(languageExtend);
    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(data) {
    const reader = new ConcoxReader(data, 0x98);

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


class ConcoxInformationTransmissionServer {
  static build(reservedExtensionBit, informationSerialNumber) {
    const writer = new ConcoxWriter(0x98);

    writer.writeByte(reservedExtensionBit.length);
    writer.writeBytes(reservedExtensionBit);
    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(data) {
    const reader = new ConcoxReader(data, 0x98);

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

module.exports = { ConcoxInformationTransmissionTerminal, ConcoxInformationTransmissionServer };
