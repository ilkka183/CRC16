<template>
  <div>
    <h1>Terminals</h1>
    <p><span>REST API:</span><code>{{host}}</code></p>
    <button @click="addTerminal()">Add</button>
    <table class="grid">
      <tr>
        <th>IMEI</th>
        <th>Phone number</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th>Speed</th>
        <th>Enabled</th>
        <th>IP address</th>
        <th>Serial number</th>
        <th>Command</th>
        <th></th>
        <th></th>
      </tr>
      <tr v-for="(terminal, index) in terminals" :key="index">
        <td>{{terminal.imei}}</td>
        <td>{{terminal.phoneNumber}}</td>
        <td>{{terminal.lat}}</td>
        <td>{{terminal.lng}}</td>
        <td>{{terminal.speed}}</td>
        <td>{{terminal.enabled}}</td>
        <td>{{terminal.ipAddress}}</td>
        <td>{{terminal.serialNumber}}</td>
        <td>
          <div class="command">
            <input type="text" v-model="terminal.command">
            <button class="gap" :disabled="!terminal.command" @click="sendCommand(terminal)">Send</button>
          </div>
        </td>
        <td><button @click="editTerminal(terminal)">Edit</button></td>
        <td><button @click="removeTerminal(terminal)">Remove</button></td>
      </tr>
    </table>
    <div class="response"><pre>{{response}}</pre></div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      host: 'http://localhost:3000',
      terminals: [],
      response: null
    }
  },
  mounted() {
    window.console.log('mounted');
    this.loadTerminals();
  },
  methods: {
    addTerminal() {
      this.$router.push({ path: 'add' });
    },
    editTerminal(terminal) {
      this.$router.push({ path: 'edit/' + terminal.imei });
    },
    removeTerminal(terminal) {
      axios.delete(this.host + '/api/' + terminal.imei)
        .then(response => {
          this.loadTerminals();
          this.response = response;
          window.console.log(response);
        });
    },
    loadTerminals() {
      axios.get(this.host + '/api/')
        .then(response => {
          const terminals = response.data;

          terminals.forEach(element => {
            element.state = 0;
            element.command = null;
          });

          this.terminals = terminals;
        });
    },
    sendCommand(terminal) {
      axios.put(this.host + '/api/command/' + terminal.imei, { command: terminal.command })
        .then(response => {
          this.response = response;
          window.console.log(response);
        });
    }
  }
}
</script>

<style scoped>
input {
  width: 100%;
  box-sizing : border-box;
}

.grid th, .grid td {
  border: 1px solid silver;
}

.grid td {
  font-family: 'Courier New', Courier, monospace;
}

.gap {
  margin-left: 4px;
}

.command {
  display: flex;
}

.response {
  font-family: 'Courier New', Courier, monospace;
}
</style>
