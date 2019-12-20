const cors = require('cors')
const express = require('express')
//const ConcoxServer = require('./server')

const app = express()
app.use(cors());
app.use(express.json());


app.get('/api', (req, res) => {
  res.send(concox.terminals.items);
});

app.get('/api/:imei', (req, res) => {
  res.send(concox.terminals.find(req.params.imei));
});

app.post('/api', (req, res) => {
  const imei = req.body.imei;
  
  if (!concox.terminals.find(imei)) {
    const item = new Terminal(imei, req.body.phone);
    concox.terminals.add(item);
  
    res.status(201);
    res.send(item);
  } else {
    res.status(400);
    res.send(`Terminal with IMEI ${imei} already exists!`);
  }
});

app.put('/api/:imei', (req, res) => {
  const imei = req.params.imei;
  const item = concox.terminals.find(imei);

  if (item != null) {
    if (req.body.lat)
      item.lat = req.body.lat;
    
    if (req.body.lng)
      item.lng = req.body.lng;
    
    if (req.body.speed)
      item.speed = req.body.speed;
    
    res.send(item);
  } else {
    res.status(404);
    res.send(`Terminal with IMEI ${imei} not found!`);
  }
});

app.put('/api/command/:imei', (req, res) => {
  const imei = req.params.imei;
  const command = req.body.command;

  console.log(imei + ': ' + command);

  const item = concox.terminals.find(imei);

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

app.delete('/api/:imei', (req, res) => {
  const imei = req.params.imei;
  const index = concox.terminals.findIndex(imei);

  if (index !== -1) {
    concox.terminals.removeAt(index);

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


const restPort = 3000;
app.listen(restPort, () => console.log(`Juro REST server listening on port ${restPort}...`));
