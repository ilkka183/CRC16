const PacketParser = require('./lib/packetParser');
const { Concox, Device } = require('./lib/concox');
const { TerminalHeartbeat, ServerHeartbeat } = require('./packets/heartbeat');
const { TerminalInformationTransmission, ServerInformationTransmission } = require('./packets/informationTransmission');
const { TerminalLocation, ServerLocation } = require('./packets/location');
const { TerminalLogin, ServerLogin } = require('./packets/login');
const { TerminalOnlineCommand, ServerOnlineCommand } = require('./packets/onlineCommand');
const { TerminalWifiInformation } = require('./packets/wifiInformation');



function parse(hex, device) {
  const data = Concox.toBinary(hex);
  const packet = PacketParser.parse(data, device);

  if (packet)
    packet.log(data);
}

function compare(packet, hex, device) {
  const data1 = Concox.toBinary(hex);
  const data2 = packet.build();

  packet.logTitle();

  if (!Concox.equals(data1, data2)) {
    console.log('<<< ERROR >>>');
    console.log(Concox.toHex(data1));
    console.log(Concox.toHex(data2));
    console.log('<<< ERROR >>>');
  }
  else
    console.log(Concox.toHex(data1));

  Concox.logObject(PacketParser.parse(data1, device));
}

function testLogin() {
  let packet = new TerminalLogin();
  packet.assign('0868120148373571', [0x36, 0x05], 800);
  packet.serialNumber = 57;
  compare(packet, '78 78 11 01 08 68 12 01 48 37 35 71 36 05 32 02 00 39 DE F7 0D 0A', Device.TERMINAL);

  packet = new ServerLogin();
  packet.assign({ year: 17, month: 3, day: 20, hour: 8, min: 56, second: 57 }, []);
  packet.serialNumber = 57;
  compare(packet, '78 78 0C 01 11 03 14 08 38 39 00 00 39 95 70 0D 0A', Device.SERVER);
}

function testHeartbeat() {
  let packet = new TerminalHeartbeat();
  packet.assign(192, 290, 4, 1);
  packet.serialNumber = 8;
  compare(packet, '78 78 0B 23 C0 01 22 04 00 01 00 08 18 72 0D 0A', Device.TERMINAL);

  packet = new ServerHeartbeat();
  packet.serialNumber = 256;
  compare(packet, '78 78 05 23 01 00 67 0E 0D 0A', Device.SERVER);
}

function testLocation() {
//  parse('79 79 00 6F 33 11 03 14 09 06 08 00 09 01 CC 00 28 7D 00 1F 40 0E 24 28 7D 00 1F 71 07 28 7D 00 1E 3F 06 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 31 00 36 76 05 BB 5D 46 00 87 36 31 87 5B 48 CC 7B 35 36 61 A6 4C 00 E0 4B 8C BF 58 4F 78 A1 06 54 15 DE 4F 00 87 46 1B 9D 84 51 26 52 F3 AD B1 94 55 A1 00 00 08 38 B2 0D 0A', Device.TERMINAL);
//  parse('79 79 00 4A 32 13 0C 10 0C 38 19 0C C5 05 11 FC 00 04 3F A2 50 00 14 62 09 00 FA 01 00 0A 00 17 08 21 24 00 0A 00 5B 4C 2E 00 11 00 5B 42 24 00 0A 00 2C E3 1F 00 0A 00 17 05 1B 00 0A 00 5B 4D 1B 00 11 00 5B 43 1B 00 0F 00 00 06 6D 04 0D 0A', Device.TERMINAL);

  let packet = new TerminalLocation();
  packet.assign(new Date(), 60.2, 27.1, 10);
  packet.serialNumber = 5;

  const data = packet.build();
  const hex = Concox.toHex(data);
  console.log(hex)

  parse(hex, Device.TERMINAL);
  
/*  
  packet = new ServerLocation();
  packet.serialNumber = 8;
  compare(packet, '79 79 00 05 33 00 08 44 A2 0D 0A', Device.SERVER);
*/
}

function testWifiInformation() {
  parse('78 78 48 2C 10 06 0E 02 2D 35 01 CC 00 28 7D 00 1F 71 2D 28 7D 00 1E 17 25 28 7D 00 1E 23 1E 28 7D 00 1F 72 1C 28 7D 00 1F 40 12 00 00 00 00 00 00 00 00 00 00 00 00 FF 02 80 89 17 44 98 B4 5C CC 7B 35 36 61 A6 5B 00 1F A0 04 0D 0A', Device.TERMINAL);
}

function testOnlineCommand() {
  let packet = new ServerOnlineCommand();
  packet.assign('UNLOCK#');
  packet.serialNumber = 1;
  compare(packet, '78 78 11 80 0B 00 00 00 00 55 4E 4C 4F 43 4B 23 00 01 53 54 0D 0A', Device.SERVER);

  packet = new TerminalOnlineCommand();
  packet.assign([0, 0, 0, 0], 1, 'OK!');
  packet.serialNumber = 7;
  compare(packet, '79 79 00 0D 21 00 00 00 00 01 4F 4B 21 00 07 A6 30 0D 0A', Device.TERMINAL);
}

function testInformationTransmission() {
  const modules = [
    { number: 0, content: Concox.toBinary('08 68 12 01 48 37 35 71') },
    { number: 1, content: Concox.toBinary('04 60 04 03 40 00 99 32') },
    { number: 2, content: Concox.toBinary('89 86 02 B3 13 15 90 10 99 32') }
  ];

  let packet = new TerminalInformationTransmission();
  packet.assign(modules);
  packet.serialNumber = 4;
  compare(packet, '79 79 00 28 98 00 00 08 08 68 12 01 48 37 35 71 01 00 08 04 60 04 03 40 00 99 32 02 00 0A 89 86 02 B3 13 15 90 10 99 32 00 04 F5 81 0D 0A', Device.TERMINAL);

  packet = new ServerInformationTransmission();
  packet.assign([]);
  packet.serialNumber = 0;
  compare(packet, '79 79 00 06 98 00 00 00 C7 00 0D 0A', Device.SERVER);
}

function buildExample() {
  let packet = new TerminalLogin();
  packet.assign('0355951091347489', [0x36, 0x08], 100);
  packet.serialNumber = 1;
  compare(packet, '78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A', Device.TERMINAL);
  
  packet = new ServerLogin();
  packet.assign({ year: 19, month: 12, day: 13, hour: 2, min: 57, second: 12 }, []);
  packet.serialNumber = 1;
  compare(packet, '78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A', Device.SERVER);
  
  packet = new ServerInformationTransmission();
  packet.assign([]);
  packet.serialNumber = 0;
  compare(packet, '79 79 00 06 98 00 00 00 C7 00 0D 0A', Device.SERVER);

  packet = new TerminalHeartbeat();
  packet.assign(1, 402, 4, 1);
  packet.serialNumber = 3;
  compare(packet, '78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A', Device.TERMINAL)
 
  packet = new ServerHeartbeat();
  packet.assign();
  packet.serialNumber = 3;
  compare(packet, '78 78 05 23 00 03 4C 4D 0D 0A', Device.SERVER)
 
  packet = new TerminalHeartbeat();
  packet.assign(1, 402, 4, 1);
  packet.serialNumber = 4;
  compare(packet, '78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A', Device.TERMINAL)
 
  packet = new ServerHeartbeat();
  packet.assign();
  packet.serialNumber = 4;
  compare(packet, '78 78 05 23 00 04 38 F2 0D 0A', Device.SERVER)
 }

function parseExample() {
  parse('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A', Device.TERMINAL);
  parse('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A', Device.SERVER);
  parse('79 79 00 06 98 00 00 00 C7 00 0D 0A', Device.SERVER);

  parse('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A', Device.TERMINAL);
  parse('78 78 05 23 00 03 4C 4D 0D 0A', Device.SERVER);
  
  parse('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A', Device.TERMINAL);
  parse('78 78 05 23 00 04 38 F2 0D 0A', Device.SERVER);
}

/*
78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A
78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A
79 79 00 06 98 00 00 00 C7 00 0D 0A
78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A
78 78 05 23 00 03 4C 4D 0D 0A
78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A
78 78 05 23 00 04 38 F2 0D 0A
78 78 0B 23 01 01 93 04 00 01 00 05 2A 62 0D 0A
78 78 05 23 00 05 29 7B 0D 0A
78 78 0B 23 01 01 93 04 00 01 00 06 18 F9 0D 0A
78 78 05 23 00 06 1B E0 0D 0A
78 78 0B 23 01 01 93 04 00 01 00 07 09 70 0D 0A
78 78 05 23 00 07 0A 69 0D 0A
78 78 0B 23 01 01 93 04 00 01 00 08 F1 87 0D 0A
78 78 05 23 00 08 F2 9E 0D 0A
78 78 0B 23 01 01 91 04 00 01 00 09 E8 58 0D 0A
78 78 05 23 00 09 E3 17 0D 0A
*/

//testLogin();
//testHeartbeat();
testLocation();
//testWifiInformation();
//testOnlineCommand();
//testInformationTransmission();

//buildExample();
//parseExample();
