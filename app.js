const cors = require('cors')
const express = require('express')
const routes = require('./routes')

const app = express()

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const restPort = 3000;
app.listen(restPort, () => console.log(`Juro REST server listening on port ${restPort}...`));
