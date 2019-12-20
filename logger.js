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

module.exports = ConcoxLogger;
