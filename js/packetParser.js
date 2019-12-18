const { Concox, Device } = require('./concox');
const PacketReader = require('./packetReader');
const { TerminalLogin, ServerLogin } = require('./loginPacket');
const { TerminalHeartbeat, ServerHeartbeat } = require('./heartbeatPacket');
const { TerminalLocation, ServerLocation } = require('./locationPacket');
const { TerminalOnlineCommand, ServerOnlineCommand } = require('./onlineCommandPacket');
const { TerminalInformationTransmission, ServerInformationTransmission } = require('./informationTransmissionPacket');


class PacketParser {
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

    let packet = undefined;

    switch (device) {
      case Device.TERMINAL:
        switch (protocolNumber) {
          case 0x01: packet = new TerminalLogin(); break;
          case 0x21: packet = new TerminalOnlineCommand(); break;
          case 0x23: packet = new TerminalHeartbeat(); break;
          case 0x32: packet = new TerminalLocation(); break;
          case 0x33: packet = new TerminalLocation(); break;
          case 0x98: packet = new TerminalInformationTransmission(); break;
        }

        break;

      case Device.SERVER:
        switch (protocolNumber) {
          case 0x01: packet = new ServerLogin(); break;
          case 0x23: packet = new ServerHeartbeat(); break;
          case 0x32: packet = new ServerLocation(); break;
          case 0x33: packet = new ServerLocation(); break;
          case 0x80: packet = new ServerOnlineCommand(); break;
          case 0x98: packet = new ServerInformationTransmission(); break;
        }

        break;
    }

    if (packet) {
      packet.packetLength = packetLength;
      packet.readContent(reader);
      packet.serialNumber = reader.readWord();
    }

    return packet;
  }
}

module.exports = PacketParser;
