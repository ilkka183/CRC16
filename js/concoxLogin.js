const ConcoxReader = require('./concoxReader');
const ConcoxWriter = require('./concoxWriter');


class ConcoxLoginTerminal {
  static timeZoneLanguage(timeZone) {
    let result = Math.abs(timeZone)*100 << 4;

    if (timeZone < 0)
      result |= 0b1000;
    
    const language = 0b0010;

    return result | language;
  }

  static build(imei, modelIdentificationCode, timeZone, informationSerialNumber) {
    const writer = new ConcoxWriter(0x01);

    writer.writeBytes(imei);
    writer.writeBytes(modelIdentificationCode);
    writer.writeWord(ConcoxLoginTerminal.timeZoneLanguage(timeZone));
    writer.writeWord(informationSerialNumber);

    return writer.encapsulate(true);
  }

  static parse(data) {
    const reader = new ConcoxReader(data, 0x01, true);

    const imei = reader.readBytes(8);
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
  static build(year, month, day, hour, min, second, reservedExtensionBit, informationSerialNumber) {
    const writer = new ConcoxWriter(0x01);

    writer.writeByte(year);
    writer.writeByte(month);
    writer.writeByte(day);
    writer.writeByte(hour);
    writer.writeByte(min);
    writer.writeByte(second);

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
