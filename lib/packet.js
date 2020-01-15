const colors = require('colors');
const PacketWriter = require('./packetWriter');
const { Concox, Device } = require('./concox');


class ConcoxPacket {
  constructor() {
    this.packetLength = 0;
    this.protocolNumber = this.getProtocolNumber();
    this.serialNumber = 0;
  }

  getTitle() {
    return undefined;
  }

  getFullTitle() {
    return this.getTitle() + ' (' + this.getDeviceText() + ')';
  }

  getDevice() {
    return undefined;
  }

  getDeviceText() {
    switch (this.getDevice()) {
      case Device.TERMINAL: return 'terminal';
      case Device.SERVER: return 'server';
    }

    return '';
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

  logTitle() {
    console.log('');
  
    let title = this.getFullTitle();
  
    if (title) {
      console.log(title.yellow);
      
      let line = '';
      
      for (let i = 0; i < title.length; i++)
        line += '-';
      
      console.log(line.yellow);
    }
  }

  log(data) {
    this.logTitle();

    if (data)
      console.log(colors.white(Concox.toHex(data)));

    Concox.logObject(this);
  }
}


module.exports = ConcoxPacket;
