const Concox = require('./concox');


class ConcoxWriter {
  constructor(protocolNumber) {
    this.data = [];
    this.protocolNumber = protocolNumber;

    if (protocolNumber === 0x98)
      this.writeWord(0x0000); // two byte length
    else
      this.writeByte(0x00); // one byte length
      
    this.writeByte(protocolNumber);
  }
 
  writeByte(value) {
    this.data.push(value & 0xFF);
  }

  writeWord(value) {
    this.writeByte(value >> 8);
    this.writeByte(value);
  }

  writeBytes(value) {
    for (let b of value)
      this.writeByte(b);
  }

  encapsulate(encryptedCrc = false) {
    if (this.protocolNumber === 0x98) {
      const length = this.data.length;

      this.data[0] = (length >> 8) & 0xFF;
      this.data[1] = length & 0xFF;
    }
    else {
      this.data[0] = this.data.length + 1;
    }
      
    this.writeWord(Concox.crc(this.data, encryptedCrc));

    const startBit = (this.protocolNumber === 0x98) ? 0x79 : 0x78;

    this.data.unshift(startBit); // start bytes
    this.data.unshift(startBit);

    this.data.push(0x0D); // stop bytes
    this.data.push(0x0A);

    return this.data;
  }
}

module.exports = ConcoxWriter;
