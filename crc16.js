class Crc16 {
  constructor(poly, reflected = true, init = 0xFFFF, final = 0xFFFF) {
    this.poly = poly;
    this.reflected = reflected;
    this.init = init;
    this.final = final;
    this.table = [];
  }

  createTable() {
    this.table = [];
  
    for (let i = 0; i < 256; i++) {
      let crc;
  
      if (this.reflected)
        crc = i;
      else
        crc = i << 8;
    
      for (let j = 0; j < 8; j++) {
        if (this.reflected)
          crc = crc & 1 ? crc >>> 1 ^ this.poly : crc >>> 1;
        else
          crc = crc & 0x8000 ? crc << 1 ^ this.poly : crc << 1;
      }
  
      this.table[i] = crc & 0xFFFF;
    }
  }

  printTable() {
    let line = '';
  
    for (let i in this.table) {
      line += '0x' + ('0000' + table[i].toString(16)).substr(-4).toUpperCase() + ' ';
  
      if (i % 8 == 7) {
        console.log(this.line);
        line = '';
      }
    }
  }

  // You have to create the table before calling calculate method
  calculate(data) {
    let fcs = this.init;
  
    for (let b of data) {
      if (this.reflected)
        fcs = (fcs >> 8) ^ this.table[(fcs ^ b) & 0xFF];
      else
        fcs = (fcs << 8) ^ this.table[((fcs >> 8) ^ b) & 0xFF];
    }
  
    fcs = fcs ^ this.final;
    return fcs & 0xFFFF;
  }
}


class Concox {
  static encryptKey = [0x78, 0x69, 0x6e, 0x73, 0x69, 0x77, 0x65, 0x69, 0x26, 0x63, 0x6f, 0x6e, 0x63, 0x6f, 0x78];

  static timeZoneLanguage(utc) {
    const gmt = (utc >= 0) ? 0 : 1;
    const language = 0b0010;

    return utc*100 << 4 | gmt << 3 | language;
  }

  static crc(data, encrypt = false) {
    let crc = new Crc16(0x8408);
    crc.createTable();

    if (encrypt)
      data = [...data, ...Concox.encryptKey];

    return crc.calculate(data);
  }

  static check(data, jar = false) {
    const crc = Concox.crc(data, jar);
    console.log(crc.toString(16).toUpperCase());
  }

  static log(data) {
    let str = '';

    for (const b of data) {
      if (str != '')
        str += ' ';

      str += ('0' + b.toString(16)).slice(-2).toUpperCase();
    }

    console.log(str);
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

  peekBytes(offset, count) {
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
}


class LoginPacket extends ConcoxPacket {
  request(imei, utc, number) {
    const writer = new ConcoxWriter();

    writer.writeByte(0x00); // length
    writer.writeByte(0x01); // protocol
    writer.writeBytes(imei);
    writer.writeByte(0x36);
    writer.writeByte(0x05);
    writer.writeWord(Concox.timeZoneLanguage(utc));
    writer.writeWord(number);
    writer.updateLength();
    writer.writeWord(Concox.crc(writer.data, true));
    writer.encapsulate();

    return writer.data;
  }

  response(data) {
    const reader = new ConcoxReader(data);

    const stopBit = reader.peekBytes(data.length - 2, 2);

    if ((stopBit[0] != 0x0D) || (stopBit[1] != 0x0A))
      throw 'Invalid stop bit';

    const startBit = reader.readBytes(2);

    if ((startBit[0] != 0x78) || (startBit[1] != 0x78))
      throw 'Invalid start bit';

    const packetLength = reader.readByte();

    if (packetLength !== data.length - 5)
      throw 'Invalid packet length';

    const protocolNumber = reader.readByte();

    if (protocolNumber !== 0x01)
      throw 'Invalid protocol number';

    const dateTime = {
      year: reader.readByte(),
      month: reader.readByte(),
      day: reader.readByte(),
      hour: reader.readByte(),
      min: reader.readByte(),
      second: reader.readByte(),
    }

    const reservedExtensionBitLength = reader.readByte();
    const informationSerialNumber = reader.readWord();
    const reservedExtensionBit = (reservedExtensionBitLength > 0) ? reader.readBytes(reservedExtensionBitLength) : [];

    return {
      packetLength,
      protocolNumber,
      dateTime,
      reservedExtensionBitLength,
      reservedExtensionBit,
      informationSerialNumber
    };
  }
}


const imei1 = [
  0x03, 0x55, 0x95, 0x10, 0x92, 0x91, 0x88, 0x58
];

const imei2 = [
  0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71
];


/*

Sample login packet：78 78 11 01 08 68 12 01 48 37 35 71 36 05 32 02 00 39 DE F7 0D 0A
String for CRC calculation：crc_str =11 01 08 68 12 01 48 37 35 71 36 05 32 02 00 39
Encryption Key：key = xinsiwei&concox (ASCII) à key = 78 69 6e 73 69 77 65 69 26 63 6f 6e 63 6f 78(Hex)
So, new string new_str = 11 01 08 68 12 01 48 37 35 71 36 05 32 02 00 39 78 69 6e 73 69 77 65 69 26 63 6f 6e 63 6f 78
Using CRC-16/X25 algorithm, you got CRC_value = 0xdef7 for new_str.

*/

// 1) Different CRC parameters are used in the login request !!!
// - polynomial 0xA097
// - no reflection
// - initial value 0x0000
// - final value 0x0000

const packet1a = [
  0x11, 0x01, 0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71, 0x36, 0x05, 0x32, 0x02, 0x00, 0x39
];

const login0 = [
  0x11, 0x01, 0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71, 0x36, 0x05, 0x32, 0x02, 0x00, 0x39
];

const login1 = [
  0x11, 0x01, 0x03, 0x55, 0x95, 0x10, 0x91, 0x34, 0x74, 0x89, 0x36, 0x08, 0x06, 0x42, 0x00, 0x01
];

const login2 = [
  0x11, 0x01, 0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71, 0x36, 0x05, 0x32, 0x02, 0x00, 0x39
];

const packet1a1 = [
  0x11, 0x01, 0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71, 0x36, 0x05, 0x32, 0x02, 0x00, 0x3A
];


const packet1a2 = [
  0x11, 0x01, 0x03, 0x55, 0x95, 0x10, 0x92, 0x91, 0x88, 0x58, 0x36, 0x05, 0x32, 0x02, 0x00, 0x39
];

/*
echo -n '787811010868120148373571360532020039DEF70D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101086812014837357136053202003A9F050D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109291885836053202003906890D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109134748936080642000115FC0D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109134748936080642000115FC0D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
7878
11
01
0868120148373571
3605
3202
0039
DEF7
0D0A
*/


// 2) The others are using the same parameters
// - polynomial 0x8408
// - reflected bits
// - initial value 0xFFFF
// - final value 0xFFFF
const packet1b = [
  0x0C, 0x01, 0x11, 0x03, 0x14, 0x08, 0x38, 0x39, 0x00, 0x00, 0x39
];

const data1b = [
  0x78, 0x78, ...packet1b, 0x95, 0x70, 0x0D, 0x0A
];

const packet1b1 = [
  0x0c, 0x01, 0x13, 0x0c, 0x0c, 0x09, 0x3a, 0x29, 0x00, 0x00, 0x39
];


const packet2a = [
  0x0B, 0x23, 0xC0, 0x01, 0x22, 0x04, 0x00, 0x01, 0x00, 0x08
];

const packet2b = [
  0x05, 0x23, 0x01, 0x00
];

const packet3a = [
  0x00, 0x6F, 0x33, 0x11, 0x03, 0x14, 0x09, 0x06, 0x08, 0x00, 0x09, 0x01, 0xCC, 0x00, 0x28, 0x7D, 0x00, 0x1F, 0x40, 0x0E,
  0x24, 0x28, 0x7D, 0x00, 0x1F, 0x71, 0x07, 0x28, 0x7D, 0x00, 0x1E, 0x3F, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x31, 0x00, 0x36,
  0x76, 0x05, 0xBB, 0x5D, 0x46, 0x00, 0x87, 0x36, 0x31, 0x87, 0x5B, 0x48, 0xCC, 0x7B, 0x35, 0x36, 0x61, 0xA6, 0x4C, 0x00,
  0xE0, 0x4B, 0x8C, 0xBF, 0x58, 0x4F, 0x78, 0xA1, 0x06, 0x54, 0x15, 0xDE, 0x4F, 0x00, 0x87, 0x46, 0x1B, 0x9D, 0x84, 0x51,
  0x26, 0x52, 0xF3, 0xAD, 0xB1, 0x94, 0x55, 0xA1, 0x00, 0x00, 0x08
];

const packet4a = [
  0x48, 0x2C, 0x10, 0x06, 0x0E, 0x02, 0x2D, 0x35, 0x01, 0xCC, 0x00, 0x28, 0x7D, 0x00, 0x1F, 0x71, 0x2D, 0x28, 0x7D, 0x00,
  0x1E, 0x17, 0x25, 0x28, 0x7D, 0x00, 0x1E, 0x23, 0x1E, 0x28, 0x7D, 0x00, 0x1F, 0x72, 0x1C, 0x28, 0x7D, 0x00, 0x1F, 0x40,
  0x12, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x02, 0x80, 0x89, 0x17, 0x44, 0x98,
  0xB4, 0x5C, 0xCC, 0x7B, 0x35, 0x36, 0x61, 0xA6, 0x5B, 0x00, 0x1F  
];

const packet5a = [
  0x11, 0x80, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x55, 0x4E, 0x4C, 0x4F, 0x43, 0x4B, 0x23, 0x00, 0x01
];

const packet5b = [
  0x00, 0x0D, 0x21, 0x00, 0x00, 0x00, 0x00, 0x01, 0x4F, 0x4B, 0x21, 0x00, 0x07
];

const packet6a = [
  0x00, 0x28, 0x98, 0x00, 0x00, 0x08, 0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71, 0x01, 0x00, 0x08, 0x04, 0x60, 0x04,
  0x03, 0x40, 0x00, 0x99, 0x32, 0x02, 0x00, 0x0A, 0x89, 0x86, 0x02, 0xB3, 0x13, 0x15, 0x90, 0x10, 0x99, 0x32, 0x00, 0x04
];

const packet6b = [
  0x00, 0x06, 0x98, 0x00, 0x00, 0x00
];

/*
// Different CRC parameters are used in the login request !!!
Concox.check(packet1a, true);
Concox.check(packet1a1, true);
Concox.check(packet1a2, true);

// The rest are using the same parameters
Concox.check(packet1b);
Concox.check(packet1b1);
Concox.check(packet2a);
Concox.check(packet2b);
Concox.check(packet3a);
Concox.check(packet4a);
Concox.check(packet5a);
Concox.check(packet5b);
Concox.check(packet6a);
Concox.check(packet6b);
*/

Concox.check(packet1a, true);
Concox.check(login0, true);
Concox.check(login1, true);
Concox.check(login2, true);

const login = new LoginPacket();
Concox.log(login.request(imei2, 8, 0x39));

try {
  console.log(login.response(data1b));
}
catch (error) {
  console.log(error);
}
