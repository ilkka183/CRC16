class ConcoxWriter {
  constructor() {
    this.data = [];
  }
 
  writeByte(value) {
    this.data.push(value & 0xFF);
  }

  writeWord(value) {
    this.writeByte(value >> 8);
    this.writeByte(value);
  }

  writeString(str) {
    for (let i = 0; i < str.length; i++)
      this.writeByte(str.charCodeAt(i));
  }

  writeBytes(value) {
    for (let b of value)
      this.writeByte(b);
  }
}

module.exports = ConcoxWriter;
