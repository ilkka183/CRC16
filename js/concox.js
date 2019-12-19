const Crc16 = require('./crc16');


const crc16_x25 = new Crc16(0x8408);
crc16_x25.createTable();

const encryptKey = [0x78, 0x69, 0x6e, 0x73, 0x69, 0x77, 0x65, 0x69, 0x26, 0x63, 0x6f, 0x6e, 0x63, 0x6f, 0x78];


const Device = {
  SERVER: 0,
  TERMINAL: 1
}


class Concox {
  static crc(data, encrypted = false) {
    if (encrypted)
      data = [...data, ...encryptKey];

    return crc16_x25.calculate(data);
  }

  static crcRange(data, start, end, encrypted = false) {
    const slice = data.slice(start, end);
    return Concox.crc(slice, encrypted);
  }

  static equals(data1, data2) {
    if (data1.length !== data2.length)
      return false;

    for (let index in data1)
      if (data1[index] !== data2[index])
        return false;

    return true;
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

  static logObject(object) {
    console.log(JSON.stringify(object, null, 2));
  }
}

module.exports = { Concox, Device };
