const Concox = require('./concox');
const PacketWriter = require('./packetWriter');


class ConcoxPacket {
  constructor() {
    this.packetLength = 0;
    this.protocolNumber = this.getProtocolNumber();
  }

  getTitle() {
    return undefined;
  }

  getProtocolNumber() {
    return undefined;
  }

  getEncryptedCrc() {
    return false;
  }

  get contentLength() {
    return this.packetLength ? this.packetLength - 5 : 0;
  }

  build() {
    this.protocolNumber = this.getProtocolNumber();

    const wordLengthProtocols = new Set([0x21, 0x32, 0x33, 0x98]);
    const wordLength = wordLengthProtocols.has(this.protocolNumber);

    const writer = new PacketWriter();

    const startBit = wordLength ? 0x79 : 0x78;
    writer.writeByte(startBit); // start bytes
    writer.writeByte(startBit);

    if (wordLength)
      writer.writeWord(0x0000); // two byte length
    else
    writer.writeByte(0x00); // one byte length
      
    writer.writeByte(this.protocolNumber);

    this.writeContent(writer);
    writer.writeWord(this.serialNumber);

    const length = writer.data.length - 2;

    if (wordLength) {
      writer.data[2] = (length >> 8) & 0xFF;
      writer.data[3] = length & 0xFF;
    }
    else {
      writer.data[2] = length + 1;
    }
      
    writer.writeWord(Concox.crcRange(writer.data, 2, writer.data.length, this.getEncryptedCrc()));

    writer.writeByte(0x0D); // stop bytes
    writer.writeByte(0x0A);

    return writer.data;
  }
}


module.exports = ConcoxPacket;
