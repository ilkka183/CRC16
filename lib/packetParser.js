const { Concox, Device } = require('./concox');
const PacketReader = require('./packetReader');
const { TerminalHeartbeat, ServerHeartbeat } = require('../packets/heartbeat');
const { TerminalInformationTransmission, ServerInformationTransmission } = require('../packets/informationTransmission');
const { TerminalLocation, ServerLocation } = require('../packets/location');
const { TerminalLogin, ServerLogin } = require('../packets/login');
const { TerminalOnlineCommand, ServerOnlineCommand } = require('../packets/onlineCommand');
const { TerminalWifiInformation } = require('../packets/wifiInformation');


class PacketParser {
  static createPacket(device, protocolNumber) {
    switch (device) {
      case Device.TERMINAL:
        switch (protocolNumber) {
          case 0x01: return new TerminalLogin();
          case 0x21: return new TerminalOnlineCommand();
          case 0x2C: return new TerminalWifiInformation();
          case 0x23: return new TerminalHeartbeat();
          case 0x32: return new TerminalLocation();
          case 0x33: return new TerminalLocation();
          case 0x98: return new TerminalInformationTransmission();
        }

      case Device.SERVER:
        switch (protocolNumber) {
          case 0x01: return new ServerLogin();
          case 0x23: return new ServerHeartbeat();
          case 0x32: return new ServerLocation();
          case 0x33: return new ServerLocation();
          case 0x80: return new ServerOnlineCommand();
          case 0x98: return new ServerInformationTransmission();
        }
    }

    return undefined;
  }

  static parse(data, device) {
    const reader = new PacketReader(data);

    // Start bytes
    const startBytes = reader.peekBytes(2);

    if (!Concox.equals(startBytes, [0x79, 0x79]) && !Concox.equals(startBytes, [0x78, 0x78]))
      throw new Error('Invalid start bit');

    const packetLengthBytes = Concox.equals(startBytes, [0x79, 0x79]) ? 2 : 1;

    // Stop bytes
    const stopBytes = reader.peekBytes(2, reader.data.length - 2);

    if (!Concox.equals(stopBytes, [0x0D, 0x0A]))
      throw new Error('Invalid stop bit');
  
    reader.readBytes(2); // start bytes

    // Packet length
    const packetLength = (packetLengthBytes == 2) ? reader.readWord() : reader.readByte();
    const offset = 4 + packetLengthBytes;

    if (packetLength !== reader.data.length - offset)
      throw new Error('Invalid packet length');

    // Protocol number
    const protocolNumber = reader.readByte();

    // Error check
    const encryptedCrc = (device == Device.TERMINAL) && (protocolNumber === 0x01)
    const errorCheck = reader.peekWordAt(reader.data.length - 4);
    const crc = Concox.crcRange(reader.data, 2, reader.data.length - 4, encryptedCrc);

    if (errorCheck !== crc)
      throw new Error('Invalid error check code');

    const packet = PacketParser.createPacket(device, protocolNumber);

    if (packet) {
      packet.packetLength = packetLength;
      packet.readContent(reader);
      packet.serialNumber = reader.readWord();
    }

    return packet;
  }
}

module.exports = PacketParser;
