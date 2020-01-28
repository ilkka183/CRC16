const ConcoxDevice = require('./device');
const { terminals } = require('./terminals')

const device = new ConcoxDevice();
device.detailLog = false;
device.autoLockDelay = 10000;
device.number = '1002',
device.imei = '012345678901234',
device.location = terminals.testLocation;
device.start();
