const Concox = require('./concox');
const { ConcoxLoginTerminal, ConcoxLoginServer } = require('./concoxLogin');
const { ConcoxHeartbeatTerminal, ConcoxHeartbeatServer } = require('./concoxHeartbeat');
const { ConcoxInformationTransmissionTerminal, ConcoxInformationTransmissionServer } = require('./concoxInformationTransmission');


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

const imei = '355951092918858';

Concox.compare(
  ConcoxLoginTerminal.build('0355951091347489', [0x36, 0x08], 1, 1),
  Concox.toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A'));

Concox.compare(
  ConcoxLoginServer.build({ year: 19, month: 12, day: 13, hour: 2, min: 57, second: 12 }, [], 1),
  Concox.toBinary('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A'));

/*
Concox.compare(
  ConcoxInformationTransmissionServer.build([], 0),
  Concox.toBinary('79 79 00 06 98 00 00 00 C7 00 0D 0A'));

Concox.compare(
  ConcoxHeartbeatTerminal.build(1, 402, 4, 1, 3),
  Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A'));

Concox.compare(
  ConcoxHeartbeatServer.build(3),
  Concox.toBinary('78 78 05 23 00 03 4C 4D 0D 0A'));

Concox.compare(
  ConcoxHeartbeatTerminal.build(1, 402, 4, 1, 4),
  Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A'));

Concox.compare(
  ConcoxHeartbeatServer.build(4),
  Concox.toBinary('78 78 05 23 00 04 38 F2 0D 0A'));
*/    

console.log(ConcoxLoginTerminal.parse(Concox.toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A')));
console.log(ConcoxLoginServer.parse(Concox.toBinary('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A')));
/*
console.log(ConcoxInformationTransmissionServer.parse(Concox.toBinary('79 79 00 06 98 00 00 00 C7 00 0D 0A')));

console.log(ConcoxHeartbeatTerminal.parse(Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A')));
console.log(ConcoxHeartbeatServer.parse(Concox.toBinary('78 78 05 23 00 03 4C 4D 0D 0A')));

console.log(ConcoxHeartbeatTerminal.parse(Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A')));
console.log(ConcoxHeartbeatServer.parse(Concox.toBinary('78 78 05 23 00 04 38 F2 0D 0A')));
*/