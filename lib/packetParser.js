const PacketReader = require('./packetReader');
const { Concox, Sender } = require('./concox');
const { TerminalHeartbeat, ServerHeartbeat } = require('../packets/heartbeat');
const { TerminalInformationTransmission, ServerInformationTransmission } = require('../packets/informationTransmission');
const { TerminalLocation, ServerLocation } = require('../packets/location');
const { TerminalLogin, ServerLogin } = require('../packets/login');
const { TerminalOnlineCommand, ServerOnlineCommand } = require('../packets/onlineCommand');
const { TerminalWifiInformation } = require('../packets/wifiInformation');


class PacketParser {
  static createTerminalPacket(protocolNumber) {
    switch (protocolNumber) {
      case 0x01: return new TerminalLogin();
      case 0x21: return new TerminalOnlineCommand();
      case 0x2C: return new TerminalWifiInformation();
      case 0x23: return new TerminalHeartbeat();
      case 0x32: return new TerminalLocation(protocolNumber);
      case 0x33: return new TerminalLocation(protocolNumber);
      case 0x98: return new TerminalInformationTransmission();
    }

    return undefined;
  }

  static createServerPacket(protocolNumber) {
    switch (protocolNumber) {
      case 0x01: return new ServerLogin();
      case 0x23: return new ServerHeartbeat();
      case 0x32: return new ServerLocation(protocolNumber);
      case 0x33: return new ServerLocation(protocolNumber);
      case 0x80: return new ServerOnlineCommand();
      case 0x98: return new ServerInformationTransmission();
    }

    return undefined;
  }

  static createPacket(sender, protocolNumber) {
    switch (sender) {
      case Sender.TERMINAL: return this.createTerminalPacket(protocolNumber);
      case Sender.SERVER: return this.createServerPacket(protocolNumber);
    }

    return undefined;
  }

  static checkStartBit(value) {
    if ((value !== 0x7979) && (value !== 0x7878))
      throw new Error('Invalid start bit');
  }

  static checkStopBit(value) {
    if (value !== 0x0D0A)
      throw new Error('Invalid stop bit');
  }

  static checkErrorCheck(value, calculatedErrorCheck) {
    if (value !== calculatedErrorCheck)
      throw new Error('Invalid error check');
  }

  static parse(data, sender) {
    const reader = new PacketReader(data);
    const packets = [];
    let packetOffset = 0;

    while (!reader.eof) {
      packetOffset = reader.index;

      const startBit = reader.readWord();
      this.checkStartBit(startBit);

      const packetLengthInBytes = (startBit === 0x7979) ? 2 : 1;
      const packetLength = (packetLengthInBytes == 2) ? reader.readWord() : reader.readByte();

      const stopBit = reader.peekWord(packetLength);
      this.checkStopBit(stopBit);
    
      const protocolNumber = reader.readByte();

      // Error check
      const crcBegin = packetOffset + 2;
      const crcEnd = packetOffset + packetLength + packetLengthInBytes;
      const crcOffset = packetOffset + packetLength + packetLengthInBytes;

      const calculatedErrorCheck = Concox.crcRange(
        reader.data,
        crcBegin,
        crcEnd,
        (sender == Sender.TERMINAL) && (protocolNumber === 0x01));

      const errorCheck = reader.peekWordAt(crcOffset);
      this.checkErrorCheck(errorCheck, calculatedErrorCheck);

      const packet = this.createPacket(sender, protocolNumber);

      if (packet) {
        packet.packetLength = packetLength;
        packet.readContent(reader);
        packet.serialNumber = reader.readWord();

        const errorCheck = reader.readWord();
        this.checkErrorCheck(errorCheck, calculatedErrorCheck);

        const stopBit = reader.readWord();
        this.checkStopBit(stopBit);
      }

      packets.push(packet);
    }

    return packets;
  }
}

module.exports = PacketParser;
