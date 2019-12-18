const ConcoxReader = require('./concoxReader');
const { ConcoxTerminalLogin, ConcoxServerLogin } = require('./concoxLogin');
const { ConcoxTerminalHeartbeat, ConcoxServerHeartbeat } = require('./concoxHeartbeat');
const { ConcoxTerminalOnlineCommand, ConcoxServerOnlineCommand } = require('./concoxOnlineCommand');
const { ConcoxTerminalInformationTransmission, ConcoxServerInformationTransmission } = require('./concoxInformationTransmission');


class ConcoxParser {
  static readHeader(reader, isTerminal) {
    // Start bytes
    const startBytes = reader.peekBytes(2);

    if (!Concox.equals(startBytes, [0x79, 0x79]) && !Concox.equals(startBytes, [0x78, 0x78]))
      throw new Error('Invalid start bit');

    const packetLengthBytes = Concox.equals(startBytes, [0x79, 0x79]) ? 2 : 1;

    // Stop bytes
    const stopBytes = reader.peekBytes(2, reader.data.length - 2);

    if (!Concox.equals(stopBytes, [0x0D, 0x0A]))
      throw new Error('Invalid stop bit');
  
      reader.readBytes(2); // start bit

    // Packet length
    this.packetLength = (packetLengthBytes == 2) ? reader.readWord() : reader.readByte();
    const offset = 4 + packetLengthBytes;

    if (this.packetLength !== reader.data.length - offset)
      throw new Error('Invalid packet length');

    // Protocol number
    this.protocolNumber = reader.readByte();

    // Error check
    const encryptedCrc = isTerminal && (this.protocolNumber === 0x01)
    const errorCheck = reader.peekWordAt(reader.data.length - 4);
    const crc = Concox.crcRange(reader.data, 2, reader.data.length - 4, encryptedCrc);

    if (errorCheck !== crc)
      throw new Error('Invalid error check code');
  }

  static parseTerminalPacket(data) {
    const reader = new ConcoxReader(data);
    ConcoxParser.readHeader(reader, true);

    let packet = undefined;

    switch (reader.protocolNumber) {
      case 0x01: packet = new ConcoxTerminalLogin(); break;
      case 0x21: packet = new ConcoxTerminalOnlineCommand(); break;
      case 0x23: packet = new ConcoxTerminalHeartbeat(); break;
      case 0x98: packet = new ConcoxTerminalInformationTransmission(); break;
    }

    if (packet)
      packet.read(reader);

    return packet;
  }

  static parseServerPacket(data) {
    const reader = new ConcoxReader(data);
    ConcoxParser.readHeader(reader, false);

    let packet = undefined;

    switch (reader.protocolNumber) {
      case 0x01: packet = new ConcoxServerLogin(); break;
      case 0x23: packet = new ConcoxServerHeartbeat(); break;
      case 0x80: packet = new ConcoxServerOnlineCommand(); break;
      case 0x98: packet = new ConcoxServerInformationTransmission(); break;
    }

    if (packet)
      packet.read(reader);

    return packet;
  }

  static parsePacket(data, terminal) {
    if (terminal)
      return ConcoxParser.parseTerminalPacket(data);
    else
      return ConcoxParser.parseServerPacket(data);
  }
}

module.exports = ConcoxParser;
