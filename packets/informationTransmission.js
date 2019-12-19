const Packet = require('../lib/packet');


class InformationTransmissionPacket extends Packet {
  getProtocolNumber() {
    return 0x98;
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
    for (const item of this.modules) {
      writer.writeByte(item.number);
      writer.writeWord(item.content.length);
      writer.writeBytes(item.content);
    }
  }

  readContent(reader) {
    this.infoContent = [];
    let totalLength = 0;

    while (totalLength < this.contentLength) {
      const number = reader.readByte();
      const length = reader.readWord();
      const content = reader.readBytes(length);
  
      this.infoContent.push({ number, length, content });

      totalLength += length + 3;
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

module.exports = { TerminalInformationTransmission, ServerInformationTransmission };
