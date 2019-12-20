<template>
  <div class="hello">
    <h1>Terminals</h1>
    <p>{{host}}</p>
    <button :disabled="editing" @click="startAdd()">Add</button>
    <table class="grid">
      <tr>
        <th>IMEI</th>
        <th>Phone number</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th>Speed</th>
        <th>Enabled</th>
        <th>State</th>
        <th v-if="!editing"></th>
        <th v-if="!editing"></th>
        <th v-if="!editing">Command</th>
      </tr>
      <tr v-for="(terminal, index) in terminals" :key="index">
        <td>{{terminal.imei}}</td>
        <td>{{terminal.phoneNumber}}</td>
        <td>{{terminal.lat}}</td>
        <td>{{terminal.lng}}</td>
        <td>{{terminal.speed}}</td>
        <td>{{terminal.enabled}}</td>
        <td>{{terminal.state}}</td>
        <td v-if="!editing"><button :disabled="editing" @click="startEdit(terminal)">Edit</button></td>
        <td v-if="!editing"><button :disabled="editing" @click="removeTerminal(index)">Remove</button></td>
        <td v-if="!editing">
          <input type="text" v-model="terminal.command">
          <button :disabled="editing || !terminal.command" @click="sendCommand(terminal)">Send</button>
        </td>
        <td v-if="editing">
          <button v-show="terminal.state > 0" @click="postEdit(terminal)">Post</button>
          <button v-show="terminal.state > 0" @click="cancelEdit(terminal)">Cancel</button>
        </td>
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
      terminals: [],
      editing: null
    }
  },
  mounted() {
    this.getTerminals();
  },
  methods: {
    startAdd() {
      const terminal = { imei: '', phoneNumber: '', state: 2 };
      this.terminals.push(terminal);
      this.editing = terminal;
    },
    startEdit(terminal) {
      if (terminal.state == 0) {
        terminal.state = 1;
        this.editing = terminal;
      } else
        this.cancelEdit(terminal);
    },
    postEdit(terminal) {
      terminal.state = 0;
      this.editing = null;
    },
    cancelEdit(terminal) {
      if (terminal.state == 2) {
        this.terminals.pop();
      }

      terminal.state = 0;
      this.editing = null;
    },
    removeTerminal(index) {
      this.terminals.splice(index, 1);
    },
    getTerminals() {
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
table.grid, .grid th, .grid td {
  border: 1px solid silver;
}

.grid td {
  font-family: 'Courier New', Courier, monospace;
}
</style>
