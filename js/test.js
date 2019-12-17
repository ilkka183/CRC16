const Concox = require('./concox');
const { ConcoxTerminalPacket, ConcoxServerPacket } = require('./concoxPacket');
const { ConcoxTerminalLogin, ConcoxServerLogin } = require('./concoxLogin');
const { ConcoxTerminalHeartbeat, ConcoxServerHeartbeat } = require('./concoxHeartbeat');
const { ConcoxTerminalInformationTransmission, ConcoxServerInformationTransmission, ConcoxModule } = require('./concoxInformationTransmission');


function testLogin() {
  const terminal = '78 78 11 01 08 68 12 01 48 37 35 71 36 05 32 02 00 39 DE F7 0D 0A';
  const server = '78 78 0C 01 11 03 14 08 38 39 00 00 39 95 70 0D 0A';

  Concox.compare(ConcoxTerminalLogin.build('0868120148373571', [0x36, 0x05], 800, 57), Concox.toBinary(terminal));
  Concox.compare(ConcoxServerLogin.build({ year: 17, month: 3, day: 20, hour: 8, min: 56, second: 57 }, [], 57), Concox.toBinary(server));

  console.log(ConcoxTerminalPacket.parse(Concox.toBinary(terminal)));
  console.log(ConcoxServerPacket.parse(Concox.toBinary(server)));
}

function testHeartbeat() {
  const terminal = '78 78 0B 23 C0 01 22 04 00 01 00 08 18 72 0D 0A';
  const server = '78 78 05 23 01 00 67 0E 0D 0A';

  Concox.compare(ConcoxTerminalHeartbeat.build(192, 290, 4, 1, 8), Concox.toBinary(terminal));
  Concox.compare(ConcoxServerHeartbeat.build(256), Concox.toBinary(server));

  console.log(ConcoxTerminalPacket.parse(Concox.toBinary(terminal)));
  console.log(ConcoxServerPacket.parse(Concox.toBinary(server)));
}

function testInformationTransmission() {
  const terminal = '79 79 00 28 98 00 00 08 08 68 12 01 48 37 35 71 01 00 08 04 60 04 03 40 00 99 32 02 00 0A 89 86 02 B3 13 15 90 10 99 32 00 04 F5 81 0D 0A';
  const server = '79 79 00 06 98 00 00 00 C7 00 0D 0A';

  const modules = [
    new ConcoxModule(0, Concox.toBinary('08 68 12 01 48 37 35 71')),
    new ConcoxModule(1, Concox.toBinary('04 60 04 03 40 00 99 32')),
    new ConcoxModule(2, Concox.toBinary('89 86 02 B3 13 15 90 10 99 32'))
  ];

  Concox.compare(ConcoxTerminalInformationTransmission.build(modules, 4), Concox.toBinary(terminal));
  Concox.compare(ConcoxServerInformationTransmission.build([], 0), Concox.toBinary(server));

  console.log(ConcoxTerminalPacket.parse(Concox.toBinary(terminal)));
  console.log(ConcoxServerPacket.parse(Concox.toBinary(server)));
}

function buildExample() {
  Concox.compare(
    ConcoxTerminalLogin.build('0355951091347489', [0x36, 0x08], 100, 1),
    Concox.toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A'));
  
  Concox.compare(
    ConcoxServerLogin.build({ year: 19, month: 12, day: 13, hour: 2, min: 57, second: 12 }, [], 1),
    Concox.toBinary('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A'));
  
  Concox.compare(
    ConcoxServerInformationTransmission.build([], 0),
    Concox.toBinary('79 79 00 06 98 00 00 00 C7 00 0D 0A'));
    
  Concox.compare(
    ConcoxTerminalHeartbeat.build(1, 402, 4, 1, 3),
    Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A'));
  
  Concox.compare(
    ConcoxServerHeartbeat.build(3),
    Concox.toBinary('78 78 05 23 00 03 4C 4D 0D 0A'));
  
  Concox.compare(
    ConcoxTerminalHeartbeat.build(1, 402, 4, 1, 4),
    Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A'));
  
  Concox.compare(
    ConcoxServerHeartbeat.build(4),
    Concox.toBinary('78 78 05 23 00 04 38 F2 0D 0A'));
}

function parseExample() {
  console.log(ConcoxTerminalPacket.parse(Concox.toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A')));
  console.log(ConcoxServerPacket.parse(Concox.toBinary('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A')));
  console.log(ConcoxServerPacket.parse(Concox.toBinary('79 79 00 06 98 00 00 00 C7 00 0D 0A')));
  
  console.log(ConcoxTerminalPacket.parse(Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A')));
  console.log(ConcoxServerPacket.parse(Concox.toBinary('78 78 05 23 00 03 4C 4D 0D 0A')));
  
  console.log(ConcoxTerminalPacket.parse(Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A')));
  console.log(ConcoxServerPacket.parse(Concox.toBinary('78 78 05 23 00 04 38 F2 0D 0A')));
}

/*
echo -n '787811010868120148373571360532020039DEF70D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101086812014837357136053202003A9F050D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109291885836053202003906890D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109134748936080642000115FC0D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C
echo -n '78781101035595109134748936080642000115FC0D0A' | xxd -r -ps | nc 40.115.232.141 21105 | hexdump -C

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

testLogin();
//testHeartbeat();
//testInformationTransmission();

//buildExample();
//parseExample();
