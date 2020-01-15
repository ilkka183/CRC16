const cors = require('cors')
const express = require('express')
const routes = require('./routes')
const ConcoxServer = require('./server')
const { terminals } = require('./terminals')

const DEFAULT_TCP_PORT = 1234;
const DEFAULT_REST_PORT = 3000;
const DEFAULT_UPDATE_INTERVAL = 60; // in seconds

const tcpPort = DEFAULT_TCP_PORT;
const restPort = DEFAULT_REST_PORT;
const updateInterval = DEFAULT_UPDATE_INTERVAL;

// Fetch terminal datas from WordPress backend
terminals.initialize(updateInterval, true);

// TCP server communicating with the terminals
const tcp = new ConcoxServer();
tcp.detailLog = false;
tcp.commandTimeoutDelay = 5000;
tcp.listen(tcpPort, () => console.log(`Juro TCP server listening on port ${tcpPort}...`));

// Rest server called by the application
const rest = express()
rest.use(cors());
rest.use(express.json());
rest.use('/api', routes);
rest.listen(restPort, () => console.log(`Juro REST server listening on port ${restPort}...`));
