const ConcoxReader = require('./concoxReader');
const ConcoxWriter = require('./concoxWriter');


class ConcoxLoginTerminal {
  static imeiToBinary(imei) {
    const imeiLength = 16;

    while (imei.length < imeiLength)
      imei = '0' + imei;

    const data = [];

    for (let i = 0; i < imeiLength; i += 2) {
      const upper = parseInt(imei[i], 16);
      const lower = parseInt(imei[i + 1], 16);

      data.push(upper << 4 | lower);
    }

    return data;
  }

  static imeiToString(imei) {
    let str = '';

    for (let value of imei) {
      const upper = value >> 4;
      const lower = value & 0x0F;

      str += upper.toString(16);
      str += lower.toString(16);
    }

    return str;
  }

  static timeZoneLanguage(timeZone) {
    let result = Math.abs(timeZone)*100 << 4;

    if (timeZone < 0)
      result |= 0b1000;
    
    const language = 0b0010;

    return result | language;
  }

  static build(imei, modelIdentificationCode, timeZone, informationSerialNumber) {
    const writer = new ConcoxWriter(0x01);

    writer.writeBytes(ConcoxLoginTerminal.imeiToBinary(imei));
    writer.writeBytes(modelIdentificationCode);
    writer.writeWord(ConcoxLoginTerminal.timeZoneLanguage(timeZone));
    writer.writeWord(informationSerialNumber);

    return writer.encapsulate(true);
  }

  static parse(data) {
    const reader = new ConcoxReader(data, 0x01, true);

    const imei = ConcoxLoginTerminal.imeiToString(reader.readBytes(8));
    const modelIdentificationCode = reader.readBytes(2);
    const timeZoneLanguage = reader.readWord();

    const infoContent = {
      imei,
      modelIdentificationCode,
      timeZoneLanguage
    }

    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      infoContent,
      informationSerialNumber
    }
  }
}


class ConcoxLoginServer {
  static build(dateTime, reservedExtensionBit, informationSerialNumber) {
    const writer = new ConcoxWriter(0x01);

    writer.writeByte(dateTime.year);
    writer.writeByte(dateTime.month);
    writer.writeByte(dateTime.day);
    writer.writeByte(dateTime.hour);
    writer.writeByte(dateTime.min);
    writer.writeByte(dateTime.second);

    writer.writeByte(reservedExtensionBit.length);
    writer.writeBytes(reservedExtensionBit);
    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(data) {
    const reader = new ConcoxReader(data, 0x01);

    const year = reader.readByte();
    const month = reader.readByte();
    const day = reader.readByte();
    const hour = reader.readByte();
    const min = reader.readByte();
    const second = reader.readByte();

    const dateTime = {
      year,
      month,
      day,
      hour,
      min,
      second
    }

    const reservedExtensionBitLength = reader.readByte();
    const reservedExtensionBit = reader.readBytes(reservedExtensionBitLength);
    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      dateTime,
      reservedExtensionBitLength,
      reservedExtensionBit,
      informationSerialNumber
    }
  }
}

module.exports = { ConcoxLoginTerminal, ConcoxLoginServer };
