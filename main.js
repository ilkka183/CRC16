const {
  Concox ,
  ServerLogin,
  ServerHeartbeat,
  ServerInformationTransmission,
  TerminalLogin,
  TerminalHeartbeat,
  TerminalInformationTransmission
} = require('./concox');


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

Concox.compare(
  TerminalLogin.build([0x03, 0x55, 0x95, 0x10, 0x91, 0x34, 0x74, 0x89], [0x36, 0x08], 1, 1),
  Concox.toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A'));

Concox.compare(
  ServerLogin.build(19, 12, 13, 2, 57, 12, [], 1),
  Concox.toBinary('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A'));

Concox.compare(
  ServerInformationTransmission.build([], 0),
  Concox.toBinary('79 79 00 06 98 00 00 00 C7 00 0D 0A'));

Concox.compare(
  TerminalHeartbeat.build(1, 402, 4, 1, 3),
  Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A'));

Concox.compare(
  ServerHeartbeat.build(3),
  Concox.toBinary('78 78 05 23 00 03 4C 4D 0D 0A'));

Concox.compare(
  TerminalHeartbeat.build(1, 402, 4, 1, 4),
  Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A'));

Concox.compare(
  ServerHeartbeat.build(4),
  Concox.toBinary('78 78 05 23 00 04 38 F2 0D 0A'));
    
  
/*  
console.log(TerminalLogin.parse(Concox.toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A')));
console.log(ServerLogin.parse(Concox.toBinary('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A')));
console.log(ServerInformationTransmission.parse(Concox.toBinary('79 79 00 06 98 00 00 00 C7 00 0D 0A')));

console.log(TerminalHeartbeat.parse(Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A')));
console.log(ServerHeartbeat.parse(Concox.toBinary('78 78 05 23 00 03 4C 4D 0D 0A')));

console.log(TerminalHeartbeat.parse(Concox.toBinary('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A')));
console.log(ServerHeartbeat.parse(Concox.toBinary('78 78 05 23 00 04 38 F2 0D 0A')));
*/