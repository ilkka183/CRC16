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

    const items = [];

    for (let i = 0; i < 6; i++) {
      const LAC = reader.readWord();
      const CI = reader.readTripleByte();
      const RSSI = reader.readByte();

      items.push({ LAC, CI, RSSI });
    }

    this.infoContent = {
      dateTime,
      MCC,
      MNC,
      LAC,
      CI,
      RSSI,
      items
    }
  }
}

module.exports = { TerminalWifiInformation };
