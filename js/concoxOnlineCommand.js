const ConcoxPacket = require('./concoxPacket');


class ConcoxOnlineCommandPacket extends ConcoxPacket {
  getProtocolNumber() {
    return 0x80;
  }
}


class ConcoxTerminalOnlineCommand extends ConcoxOnlineCommandPacket {
  constructor(terminalInformationContent, voltageLevel, gsmSignalLength, languageExtend, informationSerialNumber) {
    super(informationSerialNumber);
  }

  writeContent(writer) {
    writer.writeByte(terminalInformationContent);
    writer.writeWord(voltageLevel);
    writer.writeByte(gsmSignalLength);
    writer.writeWord(languageExtend);
  }

  readContent(reader) {
    const length = reader.readBytes(4);
    const flag = reader.readByte();
    const command = reader.readString(reader.packetLength - 10);

    const infoContent = {
      length,
      flag,
      command
    }
  }
}


class ConcoxServerOnlineCommand extends ConcoxOnlineCommandPacket {
  constructor(command, informationSerialNumber) {
    super(informationSerialNumber);
  }

  writeContent(writer) {
    writer.writeByte(command.length + 4);

    writer.writeByte(0);
    writer.writeByte(0);
    writer.writeByte(0);
    writer.writeByte(0);

    writer.writeString(command);

//    writer.writeByte(0);
//    writer.writeByte(0x02); // english
  }

  readContent(reader) {
    const length = reader.readByte();
    const flags = reader.readBytes(4);
    const command = reader.readString(length - 4);
//    const language = reader.readWord();

    const informationContent = {
      length,
      flags,
      command
//      language
    }
  }
}

module.exports = { ConcoxTerminalOnlineCommand, ConcoxServerOnlineCommand };
