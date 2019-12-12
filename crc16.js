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
  static timeZoneLanguage(utc) {
    const gmt = (utc >= 0) ? 0 : 1;
    const language = 0b0010;

    return utc*100 << 4 | gmt << 3 | language;
  }

  static crc(data, jar = false) {
    let crc;

    if (jar)
      crc = new Crc16(0xA097, false, 0x0000, 0x0000);
    else
      crc = new Crc16(0x8408, true, 0xFFFF, 0xFFFF);

    crc.createTable();
    return crc.calculate(data);
  }

  static check(data, jar = false) {
    const crc = Concox.crc(data, jar);
    console.log(crc.toString(16).toUpperCase());
  }
}


class ConcoxPacket {
  constructor() {
    this.data = [];
  }
 
  addByte(value) {
    this.data.push(value);
  }

  addWord(value) {
    this.addByte(value >> 8);
    this.addByte(value & 0xFFFF);
  }

  encapsulate() {
    this.data.unshift(0x78); // start bytes
    this.data.unshift(0x78);

    this.data.push(0x0D); // stop bytes
    this.data.push(0x0A);
  }

  composeLoginRequest(imei, utc, number) {
    this.addByte(0x00); // length
    this.addByte(0x01); // protocol

    for (let b of imei)
      this.addByte(b);

    this.addByte(0x36);
    this.addByte(0x05);
    this.addWord(Concox.timeZoneLanguage(utc));
    this.addWord(number);

    this.data[0] = this.data.length + 1;

    this.addWord(Concox.crc(this.data, true));
    
    this.encapsulate();
  }

  log() {
    let str = '';

    for (const b of this.data) {
      if (str != '')
        str += ' ';

      str += ('0' + b.toString(16)).slice(-2).toUpperCase();
    }

    console.log(str);
  }
}


const imei1 = [
  0x03, 0x55, 0x95, 0x10, 0x92, 0x91, 0x88, 0x58
];

const imei2 = [
  0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71
];


// 1) Different CRC parameters are used in the login request !!!
// - polynomial 0xA097
// - no reflection
// - initial value 0x0000
// - final value 0x0000
const packet1a = [
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

let packet = new ConcoxPacket();
packet.composeLoginRequest(imei2, 8, 57)
packet.log();
