<?php

include_once 'crc16.php';

$crc16_x25 = new Crc16(0x8408);
$crc16_x25->createTable();


class Concox {
  private static $encryptKey = array(0x78, 0x69, 0x6e, 0x73, 0x69, 0x77, 0x65, 0x69, 0x26, 0x63, 0x6f, 0x6e, 0x63, 0x6f, 0x78);

  public static function crc($data, $encrypted = false) {
    global $crc16_x25;

    if ($encrypted)
      $data = array_merge($data, Concox::$encryptKey);

    return $crc16_x25->calculate($data);
  }

  public static function crcRange($data, $index, $count, $encrypted = false) {
    $slice = array_slice($data, $index, $count);
    return Concox::crc($slice, $encrypted);
  }

  public static function equals($data1, $data2) {
    if (count($data1) != count($data2))
      return false;

    for ($i = 0; $i < count($data1); $i++)
      if ($data1[$i] != $data2[$i])
        return false;

    return true;
  }

  public static function toHex($data) {
    $hex = '';

    foreach ($data as $value) {
      if ($hex != '')
        $hex .= ' ';

      $hex .= strtoupper(sprintf('%02x', $value));
    }

    return $hex;
  }

  public static function toBinary($hex) {
    $values = array();

    if (strpos($hex, ' ') !== false) {
      // 01 23 45 67 89 0A BC DE
      $values = explode(' ', $hex);
    } else {
      // 01234567890ABCDE
      for ($i = 0; $i < strlen($hex); $i += 2)
        $values[] = substr($hex, $i, 2);
    }
 
    $data = array();
  
    foreach ($values as $value)
      $data[] = hexdec($value);

    return $data;
  }
}
