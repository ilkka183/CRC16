const express = require('express');
const { Terminal, Terminals } = require('./terminals')

const router = express.Router();

const terminals = new Terminals();
terminals.populate();


router.get('/', (req, res) => {
  console.log(terminals.items);
  res.send(terminals.items);
});

router.get('/:imei', (req, res) => {
  res.send(terminals.find(req.params.imei));
});

router.post('/', (req, res) => {
  const imei = req.body.imei;
  
  if (!terminals.find(imei)) {
    const item = new Terminal(imei, req.body.phone);
    terminals.add(item);
  
    res.status(201);
    res.send(item);
  } else {
    res.status(400);
    res.send(`Terminal with IMEI ${imei} already exists!`);
  }
});

router.put('/:imei', (req, res) => {
  const imei = req.params.imei;
  const item = terminals.find(imei);

  if (item != null) {
    if (req.body.terminal.lat)
      item.lat = req.body.terminal.lat;
    
    if (req.body.terminal.lng)
      item.lng = req.body.terminal.lng;
    
    if (req.body.terminal.speed) {
      item.speed = req.body.terminal.speed;
    }

    console.log(item);
   
    res.send(item);
  } else {
    res.status(404);
    res.send(`Terminal with IMEI ${imei} not found!`);
  }
});

router.put('/command/:imei', (req, res) => {
  const imei = req.params.imei;
  const command = req.body.command;

  console.log(`Command ${command} to ${imei}`);

  const item = terminals.find(imei);

  if (item != null) {
    item.command = command;

    const result = {
      item,
      command
    };

    res.send(result);
  } else {
    res.status(404);
    res.send(`Terminal with IMEI ${imei} not found!`);
  }
});

router.delete('/:imei', (req, res) => {
  const imei = req.params.imei;
  const index = terminals.findIndex(imei);

  if (index !== -1) {
    terminals.removeAt(index);

    const result = {
      imei,
      index
    };
    
    res.send(result);
  } else {
    res.status(404);
    res.send(`Terminal with IMEI ${imei} not found!`);
  }
});

module.exports = router;
