<?php

include 'concox.php';
include 'concoxLogin.php';


function compare($data1, $data2) {
  echo '<tr>';

  echo '<td>';
  echo '<code>';

  if (!Concox::equals($data1, $data2)) {
    echo '<<< ERROR >>>';
    echo Concox::toHex($data1);
    echo Concox::toHex($data2);
    echo '<<< ERROR >>>';
  }
  else
    echo Concox::toHex($data1);

  echo '</code>';
  echo '</td>';

  echo '</tr>';
}

function check($title, $hex, $encrypted = false) {
  $data = Concox::toBinary($hex);
  $code = Concox::crc($data, $encrypted);

  echo '<tr>';

  echo '<td>';
  echo $title;
  echo '</td>';

  echo '<td>';
  echo '<code>';
  echo Concox::toHex($data);
  echo '</code>';
  echo '</td>';

  echo '<td>';
  echo '<code>';
  echo strtoupper(sprintf('%04x', $code));
  echo '</code>';
  echo '</td>';

  echo '</tr>';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title></title>
</head>
<body>

<h2>Packets</h2>
<table border="1">
  <tr><th>Data</th></tr>
<?php
  compare(
    ConcoxLoginTerminal::build(array(0x03, 0x55, 0x95, 0x10, 0x91, 0x34, 0x74, 0x89), array(0x36, 0x08), 1, 1),
    Concox::toBinary('78 78 11 01 03 55 95 10 91 34 74 89 36 08 06 42 00 01 15 FC 0D 0A'));

  compare(
    ConcoxLoginServer::build(19, 12, 13, 2, 57, 12, array(), 1),
    Concox::toBinary('78 78 0C 01 13 0C 0D 02 39 0C 00 00 01 F6 EC 0D 0A'));

/*
  compare(
    ConcoxInformationTransmissionServer::build(array(), 0),
    Concox::toBinary('79 79 00 06 98 00 00 00 C7 00 0D 0A'));

  compare(
    ConcoxHeartbeatTerminal::build(1, 402, 4, 1, 3),
    Concox::toBinary('78 78 0B 23 01 01 92 04 00 01 00 03 4B 7F 0D 0A'));

  compare(
    ConcoxHeartbeatServer::build(3),
    Concox::toBinary('78 78 05 23 00 03 4C 4D 0D 0A'));

  compare(
    ConcoxHeartbeatTerminal::build(1, 402, 4, 1, 4),
    Concox::toBinary('78 78 0B 23 01 01 92 04 00 01 00 04 3F C0 0D 0A'));

  compare(
    ConcoxHeartbeatServer::build(4),
    Concox::toBinary('78 78 05 23 00 04 38 F2 0D 0A'));
*/
?>
</table>

<h2>CRC</h2>
<table border="1">
  <tr><th>Packet</th><th>Data</th><th>Error Check</th></tr>
<?php
  check('1a', '11 01 08 68 12 01 48 37 35 71 36 05 32 02 00 39', true);
  check('1b', '0C 01 11 03 14 08 38 39 00 00 39');
  check('2a', '0B 23 C0 01 22 04 00 01 00 08');
  check('2b', '05 23 01 00');
  check('3a', '00 6F 33 11 03 14 09 06 08 00 09 01 CC 00 28 7D 00 1F 40 0E 24 28 7D 00 1F 71 07 28 7D 00 1E 3F 06 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 31 00 36 76 05 BB 5D 46 00 87 36 31 87 5B 48 CC 7B 35 36 61 A6 4C 00 E0 4B 8C BF 58 4F 78 A1 06 54 15 DE 4F 00 87 46 1B 9D 84 51 26 52 F3 AD B1 94 55 A1 00 00 08');
  check('4a', '48 2C 10 06 0E 02 2D 35 01 CC 00 28 7D 00 1F 71 2D 28 7D 00 1E 17 25 28 7D 00 1E 23 1E 28 7D 00 1F 72 1C 28 7D 00 1F 40 12 00 00 00 00 00 00 00 00 00 00 00 00 FF 02 80 89 17 44 98 B4 5C CC 7B 35 36 61 A6 5B 00 1F');
  check('5a', '11 80 0B 00 00 00 00 55 4E 4C 4F 43 4B 23 00 01');
  check('5b', '00 0D 21 00 00 00 00 01 4F 4B 21 00 07');
  check('6a', '00 28 98 00 00 08 08 68 12 01 48 37 35 71 01 00 08 04 60 04 03 40 00 99 32 02 00 0A 89 86 02 B3 13 15 90 10 99 32 00 04');
  check('6b', '00 06 98 00 00 00');
?>
</table>

<h2>CRC table</h2>
<?php
  $crc = new Crc16(0x8408, true, 0xFFFF, 0xFFFF);
  $crc->createTable();
  $crc->printTable();
?>
        
</body>
</html>
