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
      $crc;
  
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
      $offset = $i % 16;

      if ($offset == 0)
        echo '<tr>';

      echo '<td>';
      echo '<code>';
      echo strtoupper(sprintf('%04x', $value));
      echo '</code>';
      echo '</td>';
  
      if ($offset == 15) {
        echo '</tr>';
        echo "\r\n";
      }
    }

    echo '</table>';
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
