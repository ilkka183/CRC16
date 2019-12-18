const Concox = require('./concox');
const ConcoxWriter = require('./concoxWriter');


class ConcoxPacket {
  constructor(informationSerialNumber) {
    this.informationSerialNumber = informationSerialNumber;
  }

  getTitle() {
    return undefiled;
  }

  getProtocolNumber() {
    return undefiled;
  }

  getEncryptedCrc() {
    return false;
  }

  write(writer) {
    this.writeContent(writer);
    writer.writeWord(this.informationSerialNumber);
  }

  read(reader) {
    this.readContent(reader);
    this.informationSerialNumber = reader.readWord();
  }

  build() {
    const writer = new ConcoxWriter();
    const protocolNumber = this.getProtocolNumber();

    if (protocolNumber === 0x98)
      writer.writeWord(0x0000); // two byte length
    else
    writer.writeByte(0x00); // one byte length
      
    writer.writeByte(protocolNumber);

    this.write(writer);

    if (protocolNumber === 0x98) {
      const length = writer.data.length;

      writer.data[0] = (length >> 8) & 0xFF;
      writer.data[1] = length & 0xFF;
    }
    else {
      writer.data[0] = writer.data.length + 1;
    }
      
    writer.writeWord(Concox.crc(writer.data, this.getEncryptedCrc()));

    const startBit = (protocolNumber === 0x98) ? 0x79 : 0x78;

    writer.data.unshift(startBit); // start bytes
    writer.data.unshift(startBit);

    writer.data.push(0x0D); // stop bytes
    writer.data.push(0x0A);

    return writer.data;
  }
}


module.exports = ConcoxPacket;
