const Packet = require('./packet');


class WifiInformationPacket extends Packet {
  getProtocolNumber() {
    return 0x2C;
  }
}


class TerminalWifiInformation extends WifiInformationPacket {
  getTitle() {
    return 'Wifi information (terminal request)';
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

    const MCC = reader.readWord();
    const MNC = reader.readByte();
    const LAC = reader.readWord();
    const CI = reader.readTripleByte();
    const RSSI = reader.readByte();

    const main = {
      MCC,
      MNC,
      LAC,
      CI,
      RSSI,
    }

    const subs = [];

    for (let i = 0; i < 6; i++) {
      const LAC = reader.readWord();
      const CI = reader.readTripleByte();
      const RSSI = reader.readByte();

      subs.push({ LAC, CI, RSSI });
    }

    const timeLeads = reader.readByte();
    const wifiQuantity = reader.readByte();
    const wifis = [];

    for (let i = 0; i < wifiQuantity; i++) {
      const MAC = reader.readBytes(6);
      const strength = reader.readByte();

      wifis.push({ MAC, strength });
    }

    this.infoContent = {
      dateTime,
      main,
      subs,
      timeLeads,
      wifiQuantity,
      wifis
    }
  }
}

module.exports = { TerminalWifiInformation };
