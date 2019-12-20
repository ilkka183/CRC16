class Terminal {
  constructor(imei, phoneNumber) {
    this.imei = imei;
    this.phoneNumber = phoneNumber;
    this.lat = undefined;
    this.lng = undefined;
    this.speed = undefined;
    this.command = undefined;
  }
}


class Terminals {
  constructor() {
    this.items = [];
  }

  find(imei) {
    return this.items.find(item => item.imei === imei);
  }

  findIndex(imei) {
    return this.items.findIndex(item => item.imei === imei);
  }

  add(item) {
    this.items.push(item);
  }

  removeAt(index) {
    this.items.splice(index, 1);
  }

  clear() {
    this.items = [];
  }

  populate() {
    this.clear();
    this.add(new Terminal('355951091347489', '+358 44 950 9899'));
    this.add(new Terminal('123456789012345', '+358 44 950 9900'));
  }
}

module.exports = { Terminal, Terminals };
