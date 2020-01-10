<template>
  <div>
    <div class="buttons">
      <button :disabled="connection" @click="connect">Connect</button>
      <button :disabled="!connection" @click="disconnect">Disconnect</button>
      <span class="separator"></span>
      <button :disabled="!connection" @click="login">Login</button>
      <button :disabled="!connection" @click="informationTransmission">Information Transmission</button>
      <button :disabled="!connection" @click="heartbeat">Heartbeat</button>
      <button :disabled="!connection" @click="location">Location</button>
      <span class="separator"></span>
      <button :disabled="!output" @click="clear">Clear</button>
    </div>
    <textarea class="response" cols="100" rows="20" v-model="output"></textarea>
    <div class="log">{{response}}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      connection: null,
      output: '',
    }
  },
  methods: {
    log(text) {
      this.output += text + '\n';
    },
    connect() {
      this.log('Connect');
      this.connection = {};
    },
    disconnect() {
      this.log('Disconnect');
      this.connection = null;
    },
    login() {
      this.log('Login');
    },
    informationTransmission() {
    },
    heartbeat() {
    },
    location() {
    },
    clear() {
      this.output = '';
    },
  }
}
</script>

<style scoped>
.response {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
}

.buttons {
  display: flex;
  margin-bottom: 4px;
}

.buttons button {
  margin-right: 4px;
}

.separator {
  width: 8px;
}
</style>
