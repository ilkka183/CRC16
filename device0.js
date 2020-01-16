const ConcoxDevice = require('./device');

const device = new ConcoxDevice();
device.detailLog = false;
device.number = '7551040072',
device.imei = '355951092918858',
device.latitude = 60.169035;
device.longitude = 24.936149;

device.route = [
  { lat: -0.001, lng: +0.001 },
  { lat: -0.001, lng: -0.001 },
  { lat: +0.001, lng: -0.001 },
  { lat: +0.001, lng: +0.001 }
];

device.routeDelay = 5000;
device.routeEnabled = false;
device.start();
