const ConcoxReader = require('./concoxReader');
const ConcoxWriter = require('./concoxWriter');


class ConcoxTerminalOnlineCommand {
  static build(terminalInformationContent, voltageLevel, gsmSignalLength, languageExtend, informationSerialNumber) {
    const writer = new ConcoxWriter(0x80);

    writer.writeByte(terminalInformationContent);
    writer.writeWord(voltageLevel);
    writer.writeByte(gsmSignalLength);
    writer.writeWord(languageExtend);

    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(reader) {
    const length = reader.readBytes(4);
    const flag = reader.readByte();
    const command = reader.readString(reader.packetLength - 10);

    const infoContent = {
      length,
      flag,
      command
    }

    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      infoContent,
      informationSerialNumber
    }
  }
}


class ConcoxServerOnlineCommand {
  static build(command, informationSerialNumber) {
    const writer = new ConcoxWriter(0x80);

    writer.writeByte(command.length + 4);

    writer.writeByte(0);
    writer.writeByte(0);
    writer.writeByte(0);
    writer.writeByte(0);

    writer.writeString(command);

//    writer.writeByte(0);
//    writer.writeByte(0x02); // english

    writer.writeWord(informationSerialNumber);

    return writer.encapsulate();
  }

  static parse(reader) {
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

    const informationSerialNumber = reader.readWord();

    return {
      protocolNumber: reader.protocolNumber,
      informationContent,
      informationSerialNumber
    }
  }
}

module.exports = { ConcoxTerminalOnlineCommand, ConcoxServerOnlineCommand };
