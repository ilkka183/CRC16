<template>
  <div>
    <h1>Add New Terminal</h1>
    <table>
      <tr><td>IMEI:*</td><td><input type="text" :size="20" v-model="terminal.imei"></td></tr>
      <tr><td>Phone number:*</td><td><input type="text" :size="20" v-model="terminal.phoneNumber"></td></tr>
    </table>
    <button @click="post">OK</button>
    <button @click="cancel">Cancel</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      terminal: {
        imei: null,
        phoneNumber: null
      }
    }
  },
  methods: {
    post() {
      this.cancel();
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
