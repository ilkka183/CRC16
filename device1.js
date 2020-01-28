const ConcoxDevice = require('./device');
const { terminals } = require('./terminals')

const device = new ConcoxDevice();
device.detailLog = false;
device.autoLockDelay = 10000;
device.number = '1001',
device.imei = '123456789012345',
device.location = terminals.testLocation;
device.start();
