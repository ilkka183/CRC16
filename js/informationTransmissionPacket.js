const Packet = require('./packet');


class InformationTransmissionPacket extends Packet {
  getProtocolNumber() {
    return 0x98;
  }
}


class PacketModule {
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

class TerminalInformationTransmission extends InformationTransmissionPacket {
  getTitle() {
    return 'Information transmission';
  }

  assign(modules) {
    this.modules = modules;
  }

  writeContent(writer) {
    for (const number in this.modules) 
      this.modules[number].write(writer, number);
  }

  readContent(reader) {
    this.modules = [];
    let length = 0;

    while (length < this.contentLength) {
      const item = new PacketModule();
      item.read(reader);

      this.modules.push(item);

      length += item.length + 3;
    }
  }
}


class ServerInformationTransmission extends InformationTransmissionPacket {
  getTitle() {
    return 'Information transmission server response';
  }

  assign(reservedExtensionBit) {
    this.reservedExtensionBitLength = reservedExtensionBit.length;
    this.reservedExtensionBit = reservedExtensionBit;
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

module.exports = { TerminalInformationTransmission, ServerInformationTransmission, PacketModule };
