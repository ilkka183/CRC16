<?php

include_once 'concox.php';


class ConcoxWriter {
  private $data = array();
  private $protocolNumber;

  function __construct($protocolNumber) {
    $this->protocolNumber = $protocolNumber;

    if ($protocolNumber === 0x98)
      $this->writeWord(0x0000); // two byte length
    else
      $this->writeByte(0x00); // one byte length
      
    $this->writeByte($protocolNumber);
  }

  public function getProtocolNumber() {
    return $this->protocolNumber;
  }
 
  public function writeByte($value) {
    $this->data[] = $value & 0xFF;
  }

  public function writeWord($value) {
    $this->writeByte($value >> 8);
    $this->writeByte($value);
  }

  public function writeBytes($value) {
    foreach ($value as $b)
      $this->writeByte($b);
  }

  public function encapsulate($encryptedCrc = false) {
    if ($this->protocolNumber === 0x98) {
      $length = count($this->data);

      $this->data[0] = ($length >> 8) & 0xFF;
      $this->data[1] = $length & 0xFF;
    }
    else {
      $this->data[0] = count($this->data) + 1;
    }
      
    $this->writeWord(Concox::crc($this->data, $encryptedCrc));

    $startBit = ($this->protocolNumber === 0x98) ? 0x79 : 0x78;

    array_unshift($this->data, $startBit); // start bytes
    array_unshift($this->data, $startBit);

    $this->data[] = 0x0D; // stop bytes
    $this->data[] = 0x0A;

    return $this->data;
  }
}
