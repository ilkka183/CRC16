const express = require('express');
const { terminals, Terminal } = require('./terminals')

const router = express.Router();


router.get('/', (req, res) => {
  console.log(`Get ${terminals.items.length} terminals`);
  res.send(terminals.items);
});

router.get('/:imei', (req, res) => {
  const terminal = terminals.find(req.params.imei);
  console.log(`Get terminal ${JSON.stringify(terminal)}`);
  res.send(terminal);
});

router.post('/', (req, res) => {
  const imei = req.body.imei;

  if (!terminals.find(imei)) {
    const terminal = new Terminal(imei, req.body.phoneNumber, true);
    terminals.add(terminal);
  
    res.status(201);
    res.send(terminal);
    console.log(`Add terminal ${JSON.stringify(terminal)}`);
  } else
    sendResponseText(res, 400, `Terminal ${imei} already exists`);
});

router.put('/:imei', (req, res) => {
  function updateField(terminal, name, required) {
    if (req.body[name] !== undefined) {
      if (req.body[name] || required)
        terminal[name] = req.body[name];
      else
        terminal[name] = undefined;
    }
  }

  const imei = req.params.imei;
  const terminal = terminals.find(imei);

  if (terminal != null) {
    updateField(terminal, 'phoneNumber', true);
    updateField(terminal, 'lat');
    updateField(terminal, 'lng');
    updateField(terminal, 'speed');
    updateField(terminal, 'enabled', true);

    res.send(terminal);
    console.log(`Update terminal ${imei} to ${JSON.stringify(req.body)}`);
  } else
    terminalNotFound(res, imei);
});

router.put('/command/:imei', (req, res) => {
  const imei = req.params.imei;
  const command = req.body.command;

  const terminal = terminals.find(imei);

  if (terminal != null) {
    res.send({ terminal, command });
    console.log(`Command "${command}" to ${imei}`);
  } else
    terminalNotFound(res, imei);
});

router.delete('/:imei', (req, res) => {
  const imei = req.params.imei;
  const index = terminals.findIndex(imei);

  if (index != -1) {
    terminals.removeAt(index);

    res.send({ imei, index });
    console.log(`Delete terminal ${imei}`);
  } else
    terminalNotFound(res, imei);
});

function terminalNotFound(res, imei) {
  sendResponseText(res, 404, `Terminal ${imei} not found`);
}

function sendResponseText(res, status, text) {
  res.status(status);
  res.send(text);
  console.log(text);
}

module.exports = router;
