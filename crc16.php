<?php
  
class Crc16 {
  private $poly;
  private $reflected;
  private $init;
  private $final;
  private $table = array();

  function __construct($poly, $reflected = true, $init = 0xFFFF, $final = 0xFFFF) {
    $this->poly = $poly;
    $this->reflected = $reflected;
    $this->init = $init;
    $this->final = $final;
  }

  public function createTable() {
    $this->table = array();
  
    for ($i = 0; $i < 256; $i++) {
      $crc = 0;
  
      if ($this->reflected)
        $crc = $i;
      else
        $crc = $i << 8;
    
      for ($j = 0; $j < 8; $j++) {
        if ($this->reflected)
          $crc = $crc & 1 ? $crc >> 1 ^ $this->poly : $crc >> 1;
        else
          $crc = $crc & 0x8000 ? $crc << 1 ^ $this->poly : $crc << 1;
      }
  
      $this->table[$i] = $crc & 0xFFFF;
    }
  }

  public function printTable() {
    echo '<table border="1">';
    echo "\r\n";
  
    foreach ($this->table as $i=>$value) {
      if ($i % 8 == 0)
        echo '<tr>';

      echo '<td>';
      echo '<code>';
      echo strtoupper(sprintf('%04x', $value));
      echo '</code>';
      echo '</td>';
  
      if ($i % 8 == 7) {
        echo '</tr>';
        echo "\r\n";
      }
    }

    echo '<table>';
    echo "\r\n";
  }

  // You have to create the table before calling calculate method
  public function calculate($data) {
    $fcs = $this->init;
  
    foreach ($data as $value) {
      if ($this->reflected)
        $fcs = ($fcs >> 8) ^ $this->table[($fcs ^ $value) & 0xFF];
      else
        $fcs = ($fcs << 8) ^ $this->table[(($fcs >> 8) ^ $value) & 0xFF];
    }
  
    $fcs = $fcs ^ $this->final;
    return $fcs & 0xFFFF;
  }
}


//
// Packets from the manual as example
//

// 1) Login request is using different CRC parameters !!!
// - polynomial 0xA097
// - no bit reflection
// - initial value 0x0000
// - final value 0x0000
$packet1a = array(
  0x11, 0x01, 0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71, 0x36, 0x05, 0x32, 0x02, 0x00, 0x39
);

// 2) The others are using the same parameters
// - polynomial 0x8408
// - reflected bits
// - initial value 0xFFFF
// - final value 0xFFFF
$packet1b = array(
  0x0C, 0x01, 0x11, 0x03, 0x14, 0x08, 0x38, 0x39, 0x00, 0x00, 0x39
);

$packet2a = array(
  0x0B, 0x23, 0xC0, 0x01, 0x22, 0x04, 0x00, 0x01, 0x00, 0x08
);

$packet2b = array(
  0x05, 0x23, 0x01, 0x00
);

$packet3a = array(
  0x00, 0x6F, 0x33, 0x11, 0x03, 0x14, 0x09, 0x06, 0x08, 0x00, 0x09, 0x01, 0xCC, 0x00, 0x28, 0x7D, 0x00, 0x1F, 0x40, 0x0E,
  0x24, 0x28, 0x7D, 0x00, 0x1F, 0x71, 0x07, 0x28, 0x7D, 0x00, 0x1E, 0x3F, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x31, 0x00, 0x36,
  0x76, 0x05, 0xBB, 0x5D, 0x46, 0x00, 0x87, 0x36, 0x31, 0x87, 0x5B, 0x48, 0xCC, 0x7B, 0x35, 0x36, 0x61, 0xA6, 0x4C, 0x00,
  0xE0, 0x4B, 0x8C, 0xBF, 0x58, 0x4F, 0x78, 0xA1, 0x06, 0x54, 0x15, 0xDE, 0x4F, 0x00, 0x87, 0x46, 0x1B, 0x9D, 0x84, 0x51,
  0x26, 0x52, 0xF3, 0xAD, 0xB1, 0x94, 0x55, 0xA1, 0x00, 0x00, 0x08
);

$packet4a = array(
  0x48, 0x2C, 0x10, 0x06, 0x0E, 0x02, 0x2D, 0x35, 0x01, 0xCC, 0x00, 0x28, 0x7D, 0x00, 0x1F, 0x71, 0x2D, 0x28, 0x7D, 0x00,
  0x1E, 0x17, 0x25, 0x28, 0x7D, 0x00, 0x1E, 0x23, 0x1E, 0x28, 0x7D, 0x00, 0x1F, 0x72, 0x1C, 0x28, 0x7D, 0x00, 0x1F, 0x40,
  0x12, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x02, 0x80, 0x89, 0x17, 0x44, 0x98,
  0xB4, 0x5C, 0xCC, 0x7B, 0x35, 0x36, 0x61, 0xA6, 0x5B, 0x00, 0x1F  
);

$packet5a = array(
  0x11, 0x80, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x55, 0x4E, 0x4C, 0x4F, 0x43, 0x4B, 0x23, 0x00, 0x01
);

$packet5b = array(
  0x00, 0x0D, 0x21, 0x00, 0x00, 0x00, 0x00, 0x01, 0x4F, 0x4B, 0x21, 0x00, 0x07
);

$packet6a = array(
  0x00, 0x28, 0x98, 0x00, 0x00, 0x08, 0x08, 0x68, 0x12, 0x01, 0x48, 0x37, 0x35, 0x71, 0x01, 0x00, 0x08, 0x04, 0x60, 0x04,
  0x03, 0x40, 0x00, 0x99, 0x32, 0x02, 0x00, 0x0A, 0x89, 0x86, 0x02, 0xB3, 0x13, 0x15, 0x90, 0x10, 0x99, 0x32, 0x00, 0x04
);

$packet6b = array(
  0x00, 0x06, 0x98, 0x00, 0x00, 0x00
);


function asHex($data) {
  $hex = '';

  foreach ($data as $value) {
    $hex .= strtoupper(sprintf('%02x', $value));
    $hex .= ' ';
  }

  return $hex;
}

function check($title, $data, $poly, $reflected, $init, $final) {
  $crc = new Crc16($poly, $reflected, $init, $final);
  $crc->createTable();
  $code = $crc->calculate($data);

  echo '<tr>';

  echo '<td>';
  echo $title;
  echo '</td>';

  echo '<td>';
  echo '<code>';
  echo asHex($data);
  echo '</code>';
  echo '</td>';

  echo '<td>';
  echo '<code>';
  echo strtoupper(sprintf('%04x', $code));
  echo '</code>';
  echo '</td>';

  echo '</tr>';
}

function checkLogin($title, $data) {
  // Login request is using different CRC parameters !!!
  check($title, $data, 0xA097, false, 0x0000, 0x0000);
}

function checkOther($title, $data) {
  check($title, $data, 0x8408, true, 0xFFFF, 0xFFFF);
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
  <tr><th>Packet</th><th>Data</th><th>Error Check</th></tr>
<?php
  checkLogin('1a', $packet1a);  // Login request is using different CRC parameters !!!

  checkOther('1b', $packet1b);
  checkOther('2a', $packet2a);
  checkOther('2b', $packet2b);
  checkOther('3a', $packet3a);
  checkOther('4a', $packet4a);
  checkOther('5a', $packet5a);
  checkOther('5b', $packet5b);
  checkOther('6a', $packet6a);
  checkOther('6b', $packet6b);
?>
</table>

<h2>A097 table</h2>
<?php
  $crc = new Crc16(0xA097, false, 0x0000, 0x0000);
  $crc->createTable();
  $crc->printTable();
?>

<h2>8408 table</h2>
<?php
  $crc = new Crc16(0x8408, true, 0xFFFF, 0xFFFF);
  $crc->createTable();
  $crc->printTable();
?>
        
</body>
</html>
