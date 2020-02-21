const cors = require('cors')
const express = require('express')
const ConcoxServer = require('./server')
const { terminals } = require('./terminals')

const DEFAULT_TCP_PORT = 1234;
const DEFAULT_REST_PORT = 3000;

let backendHost = null;
backendHost = 'http://localhost:55618/';
//backendHost = 'http://superapp1.superapp.fi/proto/juro/';
const backendUrl = backendHost + 'wp-json/juro/v1';
console.log(`Using backend REST API at ${backendUrl}`);

//terminals.populate('Lahti');
terminals.load(backendUrl, 60); // update interval in seconds

// TCP server communicating with the terminals
const tcpPort = DEFAULT_TCP_PORT;

const tcp = new ConcoxServer();
tcp.detailLog = false;
tcp.commandTimeoutDelay = 5000;
tcp.backendUrl = backendUrl;
tcp.listen(tcpPort, () => console.log(`Juro TCP server listening on port ${tcpPort}...`));

// Rest server called by the application
const restPort = DEFAULT_REST_PORT;

const rest = express()
rest.use(cors());
rest.use(express.json());
rest.use('/api', require('./routes/terminal'));
rest.listen(restPort, () => console.log(`Juro REST server listening on port ${restPort}...`));
