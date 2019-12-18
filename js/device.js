const { Device, Concox } = require('./concox');


class ConcoxDevice {
  static get defaultPort() {
    return 1234;
  }

  constructor(detailLog = false) {
    this.detailLog = detailLog;
  }

  logData(text, data) {
    console.log(text, Concox.toHex(data));
  }

  logPacket(packet, data) {
    if (this.detailLog)
      packet.log(data);
    else
      this.logData(packet.getTitle() + ':', data);
  }

  logAction(text) {
    if (this.detailLog)
      console.log('');

    console.log(text);
  }

  logError(text, error) {
    console.log(text, error);
  }
}

module.exports = ConcoxDevice;
