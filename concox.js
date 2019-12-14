const Crc16 = require('./crc16');


const crc16x25 = new Crc16(0x8408);
crc16x25.createTable();


class Concox {
  static encryptKey = [0x78, 0x69, 0x6e, 0x73, 0x69, 0x77, 0x65, 0x69, 0x26, 0x63, 0x6f, 0x6e, 0x63, 0x6f, 0x78];

  static timeZoneLanguage(utc) {
    const gmt = (utc >= 0) ? 0 : 1;
    const language = 0b0010;

    return utc*100 << 4 | gmt << 3 | language;
  }

  static crc(data, encrypted = false) {
    if (encrypted)
      data = [...data, ...Concox.encryptKey];

    return crc16x25.calculate(data);
  }

  static crcRange(data, index, count, encrypted = false) {
    const slice = data.slice(index, count);
    return Concox.crc(slice, encrypted);
  }

  static check(data, encrypted = false) {
    const code = Concox.crc(data, encrypted);
    console.log(code.toString(16).toUpperCase());
  }

  static equals(data1, data2) {
    if (data1.length !== data2.length)
      return false;

    for (let index in data1)
      if (data1[index] !== data2[index])
        return false;

    return true;
  }

  static compare(data1, data2) {
    if (!Concox.equals(data1, data2)) {
      console.log('<<< ERROR >>>');
      console.log(Concox.toHex(data1));
      console.log(Concox.toHex(data2));
      console.log('<<< ERROR >>>');
    }
    else
      console.log(Concox.toHex(data1));
  }

  static toHex(data) {
    let hex = '';

    for (const b of data) {
      if (hex != '')
      hex += ' ';

      hex += ('0' + b.toString(16)).slice(-2).toUpperCase();
    }

    return hex;
  }

  static toBinary(hex) {
    let values = [];

    if (hex.indexOf(' ') != -1) {
      // 01 23 45 67 89 0A BC DE
      values = hex.split(' ');
    }
    else {
      // 01234567890ABCDE
      for (let i = 0; i < hex.length; i += 2)
        values.push(hex.substr(i, 2));
    }
 
    const data = [];
  
    for (const value of values)
      data.push(parseInt(value, 16));

    return data;
  }
}


class ConcoxWriter {
  constructor() {
    this.data = [];
  }
 
  writeByte(value) {
    this.data.push(value);
  }

  writeWord(value) {
    this.writeByte(value >> 8);
    this.writeByte(value & 0xFFFF);
  }

  writeBytes(value) {
    for (let b of value)
      this.writeByte(b);
  }

  updateLength() {
    this.data[0] = this.data.length + 1;
  }

  encapsulate() {
    this.data.unshift(0x78); // start bytes
    this.data.unshift(0x78);

    this.data.push(0x0D); // stop bytes
    this.data.push(0x0A);
  }
}


class ConcoxReader {
  constructor(data) {
    this.data = data;
    this.index = 0;
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

  readHeader(protocolNumber, encrypted = false) {
    const expectedStartBit = (protocolNumber === 0x98) ? [0x79, 0x79] : [0x78, 0x78];
    const startBit = this.peekBytes(2);

    if (!Concox.equals(startBit, expectedStartBit))
      throw new Error('Invalid start bit');

    const stopBit = this.peekBytes(2, this.data.length - 2);

    if (!Concox.equals(stopBit, [0x0D, 0x0A]))
      throw new Error('Invalid stop bit');
  
    const errorCheck = this.peekWord(this.data.length - 4);
    const crc = Concox.crcRange(this.data, 2, this.data.length - 4, encrypted);

    if (errorCheck !== crc)
      throw new Error('Invalid error check code');
    
    this.readBytes(2); // start bit

    const packetLength = (protocolNumber === 0x98) ? this.readWord() : this.readByte();
    const offset = (protocolNumber === 0x98) ? 6 : 5;

    if (packetLength !== this.data.length - offset)
      throw new Error('Invalid packet length');

    const number = this.readByte();

    if (number != protocolNumber)
      throw new Error('Invalid protocol number');

    return protocolNumber;
  }
}


class ConcoxPacket {
}


class ConcoxLogin extends ConcoxPacket {
  static buildTerminal(imei, model, utc, informationSerialNumber) {
    const writer = new ConcoxWriter();

    writer.writeByte(0x00); // length
    writer.writeByte(0x01);

    writer.writeBytes(imei);
    writer.writeBytes(model);
    writer.writeWord(Concox.timeZoneLanguage(utc));
    writer.writeWord(informationSerialNumber);

    writer.updateLength();
    writer.writeWord(Concox.crc(writer.data, true));
    writer.encapsulate();

    return writer.data;
  }

  static parseTerminal(data) {
    const reader = new ConcoxReader(data);
    const protocolNumber = reader.readHeader(0x01, true);

    const infoContent = {
      imei: reader.readBytes(8),
      modelIdentificationCode: reader.readBytes(2),
      timeZoneLanguage: reader.readWord()
    }

    const informationSerialNumber = reader.readWord();

    return { protocolNumber, infoContent, informationSerialNumber }
  }
  
  static buildServer() {
    const writer = new ConcoxWriter();

    writer.writeByte(0x00); // length
    writer.writeByte(0x01);

    writer.updateLength();
    writer.writeWord(Concox.crc(writer.data, true));
    writer.encapsulate();

    return writer.data;
  }

  static parseServer(data) {
    const reader = new ConcoxReader(data);
    const protocolNumber = reader.readHeader(0x01);

    const dateTime = {
      year: reader.readByte(),
      month: reader.readByte(),
      day: reader.readByte(),
      hour: reader.readByte(),
      min: reader.readByte(),
      second: reader.readByte()
    }

    const reservedExtensionBitLength = reader.readByte();
    const reservedExtensionBit = reader.readBytes(reservedExtensionBitLength);
    const informationSerialNumber = reader.readWord();

    return { protocolNumber, dateTime, reservedExtensionBitLength, reservedExtensionBit, informationSerialNumber }
  }
}


class ConcoxHeartbeat extends ConcoxPacket {
  static parseTerminal(data) {
    const reader = new ConcoxReader(data);
    const protocolNumber = reader.readHeader(0x23);

    const infoContent = {
      terminalInformationContent: reader.readByte(),
      voltageLevel: reader.readWord(),
      gsmSignalLength: reader.readByte(),
      languageExtend: reader.readWord()
    }

    const informationSerialNumber = reader.readWord();

    return { protocolNumber, infoContent, informationSerialNumber }
  }

  static parseServer(data) {
    const reader = new ConcoxReader(data);
    const protocolNumber = reader.readHeader(0x23);

    const informationSerialNumber = reader.readWord();

    return { protocolNumber, informationSerialNumber }
  }
}


class ConcoxInformationTransmission extends ConcoxPacket {
  static parseTerminal(data) {
    const reader = new ConcoxReader(data);
    const protocolNumber = reader.readHeader(0x98);

    const infoContent = {
      terminalInformationContent: reader.readByte(),
      voltageLevel: reader.readWord(),
      gsmSignalLength: reader.readByte(),
      languageExtend: reader.readWord()
    }

    const informationSerialNumber = reader.readWord();

    return { protocolNumber, infoContent, informationSerialNumber }
  }

  static parseServer(data) {
    const reader = new ConcoxReader(data);
    const protocolNumber = reader.readHeader(0x98);

    const reservedExtensionBitLength = reader.readByte();
    const reservedExtensionBit = reader.readBytes(reservedExtensionBitLength);
    const informationSerialNumber = reader.readWord();

    return { protocolNumber, reservedExtensionBitLength, reservedExtensionBit, informationSerialNumber }
  }
}


/*
echo -n '787811010868120148373571360532020039DEF70D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101086812014837357136053202003A9F050D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109291885836053202003906890D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109134748936080642000115FC0D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109134748936080642000115FC0D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C

78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A
78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A
79 79 00 06 98 00 00 00 C7 00 0D 0A
78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A
78 78 05 23 00 03 4C 4D 0D 0A
78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A
78 78 05 23 00 04 38 F2 0D 0A
78 78 0B 23 01 01 93 04 00 01 00 05 2A 62 0D 0A
78 78 05 23 00 05 29 7B 0D 0A
78 78 0B 23 01 01 93 04 00 01 00 06 18 F9 0D 0A
78 78 05 23 00 06 1B E0 0D 0A
78 78 0B 23 01 01 93 04 00 01 00 07 09 70 0D 0A
78 78 05 23 00 07 0A 69 0D 0A
78 78 0B 23 01 01 93 04 00 01 00 08 F1 87 0D 0A
78 78 05 23 00 08 F2 9E 0D 0A
78 78 0B 23 01 01 91 04 00 01 00 09 E8 58 0D 0A
78 78 05 23 00 09 E3 17 0D 0A
*/

// Login
//let data = ConcoxPacket.buildLoginRequest([0x03, 0x55, 0x95, 0x10, 0x91, 0x34, 0x74, 0x89], [0x36, 0x08], 1, 1);
//ConcoxPacket.compare(data, Concox.toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A'));

console.log(ConcoxLogin.parseTerminal(Concox.toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A')));
console.log(ConcoxLogin.parseServer(Concox.toBinary('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A')));

console.log(ConcoxInformationTransmission.parseServer(Concox.toBinary('79 79 00 06 98 00 00 00 C7 00 0D 0A')));

console.log(ConcoxHeartbeat.parseTerminal(Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A')));
console.log(ConcoxHeartbeat.parseServer(Concox.toBinary('78 78 05 23 00 03 4C 4D 0D 0A')));

console.log(ConcoxHeartbeat.parseTerminal(Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A')));
console.log(ConcoxHeartbeat.parseServer(Concox.toBinary('78 78 05 23 00 04 38 F2 0D 0A')));
