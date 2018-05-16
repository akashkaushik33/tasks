<template>
  <div class="hello">
    <div>
      <img src="https://raw.githubusercontent.com/cryptocracy/images/master/tasks.png" alt="Souq Project Tasks" height="168" width="168">
      <h1>Souq Project Tasks</h1>
      <p>A decentralized task app built for <a href="https://cryptocracy.io" target="_blank">Souq</a> Projects</p>
      <button class="btn btn-default" @click.prevent="signIn">Sign In With Blockstack</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'landing',
  data () {
    return {
      blockstack: window.blockstack
    }
  },

  methods: {
    signIn () {
      const blockstack = this.blockstack
      blockstack.redirectToSignIn()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
