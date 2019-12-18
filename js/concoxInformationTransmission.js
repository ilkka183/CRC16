const ConcoxPacket = require('./concoxPacket');


class ConcoxInformationTransmissionPacket extends ConcoxPacket {
  getProtocolNumber() {
    return 0x98;
  }
}


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

class ConcoxTerminalInformationTransmission extends ConcoxInformationTransmissionPacket {
  constructor(modules, informationSerialNumber) {
    super(informationSerialNumber);
  }

  writeContent(writer) {
    for (const number in modules) 
      modules[number].write(writer, number);
  }

  readContent(reader) {
    const modules = [];
    let length = 0;

    while (length < reader.contentLength) {
      const item = new ConcoxModule();
      item.read(reader);

      modules.push(item);

      length += item.length + 3;
    }
  }
}


class ConcoxServerInformationTransmission extends ConcoxInformationTransmissionPacket {
  constructor(reservedExtensionBit, informationSerialNumber) {
    super(informationSerialNumber);
  }

  writeContent(writer) {
    writer.writeByte(this.reservedExtensionBit.length);
    writer.writeBytes(this.reservedExtensionBit);
  }

  readContent(reader) {
    this.reservedExtensionBitLength = reader.readByte();
    this.reservedExtensionBit = reader.readBytes(this.reservedExtensionBitLength);
  }
}

module.exports = { ConcoxTerminalInformationTransmission, ConcoxServerInformationTransmission, ConcoxModule };
