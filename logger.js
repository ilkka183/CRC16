const colors = require('colors');
const { Concox } = require('./lib/concox');


class ConcoxLogger {
  constructor() {
    this.detailLog = false;
  }

  logData(text, data) {
    console.log(text, Concox.toHex(data));
  }

  logPacket(packet, data) {
    if (this.detailLog)
      packet.log(data);
    else
      this.logData(packet.getFullTitle() + ':', data);
  }

  logAction(text) {
    if (this.detailLog)
      console.log('');

    console.log(text.yellow);
  }

  logError(text, error) {
    console.log(text.red, error);
  }
}

module.exports = ConcoxLogger;
