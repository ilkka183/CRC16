class Crc16 {
  constructor(poly, reflected = true, init = 0xFFFF, final = 0xFFFF) {
    this.poly = poly;
    this.reflected = reflected;
    this.init = init;
    this.final = final;
    this.table = [];
  }

  createTable() {
    this.table = [];
  
    for (let i = 0; i < 256; i++) {
      let crc;
  
      if (this.reflected)
        crc = i;
      else
        crc = i << 8;
    
      for (let j = 0; j < 8; j++) {
        if (this.reflected)
          crc = crc & 1 ? crc >>> 1 ^ this.poly : crc >>> 1;
        else
          crc = crc & 0x8000 ? crc << 1 ^ this.poly : crc << 1;
      }
  
      this.table[i] = crc & 0xFFFF;
    }
  }

  printTable() {
    let line = '';
  
    for (let i in this.table) {
      line += '0x' + ('0000' + this.table[i].toString(16)).substr(-4).toUpperCase() + ' ';
  
      if (i % 8 == 7) {
        console.log(this.line);
        line = '';
      }
    }

    return line;
  }

  // You have to create the table before calling calculate method
  calculate(data) {
    let fcs = this.init;
  
    for (let b of data) {
      if (this.reflected)
        fcs = (fcs >> 8) ^ this.table[(fcs ^ b) & 0xFF];
      else
        fcs = (fcs << 8) ^ this.table[((fcs >> 8) ^ b) & 0xFF];
    }
  
    fcs = fcs ^ this.final;
    return fcs & 0xFFFF;
  }
}

module.exports = Crc16;
