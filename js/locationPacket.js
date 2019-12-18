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
    const gpsInformationSatellites = reader.readBytes(1);
    const latitude = reader.readDoubleWord();
    const longitude = reader.readDoubleWord();
    const speed = reader.readByte();
    const course = reader.readWord();
    const mainBaseStationLength = reader.readByte();
    const MCC = reader.readBytes(2);
    const MNC = reader.readByte();
    const LAC = reader.readBytes(2);
    const CI = reader.readBytes(3);
    const RSSI = reader.readByte();

    const subBaseStationLength = reader.readByte();
    const LBS = [];

    for (let i = 0; i < 4; i++) {
      const NLAC = reader.readWord();
      const NCI = reader.readBytes(3);
      const NRSSI = reader.readByte();

      LBS.push({ NLAC, NCI, NRSSI });
    }
    
    const wifiMessageLength = reader.readByte();
    const wifiCount = wifiMessageLength/7;
    const wifis = [];

    for (let i = 0; i < wifiCount; i++) {
      const MAC = reader.readBytes(6);
      const Strength = reader.readByte();
  
      wifis.push({ MAC, Strength });
    }
    
    const status = reader.readByte();
    const reservedExtensionBitLength = reader.readByte();
    const reservedExtensionBit = reader.readBytes(reservedExtensionBitLength);

    this.infoContent = {
      dateTime,
      gpsInformationLength,
      gpsInformationSatellites,
      latitude,
      longitude,
      speed,
      course,
      mainBaseStationLength,
      MCC,
      MNC,
      LAC,
      CI,
      RSSI,
      subBaseStationLength,
      LBS,
      wifiMessageLength,
      wifis,
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
