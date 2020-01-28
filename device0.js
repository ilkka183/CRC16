const ConcoxDevice = require('./device');
const { terminals } = require('./terminals')

const device = new ConcoxDevice();
device.detailLog = false;
device.number = '7551040072',
device.imei = '355951092918858',
device.location = terminals.testLocation;

device.route = [
  { lat: -0.001, lng: +0.001 },
  { lat: -0.001, lng: -0.001 },
  { lat: +0.001, lng: -0.001 },
  { lat: +0.001, lng: +0.001 }
];

device.routeDelay = 5000;
device.routeEnabled = false;
device.start();
