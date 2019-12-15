<?php

include_once 'concoxReader.php';
include_once 'concoxWriter.php';


class ConcoxLoginTerminal {
  private static function timeZoneLanguage($timeZone) {
    $result = abs($timeZone)*100 << 4;

    if ($timeZone < 0)
      $result |= 0x08;
    
    $language = 0x02;

    return $result | $language;
  }

  public static function build($imei, $modelIdentificationCode, $timeZone, $informationSerialNumber) {
    $writer = new ConcoxWriter(0x01);

    $writer->writeBytes($imei);
    $writer->writeBytes($modelIdentificationCode);
    $writer->writeWord(ConcoxLoginTerminal::timeZoneLanguage($timeZone));
    $writer->writeWord($informationSerialNumber);

    return $writer->encapsulate(true);
  }

  public static function parse($data) {
    $reader = new ConcoxReader($data, 0x01, true);

    $imei = $reader->readBytes(8);
    $modelIdentificationCode = $reader->readBytes(2);
    $timeZoneLanguage = $reader->readWord();

    $infoContent = array(
      'imei' => $imei,
      'modelIdentificationCode' => $modelIdentificationCode,
      'timeZoneLanguage' => $timeZoneLanguage
    );

    $informationSerialNumber = $reader->readWord();

    return array(
      'protocolNumber' => $reader->getProtocolNumber(),
      'infoContent' => $infoContent,
      'informationSerialNumber' => $informationSerialNumber
    );
  }
}


class ConcoxLoginServer {
  public static function build($year, $month, $day, $hour, $min, $second, $reservedExtensionBit, $informationSerialNumber) {
    $writer = new ConcoxWriter(0x01);

    $writer->writeByte($year);
    $writer->writeByte($month);
    $writer->writeByte($day);
    $writer->writeByte($hour);
    $writer->writeByte($min);
    $writer->writeByte($second);

    $writer->writeByte(count($reservedExtensionBit));
    $writer->writeBytes($reservedExtensionBit);
    $writer->writeWord($informationSerialNumber);

    return $writer->encapsulate();
  }

  public static function parse($data) {
    $reader = new ConcoxReader($data, 0x01);

    $year = $reader->readByte();
    $month = $reader->readByte();
    $day = $reader->readByte();
    $hour = $reader->readByte();
    $min = $reader->readByte();
    $second = $reader->readByte();

    $dateTime = array(
      'year' => $year,
      'month' => $month,
      'day' => $day,
      'hour' => $hour,
      'min' => $min,
      'second' => $second
    );

    $reservedExtensionBitLength = $reader->readByte();
    $reservedExtensionBit = $reader->readBytes($reservedExtensionBitLength);
    $informationSerialNumber = $reader->readWord();

    return array(
      'protocolNumber' => $reader->getProtocolNumber(),
      'dateTime' => $dateTime,
      'reservedExtensionBitLength' => $reservedExtensionBitLength,
      'reservedExtensionBit' => $reservedExtensionBit,
      'informationSerialNumber' => $informationSerialNumber
    );
  }
}
