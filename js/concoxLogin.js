const { ConcoxTerminalPacket, ConcoxServerPacket } = require('./concoxPacket');


class ConcoxTerminalLogin extends ConcoxTerminalPacket {
  constructor(imei, modelIdentificationCode, timeZone, informationSerialNumber) {
    super();

    this.infoContent = {
      imei,
      modelIdentificationCode,
      timeZone
    }

    this.informationSerialNumber = informationSerialNumber;
  }

  getProtocolNumber() {
    return 0x01;
  }

  getEncryptedCrc() {
    return true;
  }

  write(writer) {
    writer.writeBytes(ConcoxTerminalLogin.imeiToBinary(this.imei));
    writer.writeBytes(this.modelIdentificationCode);
    writer.writeWord(ConcoxTerminalLogin.packTimeZoneLanguage(this.timeZone, 0b10));

    writer.writeWord(this.informationSerialNumber);
  }

  read(reader) {
    this.infoContent.imei = ConcoxTerminalLogin.imeiToString(reader.readBytes(8));
    this.infoContent.modelIdentificationCode = reader.readBytes(2);
    this.infoContent.timeZoneLanguage = ConcoxTerminalLogin.unpackTimeZoneLanguage(reader.readWord());

    this.informationSerialNumber = reader.readWord();
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


class ConcoxServerLogin extends ConcoxServerPacket {
  constructor(dateTime, reservedExtensionBit, informationSerialNumber) {
    super();

    this.dateTime = dateTime;
    this.reservedExtensionBit = reservedExtensionBit;
    this.informationSerialNumber = informationSerialNumber;
  }

  getProtocolNumber() {
    return 0x01;
  }

  write(writer) {
    writer.writeByte(this.dateTime.year);
    writer.writeByte(this.dateTime.month);
    writer.writeByte(this.dateTime.day);
    writer.writeByte(this.dateTime.hour);
    writer.writeByte(this.dateTime.min);
    writer.writeByte(this.dateTime.second);

    writer.writeByte(this.reservedExtensionBit.length);
    writer.writeBytes(this.reservedExtensionBit);

    writer.writeWord(this.informationSerialNumber);
  }

  read(reader) {
    this.dateTime.year = reader.readByte();
    this.dateTime.month = reader.readByte();
    this.dateTime.day = reader.readByte();
    this.dateTime.hour = reader.readByte();
    this.dateTime.min = reader.readByte();
    this.dateTime.second = reader.readByte();

    this.reservedExtensionBitLength = reader.readByte();
    this.reservedExtensionBit = reader.readBytes(this.reservedExtensionBitLength);

    this.informationSerialNumber = reader.readWord();
  }
}

module.exports = { ConcoxTerminalLogin, ConcoxServerLogin };
