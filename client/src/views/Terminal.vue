<template>
  <div>
    <div class="buttons">
      <button>Connect</button>
      <button>Disconnect</button>
      <button>Login</button>
      <button>Information Transmission</button>
      <button>Heartbeat</button>
      <button>Location</button>
    </div>
    <div class="log">{{response}}</div>
  </div>
</template>

<script>

export default {
  data() {
    return {
    }
  },
}
</script>

<style scoped>
.response {
  font-family: 'Courier New', Courier, monospace;
}

.buttons {
  display: flex;
}
</style>
