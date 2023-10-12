<template>
  <div id="app">
    <header>
      <h1>
        <router-link to="/" class="header-link">threadhub</router-link>
      </h1>
      <div class="header-buttons">
        <button v-if="!isAuthenticated" @click="goToLogin">Log In</button>
        <button v-if="!isAuthenticated" @click="goToSignUp">Sign Up</button>
        <div v-if="isAuthenticated" class="user-info">
          <p class="welcome-text">Welcome, {{ userEmail }}</p>
          <button @click="logout">Log Out</button>
        </div>
      </div>
    </header>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();

    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const userEmail = computed(() => store.state.user?.email || '');

    const goToLogin = () => {
      router.push({ name: 'LoginPage' });
    };

    const goToSignUp = () => {
      router.push({ name: 'SignUpPage' });
    };

    const logout = () => {
      store.dispatch('logout');
    };

    return { isAuthenticated, userEmail, goToLogin, goToSignUp, logout };
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

.header-buttons {
  display: flex;
  align-items: center;
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

.user-info {
  display: flex;
  align-items: center;
}

.welcome-text {
  color: white;
  margin:0;
  margin-right: 20px;
}

.content {
  margin: 20px;
}
</style>
