const Packet = require('../lib/packet');
const { Concox, Sender } = require('../lib/concox');


class LocationPacket extends Packet {
  constructor(protocolNumber) {
    super();

    this.protocolNumber = protocolNumber;
  }

  getTitle() {
    return 'Location';
  }

  getProtocolNumber() {
    return this.protocolNumber;
  }
}


class TerminalLocation extends LocationPacket {
  constructor(protocolNumber) {
    super(protocolNumber);
  }

  getSender() {
    return Sender.TERMINAL;
  }

  assign(date, latitude, longitude, speed, status) {
    this.dateTime = Concox.dateToObject(date);
    this.latitude = latitude;
    this.longitude = longitude;
    this.speed = speed;
    this.status = status;
  }

  writeContent(writer) {
    writer.writeByte(this.dateTime.year);
    writer.writeByte(this.dateTime.month);
    writer.writeByte(this.dateTime.day);
    writer.writeByte(this.dateTime.hour);
    writer.writeByte(this.dateTime.min);
    writer.writeByte(this.dateTime.second);

    writer.writeByte(12); // GPS information length
    writer.writeByte(197);
    writer.writeDoubleWord(Math.round(this.latitude*1800000));
    writer.writeDoubleWord(Math.round(this.longitude*1800000));
    writer.writeByte(this.speed);
    writer.writeWord(5218);

    writer.writeByte(0); // Main base station length
    writer.writeByte(0); // Sub base station length
    writer.writeByte(0); // WiFi message length
    writer.writeByte(this.status);
    writer.writeByte(0); // Reserved extenstion bit length
  }

  readContent(reader) {
    const year = reader.readByte();
    const month = reader.readByte();
    const day = reader.readByte();
    const hour = reader.readByte();
    const min = reader.readByte();
    const second = reader.readByte();

    const dateTime = { year, month, day, hour, min, second }

    const gpsInformationLength = reader.readByte();
    let gpsInformation = undefined;

    if (gpsInformationLength > 0) {
      const gpsInformationSatellites = reader.readByte();
      const latitude = reader.readDoubleWord();
      const longitude = reader.readDoubleWord();
      const speed = reader.readByte();
      const course = reader.readWord();

      gpsInformation = {
        gpsInformationSatellites,
        latitude,
        longitude,
        speed,
        course,
      }
    }

    const mainBaseStationLength = reader.readByte();
    let mainBaseStation = undefined;

    if (mainBaseStationLength > 0) {
      const MCC = reader.readWord();
      const MNC = reader.readByte();
      const LAC = reader.readWord();
      const CI = reader.readTripleByte();
      const RSSI = reader.readByte();

      mainBaseStation = {
        MCC,
        MNC,
        LAC,
        CI,
        RSSI
      }
    }

    const subBaseStationLength = reader.readByte();
    const subBaseStationCount = subBaseStationLength/6;
    const subBaseStations = [];

    for (let i = 0; i < subBaseStationCount; i++) {
      const LAC = reader.readWord();
      const CI = reader.readTripleByte();
      const RSSI = reader.readByte();

      subBaseStations.push({ LAC, CI, RSSI });
    }
    
    const wifiMessageLength = reader.readByte();
    const wifiMessageCount = wifiMessageLength/7;
    const wifiMessages = [];

    for (let i = 0; i < wifiMessageCount; i++) {
      const MAC = reader.readBytes(6);
      const strength = reader.readByte();
  
      wifiMessages.push({ MAC, strength });
    }
    
    const status = reader.readByte();
    const reservedExtensionBitLength = reader.readByte();
    const reservedExtensionBit = reader.readBytes(reservedExtensionBitLength);

    this.infoContent = {
      dateTime,
      gpsInformationLength,
      gpsInformation,
      mainBaseStationLength,
      mainBaseStation,
      subBaseStationLength,
      subBaseStations,
      wifiMessageLength,
      wifiMessages,
      status,
      reservedExtensionBitLength,
      reservedExtensionBit
    }
  }
}


class ServerLocation extends LocationPacket {
  constructor(protocolNumber) {
    super(protocolNumber);
  }

  getSender() {
    return Sender.SERVER;
  }

  assign() {
  }

  writeContent(writer) {
  }

  readContent(reader) {
  }
}

module.exports = { TerminalLocation, ServerLocation };
