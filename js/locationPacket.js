const Packet = require('./packet');


class LocationPacket extends Packet {
  getProtocolNumber() {
    return 0x33;
  }
}


class TerminalLocation extends LocationPacket {
  getTitle() {
    return 'Location (terminal request)';
  }

  assign() {
  }

  writeContent(writer) {
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
  getTitle() {
    return 'Location (server response)';
  }

  assign() {
  }

  writeContent(writer) {
  }

  readContent(reader) {
  }
}

module.exports = { TerminalLocation, ServerLocation };
