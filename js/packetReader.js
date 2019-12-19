const Concox = require('./concox');


class ConcoxReader {
  constructor(data) {
    this.data = data;
    this.index = 0;
    this.protocolNumber = undefined;
    this.packetLength = undefined;
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

  readTripleByte() {
    const byte2 = this.readByte();
    const byte1 = this.readByte();
    const byte0 = this.readByte();

    return (byte2 << 16) | (byte1 << 8) | byte0;
  }

  readDoubleWord() {
    const byte3 = this.readByte();
    const byte2 = this.readByte();
    const byte1 = this.readByte();
    const byte0 = this.readByte();

    return (byte3 << 24) | (byte2 << 16) | (byte1 << 8) | byte0;
  }

  readString(length) {
    let result = '';

    for (let i = 0; i < length; i++ )
      result += String.fromCharCode(this.readByte());

    return result;
  }

  readBytes(count) {
    const result = [];

    for (let i = 0; i < count; i++ )
      result.push(this.readByte());

    return result;
  }
}

module.exports = ConcoxReader;
