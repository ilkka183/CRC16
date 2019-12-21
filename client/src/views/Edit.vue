<template>
  <div>
    <h1>Edit Terminal</h1>
    <table v-if="terminal">
      <tr><td>IMEI:*</td><td><code>{{imei}}</code></td></tr>
      <tr><td>Phone number:*</td><td><input type="text" :size="20" v-model="terminal.phoneNumber"></td></tr>
      <tr><td>Latitude:</td><td><input type="text" :size="10" v-model="terminal.lat"></td></tr>
      <tr><td>Longitude:</td><td><input type="text" :size="10" v-model="terminal.lng"></td></tr>
      <tr><td>Speed:</td><td><input type="text" :size="10" v-model="terminal.speed"></td></tr>
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
      terminal: null
    }
  },
  computed: {
    imei() {
      return this.$route.params.imei;
    }
  },
  mounted() {
    axios.get(this.host + '/api/' + this.imei)
      .then(response => {
        this.terminal = response.data;
      });
  },
  methods: {
    post() {
      axios.put(this.host + '/api/' + this.imei, { terminal: this.terminal })
        .then(response => {
          window.console.log(response);
          this.cancel();
        });
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
