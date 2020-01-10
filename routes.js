const express = require('express');
const { terminals, Terminal } = require('./terminals')

const router = express.Router();


router.get('/', (req, res) => {
  console.log(`Get ${terminals.items.length} terminals`);

  const items = [];

  for (const terminal of terminals.items)
    items.push(terminal.getObject());

  res.send(items);
});

router.get('/:number', (req, res) => {
  const terminal = terminals.findByNumber(req.params.number);
  const item = terminal.getObject();
  console.log(`Get terminal ${JSON.stringify(item)}`);
  res.send(item);
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

router.put('/:number', (req, res) => {
  function updateField(terminal, name, required) {
    if (req.body[name] !== undefined) {
      if (req.body[name] || required)
        terminal[name] = req.body[name];
      else
        terminal[name] = undefined;
    }
  }

  const number = req.params.number;
  const terminal = terminals.findByNumber(number);

  if (terminal != null) {
    updateField(terminal, 'phoneNumber', true);
    updateField(terminal, 'lat');
    updateField(terminal, 'lng');
    updateField(terminal, 'speed');
    updateField(terminal, 'enabled', true);

    res.send(terminal);
    console.log(`Update terminal ${number} to ${JSON.stringify(req.body)}`);
  } else
    terminalNotFound(res, number);
});

router.put('/command/:number', (req, res) => {
  const number = req.params.number;
  const command = req.body.command;

  const terminal = terminals.findByNumber(number);

  if (terminal != null) {
    res.send({ terminal, command });
    console.log(`Command "${command}" to ${number}`);
  } else
    terminalNotFound(res, number);
});

router.delete('/:number', (req, res) => {
  const number = req.params.number;
  const index = terminals.findIndexByNumber(number);

  if (index != -1) {
    terminals.removeAt(index);

    res.send({ number, index });
    console.log(`Delete terminal ${number}`);
  } else
    terminalNotFound(res, number);
});

function terminalNotFound(res, number) {
  sendResponseText(res, 404, `Terminal ${number} not found`);
}

function sendResponseText(res, status, text) {
  res.status(status);
  res.send(text);
  console.log(text);
}

module.exports = router;
