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

  static check(data, encrypted = false) {
    const code = Concox.crc(data, encrypted);
    console.log(code.toString(16).toUpperCase());
  }

  static equals(bytes1, bytes2) {
    if (bytes1.length !== bytes2.length)
      return false;

    for (let i in bytes1)
      if (bytes1[i] !== bytes2[i])
        return false;

    return true;
  }

  static toString(data) {
    let str = '';

    for (const b of data) {
      if (str != '')
        str += ' ';

      str += ('0' + b.toString(16)).slice(-2).toUpperCase();
    }

    return str;
  }

  static toBinary(str) {
    let values = [];

    if (str.indexOf(' ') != -1) {
      // 01 23 45 67 89 0A BC DE
      values = str.split(' ');
    }
    else {
      // 01234567890ABCDE
      for (let i = 0; i < str.length; i += 2)
        values.push(str.substr(i, 2));
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

  peekWord() {
    const upper = this.data[this.index];
    const lower = this.data[this.index + 1];

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
}


class ConcoxPacket {
  getStartBit() {
    return [0x78, 0x78];
  }

  getTopBit() {
    return [0x0D, 0x0A];
  }

  get protocolNumber() {
    return undefined;
  }

  write() {
  }

  build() {
    const writer = new ConcoxWriter();
    writer.writeByte(0x00); // length
    writer.writeByte(this.protocolNumber);

    this.write(writer);

    writer.encapsulate();

    return writer.data;
  }

  compare(expected) {
    const data = this.build();
    const str = Concox.toString(data);

    if (str != expected) {
      console.log('<<< ERROR >>>');
      console.log(str + ' (builded)');
      console.log(expected + ' (expected)');
      console.log('<<< ERROR >>>');
    }
    else
      console.log(str);
    }

  read(reader) {
  }

  parse(data) {
    const reader = new ConcoxReader(data);

    const startBit = reader.peekBytes(2);

    if (!Concox.equals(startBit, [0x78, 0x78]))
      throw 'Invalid start bit';

    const stopBit = reader.peekBytes(2, data.length - 2);

    if (!Concox.equals(stopBit, [0x0D, 0x0A]))
      throw 'Invalid stop bit';

    reader.readBytes(2); // start bit

    const packetLength = reader.readByte();

    if (packetLength !== data.length - 5)
      throw 'Invalid packet length';

    const protocolNumber = reader.readByte();

    if (protocolNumber !== this.protocolNumber)
      throw 'Invalid protocol number';

    this.read(reader);
  }

  parseString(str) {
    console.log(str);
    const data = Concox.toBinary(str);
    this.parse(data);
  }
}


class LoginRequest extends ConcoxPacket {
  constructor(imei, model, utc, serialNumber) {
    super();

    this.imei = imei;
    this.model = model;
    this.utc = utc;
    this.serialNumber = serialNumber;
  }

  get protocolNumber() {
    return 0x01;
  }

  write(writer) {
    writer.writeBytes(this.imei);
    writer.writeBytes(this.model);
    writer.writeWord(Concox.timeZoneLanguage(this.utc));
    writer.writeWord(this.serialNumber);
    writer.updateLength();
    writer.writeWord(Concox.crc(writer.data, true));
  }

  read(reader) {
    this.imei = reader.readBytes(8);
    this.model = reader.readBytes(2);
    this.utc = reader.readWord();
    this.serialNumber = reader.readWord();
  }
}


class LoginResponse extends ConcoxPacket {
  constructor() {
    super();
  }

  get protocolNumber() {
    return 0x01;
  }

  write(writer) {
    writer.writeBytes(this.imei);
    writer.writeBytes(this.model);
    writer.writeWord(Concox.timeZoneLanguage(this.utc));
    writer.writeWord(this.serialNumber);
    writer.updateLength();
    writer.writeWord(Concox.crc(writer.data, true));
  }

  read(reader) {
    this.dateTime = {
      year: reader.readByte(),
      month: reader.readByte(),
      day: reader.readByte(),
      hour: reader.readByte(),
      min: reader.readByte(),
      second: reader.readByte(),
    }

    this.reservedExtensionBitLength = reader.readByte();
    this.reservedExtensionBit = (this.reservedExtensionBitLength > 0) ? reader.readBytes(this.reservedExtensionBitLength) : [];
    this.informationSerialNumber = reader.readWord();
  }
}

/*
echo -n '787811010868120148373571360532020039DEF70D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101086812014837357136053202003A9F050D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109291885836053202003906890D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109134748936080642000115FC0D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109134748936080642000115FC0D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
*/

/*
Concox.check(data1a, true);
Concox.check(data1b);
Concox.check(data2a);
Concox.check(data2b);
Concox.check(data3a);
Concox.check(data4a);
Concox.check(data5a);
Concox.check(data5b);
Concox.check(data6a);
Concox.check(data6b);

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
let packet = new LoginRequest([0x03, 0x55, 0x95, 0x10, 0x91, 0x34, 0x74, 0x89], [0x36, 0x08], 1, 1);
packet.compare('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A');
console.log(packet);

packet = new LoginResponse();
packet.parseString('78780C01130C0D02390C000001F6EC0D0A');
console.log(packet);
