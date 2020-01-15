const Packet = require('../lib/packet');
const { Device } = require('../lib/concox');


class OnlineCommandPacket extends Packet {
  getTitle() {
    return 'Online command';
  }
}


class TerminalOnlineCommand extends OnlineCommandPacket {
  getProtocolNumber() {
    return 0x21;
  }

  getDevice() {
    return Device.TERMINAL;
  }

  assign(flags, encoding, command) {
    this.infoContent = {
      flags,
      encoding,
      command
    }
  }

  writeContent(writer) {
    writer.writeBytes(this.infoContent.flags);
    writer.writeByte(this.infoContent.encoding);
    writer.writeString(this.infoContent.command);
  }

  readContent(reader) {
    const flags = reader.readBytes(4);
    const encoding = reader.readByte();
    const command = reader.readString(this.packetLength - 10);

    this.infoContent = {
      flags,
      encoding,
      command
    }
  }
}


class ServerOnlineCommand extends OnlineCommandPacket {
  getProtocolNumber() {
    return 0x80;
  }

  getDevice() {
    return Device.SERVER;
  }

  assign(command) {
    this.infoContent = {
      length: command.length + 4,
      flags: [0, 0, 0, 0],
      command
    }
  }

  writeContent(writer) {
    writer.writeByte(this.infoContent.length);
    writer.writeBytes(this.infoContent.flags);
    writer.writeString(this.infoContent.command);

//    writer.writeByte(0);
//    writer.writeByte(0x02); // english
  }

  readContent(reader) {
    const length = reader.readByte();
    const flags = reader.readBytes(4);
    const command = reader.readString(length - 4);
//    const language = reader.readWord();

    this.infoContent = {
      length,
      flags,
      command
//      language
    }
  }
}

module.exports = { TerminalOnlineCommand, ServerOnlineCommand };
