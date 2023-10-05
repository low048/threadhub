<template>
  <div id="app">
    <header>
      <h1>
        <router-link to="/" class="header-link">threadhub</router-link>
      </h1>
      <div class="header-buttons">
        <button @click="goToLogin">Log In</button>
        <button @click="goToSignUp">Sign Up</button>
      </div>
    </header>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    goToLogin() {
      this.$router.push({ name: 'LoginPage' });  // Ensure the name matches your route name
    },
    goToSignUp() {
      this.$router.push({ name: 'SignUpPage' });  // Ensure the name matches your route name
    }
  }
};
</script>

<style>
header {
  background-color: #007bff;
  color: #007bff;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
}

.header-link {
  color: white;
  text-decoration: none;
}

.header-link:hover {
  text-decoration: none;
}

.header-buttons button {
  background-color: white;
  color: #007bff;
  border: 1px solid white;
  border-radius: 5px;
  padding: 10px 20px;
  margin-left: 10px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.header-buttons button:hover {
  background-color: #007bff;
  color: white;
}

.content {
  margin: 20px;
}
</style>
