const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

app.use(bodyParser.json());

app.get('/api', (req, res) => {
  const result = [
    {
      imei: '007',
      phone: '+3585061698',
      lat: 65,
      lng: 25,
      speed: 10
    },
    {
      imei: '123',
      phone: '+3585061698',
      lat: 65,
      lng: 25,
      speed: 10
    }
  ]
  
  res.send(result);
});

app.get('/api/:imei', (req, res) => {
  const result = {
    imei: req.params.imei,
    phone: '+3585061698',
    lat: 65,
    lng: 25,
    speed: 10
  };
  
  res.send(result);
});

app.post('/api', (req, res) => {
  const result = {
    imei: req.body.imei,
    phone: req.body.phone
  };
  
  res.send(result);
});

app.put('/api/:imei', (req, res) => {
  const result = {
    imei: req.params.imei,
    command: req.body.command
  };
  
  res.send(result);
});

app.delete('/api/:imei', (req, res) => {
  const result = {
    imei: req.params.imei,
  };
  
  res.send(result);
});

app.listen(port, () => console.log(`Example app listening on port ${port}...`));