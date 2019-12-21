<template>
  <div>
    <h1>Terminals</h1>
    <p>{{host}}</p>
    <button @click="addTerminal()">Add</button>
    <table class="grid">
      <tr>
        <th>IMEI</th>
        <th>Phone number</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th>Speed</th>
        <th>Enabled</th>
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
        <td>
          <div class="command">
            <input type="text" v-model="terminal.command">
            <button class="gap" @click="sendCommand(terminal)">Send</button>
          </div>
        </td>
        <td><button @click="editTerminal(terminal)">Edit</button></td>
        <td><button @click="removeTerminal(index)">Remove</button></td>
      </tr>
    </table>
    <div class="response"></div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      host: 'http://localhost:3000',
      terminals: []
    }
  },
  mounted() {
    this.loadTerminals();
  },
  methods: {
    addTerminal() {
      this.$router.push({ path: 'add' });
    },
    editTerminal(terminal) {
      this.$router.push({ path: 'edit', params: terminal });
    },
    removeTerminal(index) {
      this.terminals.splice(index, 1);
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
</style>
