const Concox = require('./concox');


class ConcoxReader {
  constructor(data) {
    this.data = data;
    this.index = 0;
    this.protocolNumber = undefined;
    this.packetLength = undefined;
  }

  get contentLength() {
    return this.packetLength ? this.packetLength - 5 : 0;
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
