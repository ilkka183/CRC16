<?php


class ConcoxReader {
  private $data;
  private $index;
  private $protocolNumber;

  function __construct($data, $protocolNumber, $encryptedCrc = false) {
    $this->data = $data;
    $this->index = 0;
    $this->protocolNumber = $protocolNumber;
    
    $this->readHeader($encryptedCrc);
  }

  public function getProtocolNumber() {
    return $this->protocolNumber;
  }

  public function peekByte() {
    return $this->data[$this->index];
  }

  public function peekWord($offset = 0) {
    $upper = $this->data[$this->index + $offset];
    $lower = $this->data[$this->index + $offset + 1];

    return ($upper << 8) | $lower;
  }

  public function peekBytes($count, $offset = 0) {
    $result = array();

    for ($i = 0; $i < $count; $i++ )
      $result[] = $this->data[$this->index + $offset + $i];

    return $result;
  }

  public function readByte() {
    return $this->data[$this->index++];
  }

  public function readWord() {
    $upper = $this->readByte();
    $lower = $this->readByte();

    return ($upper << 8) | $lower;
  }

  public function readBytes($count) {
    $result = array();

    for ($i = 0; $i < $count; $i++ )
      $result[] = $this->readByte();

    return $result;
  }

  public function readHeader($encryptedCrc) {
    $startBit = ($this->protocolNumber === 0x98) ? array(0x79, 0x79) : array(0x78, 0x78);
    $stopBit = array(0x0D, 0x0A);

    // Start bit
    $bit = $this->peekBytes(2);

    if (!Concox::equals($bit, $startBit))
      throw new Exception('Invalid start bit');

    // Stop bit
    $bit = $this->peekBytes(2, count($this->data) - 2);

    if (!Concox::equals($bit, $stopBit))
      throw new Exception('Invalid stop bit');
  
    // Error check
    $errorCheck = $this->peekWord(count($this->data) - 4);
    $crc = Concox::crcRange($this->data, 2, count($this->data) - 4, $encryptedCrc);

    if ($errorCheck !== $crc)
      throw new Exception('Invalid error check code');
    
    $this->readBytes(2); // start bit

    // Packet length
    $packetLength = ($this->protocolNumber === 0x98) ? $this->readWord() : $this->readByte();
    $offset = ($this->protocolNumber === 0x98) ? 6 : 5;

    if ($packetLength !== count($this->data) - $offset)
      throw new Exception('Invalid packet length');

    // Protocol number
    $protocolNumber = $this->readByte();

    if ($protocolNumber != $this->protocolNumber)
      throw new Exception('Invalid protocol number');
  }
}
