const Concox = require('./concox');


class ConcoxReader {
  constructor(data, protocolNumber, encryptedCrc = false) {
    this.data = data;
    this.index = 0;
    this.protocolNumber = protocolNumber;
    
    this.readHeader(encryptedCrc);
  }

  peekByte() {
    return this.data[this.index];
  }

  peekWord(offset = 0) {
    const upper = this.data[this.index + offset];
    const lower = this.data[this.index + offset + 1];

    return (upper << 8) | lower;
  }

  peekBytes(count, offset = 0) {
    const result = [];

    for (let i = 0; i < count; i++ )
      result.push(this.data[this.index + offset + i]);

    return result;
  }

  readByte() {
    return this.data[this.index++];
  }

  readWord() {
    const upper = this.readByte();
    const lower = this.readByte();

    return (upper << 8) | lower;
  }

  readBytes(count) {
    const result = [];

    for (let i = 0; i < count; i++ )
      result.push(this.readByte());

    return result;
  }

  readHeader(encryptedCrc) {
    const startBit = (this.protocolNumber === 0x98) ? [0x79, 0x79] : [0x78, 0x78];
    const stopBit = [0x0D, 0x0A];

    // Start bit
    let bit = this.peekBytes(2);

    if (!Concox.equals(bit, startBit))
      throw new Error('Invalid start bit');

    // Stop bit
    bit = this.peekBytes(2, this.data.length - 2);

    if (!Concox.equals(bit, stopBit))
      throw new Error('Invalid stop bit');
  
    // Error check
    const errorCheck = this.peekWord(this.data.length - 4);
    const crc = Concox.crcRange(this.data, 2, this.data.length - 4, encryptedCrc);

    if (errorCheck !== crc)
      throw new Error('Invalid error check code');
    
    this.readBytes(2); // start bit

    // Packet length
    const packetLength = (this.protocolNumber === 0x98) ? this.readWord() : this.readByte();
    const offset = (this.protocolNumber === 0x98) ? 6 : 5;

    if (packetLength !== this.data.length - offset)
      throw new Error('Invalid packet length');

    // Protocol number
    const protocolNumber = this.readByte();

    if (protocolNumber != this.protocolNumber)
      throw new Error('Invalid protocol number');
  }
}

module.exports = ConcoxReader;
