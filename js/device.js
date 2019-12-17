class ConcoxDevice {
  static get defaultPort() {
    return 1234;
  }

  bufferToHex(data) {
    const str = data.toString('hex').toUpperCase();
    let hex = '';

    for (let i = 0; i < str.length; i++) {
      if ((i > 0) && (i % 2 == 0))
        hex += ' ';

      hex += str[i];
    }

    return hex;
  }

  log(text, data) {
    console.log(text + ':', this.bufferToHex(data));
  }
}

module.exports = ConcoxDevice;
