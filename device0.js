const ConcoxDevice = require('./device');
const { terminals } = require('./terminals')

const device = new ConcoxDevice();
device.detailLog = false;
device.number = '7551040072',
device.imei = '355951092918858',
device.location = terminals.testLocation;
device.start();
