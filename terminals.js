class Terminal {
  constructor(imei, phoneNumber, enabled) {
    this.imei = imei;
    this.phoneNumber = phoneNumber;
    this.enabled = enabled;
    this.lat = undefined;
    this.lng = undefined;
    this.speed = undefined;
    this.ipAddress = undefined;
    this.loginTime = undefined;
    this.serialNumber = undefined;
  }
}


class Terminals {
  constructor() {
    this.items = [];
  }

  find(imei) {
    return this.items.find(item => item.imei == imei);
  }

  findIndex(imei) {
    return this.items.findIndex(item => item.imei == imei);
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
    this.add(new Terminal('0355951091347489', '+358 44 950 9899', true));
    this.add(new Terminal('1234567890123456', '+358 44 950 9900', true));
    this.add(new Terminal('0123456789012345', '+358 44 950 0000', true));
  }
}

const terminals = new Terminals();


module.exports = { terminals, Terminal };
