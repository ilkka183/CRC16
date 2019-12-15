<?php

include_once 'concoxReader.php';
include_once 'concoxWriter.php';


class ConcoxInformationTransmissionTerminal {
  public static function build($terminalInformationContent, $voltageLevel, $gsmSignalLength, $languageExtend, $informationSerialNumber) {
    $writer = new ConcoxWriter(0x98);

    $writer->writeByte($terminalInformationContent);
    $writer->writeWord($voltageLevel);
    $writer->writeByte($gsmSignalLength);
    $writer->writeWord($languageExtend);
    $writer->writeWord($informationSerialNumber);

    return $writer->encapsulate();
  }

  public static function parse($data) {
    $reader = new ConcoxReader($data, 0x98);

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


class ConcoxInformationTransmissionServer {
  public static function build($reservedExtensionBit, $informationSerialNumber) {
    $writer = new ConcoxWriter(0x98);

    $writer->writeByte(count($reservedExtensionBit));
    $writer->writeBytes($reservedExtensionBit);
    $writer->writeWord($informationSerialNumber);

    return $writer->encapsulate();
  }

  public static function parse($data) {
    $reader = new ConcoxReader($data, 0x98);

    $reservedExtensionBitLength = $reader->readByte();
    $reservedExtensionBit = $reader->readBytes($reservedExtensionBitLength);
    $informationSerialNumber = $reader->readWord();

    return array(
      'protocolNumber' => $reader->getProtocolNumber(),
      'reservedExtensionBitLength' => $reservedExtensionBitLength,
      'reservedExtensionBit' => $reservedExtensionBit,
      'informationSerialNumber' => $informationSerialNumber
    );
  }
}
