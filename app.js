const ConcoxServer = require('./server')
const cors = require('cors')
const express = require('express')
const routes = require('./routes')
const { terminals } = require('./terminals')

const app = express()

app.use(cors());
app.use(express.json());
app.use('/api', routes);

terminals.load();

setInterval(() => {
  terminals.update();
}, 60000);

const tcpPort = 1234;
const concox = new ConcoxServer();
//concox.detailLog = true;
concox.start(tcpPort);

const restPort = 3000;
app.listen(restPort, () => console.log(`Juro REST server listening on port ${restPort}...`));
