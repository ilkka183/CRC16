<template>
  <div>
    <h1>Add New Terminal</h1>
    <table>
      <tr><td>IMEI:*</td><td><input type="text" :size="20" autofocus v-model="terminal.imei"></td></tr>
      <tr><td>Phone number:*</td><td><input type="text" :size="20" v-model="terminal.phoneNumber"></td></tr>
    </table>
    <button @click="post">OK</button>
    <button @click="cancel">Cancel</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      host: 'http://localhost:3000',
      terminal: {
        imei: null,
        phoneNumber: null
      }
    }
  },
  methods: {
    post() {
      if (this.terminal.imei && this.terminal.phoneNumber) {
        axios.post(this.host + '/api', this.terminal)
          .then(response => {
            window.console.log(response);
            this.cancel();
          });
      }
    },
    cancel() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
button {
  margin-right: 4px;
}
</style>
