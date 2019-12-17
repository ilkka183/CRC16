const ConcoxReader = require('./concoxReader');
const ConcoxWriter = require('./concoxWriter');


class ConcoxModule {
  constructor(number, content) {
    this.number = number;
    this.content = content;
  }

  get length() {
    return this.content.length;
  }

  write(writer) {
    writer.writeByte(this.number);
    writer.writeWord(this.content.length);
    writer.writeBytes(this.content);
  }

  read(reader) {
    this.number = reader.readByte();
    const length = reader.readWord();
    this.content = reader.readBytes(length);
  }
}

class ConcoxTerminalInformationTransmission {
  static build(modules, informationSerialNumber) {
    const writer = new ConcoxWriter(0x98);

    for (const number in modules) 
      modules[number].write(writer, number);

    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(reader) {
    const modules = [];
    let length = 0;

    while (length < reader.contentLength) {
      const item = new ConcoxModule();
      item.read(reader);

      modules.push(item);

      length += item.length + 3;
    }

    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      modules,
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

module.exports = { ConcoxTerminalInformationTransmission, ConcoxServerInformationTransmission, ConcoxModule };
