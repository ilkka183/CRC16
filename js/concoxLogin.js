const ConcoxPacket = require('./concoxPacket');


class ConcoxLoginPacket extends ConcoxPacket {
  getProtocolNumber() {
    return 0x01;
  }
}


class ConcoxTerminalLogin extends ConcoxLoginPacket {
  constructor(imei, modelIdentificationCode, timeZone, informationSerialNumber) {
    super(informationSerialNumber);

    this.infoContent = {
      imei,
      modelIdentificationCode,
      timeZone
    }
  }

  getEncryptedCrc() {
    return true;
  }

  writeContent(writer) {
    writer.writeBytes(ConcoxTerminalLogin.imeiToBinary(this.infoContent.imei));
    writer.writeBytes(this.infoContent.modelIdentificationCode);
    writer.writeWord(ConcoxTerminalLogin.packTimeZoneLanguage(this.infoContent.timeZone, 0b10));
  }

  readContent(reader) {
    this.infoContent.imei = ConcoxTerminalLogin.imeiToString(reader.readBytes(8));
    this.infoContent.modelIdentificationCode = reader.readBytes(2);
    this.infoContent.timeZoneLanguage = ConcoxTerminalLogin.unpackTimeZoneLanguage(reader.readWord());
  }

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

  static packTimeZoneLanguage(timeZone, language) {
    let result = Math.abs(timeZone) << 4;

    if (timeZone < 0)
      result |= 0b1000;
    
    return result | language;
  }

  static unpackTimeZoneLanguage(value) {
    let timeZone = value >> 4;

    if (value & 0b1000)
      timeZone = -timeZone;

    const language = value & 0b0011;
    
    return { timeZone, language }
  }
}


class ConcoxServerLogin extends ConcoxLoginPacket {
  constructor(dateTime, reservedExtensionBit, informationSerialNumber) {
    super(informationSerialNumber);

    this.dateTime = dateTime;
    this.reservedExtensionBit = reservedExtensionBit;
  }

  writeContent(writer) {
    writer.writeByte(this.dateTime.year);
    writer.writeByte(this.dateTime.month);
    writer.writeByte(this.dateTime.day);
    writer.writeByte(this.dateTime.hour);
    writer.writeByte(this.dateTime.min);
    writer.writeByte(this.dateTime.second);

    writer.writeByte(this.reservedExtensionBit.length);
    writer.writeBytes(this.reservedExtensionBit);
  }

  readContent(reader) {
    const year = reader.readByte();
    const month = reader.readByte();
    const day = reader.readByte();
    const hour = reader.readByte();
    const min = reader.readByte();
    const second = reader.readByte();

    this.dateTime = { year, month, day, hour, min, second}

    this.reservedExtensionBitLength = reader.readByte();
    this.reservedExtensionBit = reader.readBytes(this.reservedExtensionBitLength);
  }
}

module.exports = { ConcoxTerminalLogin, ConcoxServerLogin };
