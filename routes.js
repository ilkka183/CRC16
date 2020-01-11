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
  const number = req.body.number;

  if (!terminals.findByNumber(number)) {
    const terminal = new Terminal(number, req.body.imei, req.body.phoneNumber, true);
    terminals.add(terminal);
  
    const item = terminal.getObject();

    res.status(201);
    res.send(item);
    console.log(`Add terminal ${JSON.stringify(item)}`);
  } else
    sendResponseText(res, 400, `Terminal ${number} already exists`);
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
    updateField(terminal, 'latitude');
    updateField(terminal, 'longitude');
    updateField(terminal, 'speed');
    updateField(terminal, 'enabled', true);

    const item = terminal.getObject();

    res.send(item);
    console.log(`Update terminal ${number} to ${JSON.stringify(req.body)}`);
  } else
    terminalNotFound(res, number);
});

router.put('/command/:number', (req, res) => {
  const number = req.params.number;
  const command = req.body.command;

  const terminal = terminals.findByNumber(number);

  if (terminal != null) {
    terminal.sendCommand(command);

    const item = terminal.getObject();

    res.send({
      terminal: item,
      command
    });

    console.log(`Command "${command}" to terminal ${number}`);
  } else
    terminalNotFound(res, number);
});

router.delete('/:number', (req, res) => {
  const number = req.params.number;
  const index = terminals.findIndexByNumber(number);

  if (index != -1) {
    terminals.removeAt(index);

    res.send({
      number,
      index
    });

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
