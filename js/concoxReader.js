const Concox = require('./concox');


class ConcoxReader {
  constructor(data, terminal = false) {
    this.data = data;
    this.index = 0;
    this.protocolNumber = undefined;
    
    this.readHeader(terminal);
  }

  peekByte() {
    return this.data[this.index];
  }

  peekWord(offset = 0) {
    const upper = this.data[this.index + offset];
    const lower = this.data[this.index + offset + 1];

    return (upper << 8) | lower;
  }

  peekWordAt(index) {
    const upper = this.data[index];
    const lower = this.data[index + 1];

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

  readHeader(terminal) {
    // Start bit
    const startBit = this.peekBytes(2);

    if (!Concox.equals(startBit, [0x79, 0x79]) && !Concox.equals(startBit, [0x78, 0x78]))
      throw new Error('Invalid start bit');

    // Stop bit
    const stopBit = this.peekBytes(2, this.data.length - 2);

    if (!Concox.equals(stopBit, [0x0D, 0x0A]))
      throw new Error('Invalid stop bit');
  
    this.readBytes(2); // start bit

    // Packet length
    const packetLength = (Concox.equals(startBit, [0x79, 0x79])) ? this.readWord() : this.readByte();
    const offset = (Concox.equals(startBit, [0x79, 0x79])) ? 6 : 5;

    if (packetLength !== this.data.length - offset)
      throw new Error('Invalid packet length');

    // Protocol number
    this.protocolNumber = this.readByte();

    // Error check
    const encryptedCrc = terminal && (this.protocolNumber === 0x01)
    const errorCheck = this.peekWordAt(this.data.length - 4);
    const crc = Concox.crcRange(this.data, 2, this.data.length - 4, encryptedCrc);

    if (errorCheck !== crc)
      throw new Error('Invalid error check code');
  }
}

module.exports = ConcoxReader;
