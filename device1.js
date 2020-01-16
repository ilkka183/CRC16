const ConcoxDevice = require('./device');

const device = new ConcoxDevice();
device.detailLog = false;
device.number = '1001',
device.imei = '123456789012345',
device.latitude = 60.170714;
device.longitude = 24.941294;

device.route = [
  { lat: -0.01, lng: +0.01 },
  { lat: -0.01, lng: -0.01 },
  { lat: +0.01, lng: -0.01 },
  { lat: +0.01, lng: +0.01 }
];

device.routeDelay = 5000;
device.routeEnabled = false;
device.start();
