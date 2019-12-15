<?php

include_once 'concoxReader.php';
include_once 'concoxWriter.php';


class ConcoxHeartbeatTerminal {
  public static function build($terminalInformationContent, $voltageLevel, $gsmSignalLength, $languageExtend, $informationSerialNumber) {
    $writer = new ConcoxWriter(0x23);

    $writer->writeByte($terminalInformationContent);
    $writer->writeWord($voltageLevel);
    $writer->writeByte($gsmSignalLength);
    $writer->writeWord($languageExtend);

    $writer->writeWord($informationSerialNumber);

    return $writer->encapsulate();
  }

  public static function parse($data) {
    $reader = new ConcoxReader($data, 0x23);

    $terminalInformationContent = $reader->readByte();
    $voltageLevel = $reader->readWord();
    $gsmSignalLength = $reader->readByte();
    $languageExtend = $reader->readWord();

    $infoContent = array(
      'terminalInformationContent' => $terminalInformationContent,
      'voltageLevel' => $voltageLevel,
      'gsmSignalLength' => $gsmSignalLength,
      'languageExtend' => $languageExtend
    );

    $informationSerialNumber = $reader->readWord();

    return array(
      'protocolNumber' => $reader->getProtocolNumber(),
      'infoContent' => $infoContent,
      'informationSerialNumber' => $informationSerialNumber
    );
  }
}


class ConcoxHeartbeatServer {
  public static function build($informationSerialNumber) {
    $writer = new ConcoxWriter(0x23);

    $writer->writeWord($informationSerialNumber);

    return $writer->encapsulate();
  }

  public static function parse($data) {
    $reader = new ConcoxReader($data, 0x23);

    $informationSerialNumber = $reader->readWord();

    return array(
      'protocolNumber' => $reader->getProtocolNumber(),
      'informationSerialNumber' => $informationSerialNumber
    );
  }
}
