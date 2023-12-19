<template>
  <div id="app" :class="{ dark: darkMode }">
    <header>
      <h1>
        <router-link to="/" class="header-link">threadhub</router-link>
      </h1>
      <div class="header-buttons">
        <button v-if="!isAuthenticated" @click="goToLogin">Log In</button>
        <!--<button v-if="!isAuthenticated" @click="goToSignUp">Sign Up</button>-->
        <div v-if="isAuthenticated" class="user-info">
          <p class="welcome-text">Welcome, {{ userEmail }}</p>
          <button @click="logout">Log Out</button>
        </div>
        <button style="font-size: x-large; padding: 4px;" @click="toggleDarkMode">{{ toggleDarkModeLabel }}</button>
      </div>
    </header>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const darkMode = ref(localStorage.getItem('darkMode') === 'true');
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const userEmail = computed(() => store.state.auth.user?.email || '');
    const toggleDarkModeLabel = computed(() => (darkMode.value ? '☀️' : '🌙'));

    const goToLogin = () => {
      router.push({ name: 'LoginPage' });
    };

    const goToSignUp = () => {
      router.push({ name: 'SignUpPage' });
    };

    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value;
      localStorage.setItem('darkMode', darkMode.value);
      if (darkMode.value) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    };

    const logout = () => {
      store.dispatch('logout');
    };

    onMounted(() => {
      if (darkMode.value) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    });

    return { isAuthenticated, userEmail, darkMode, toggleDarkModeLabel, goToLogin, goToSignUp, logout, toggleDarkMode };
  }
};
</script>

<style>
:root {
  --app-color: #efefef;
  --primary-color: #ffffff;
  --primary-color-hover: #f5f5f5; 
  --secondary-color: #007bff;
  --secondary-color-hover: #0056b3;
  --primary-text-color: #212529;
  --secondary-text-color: #666666;
  --border-color: #d6d6d6;
  --invert-value: 80%;
  --invert-value-hover: 40%;
}

.dark {
  --app-color: #030303;
  --primary-color: #1a1a1b;
  --primary-color-hover: #3e3e41; 
  --secondary-color: #007bff;
  --secondary-color-hover: #0056b3;
  --primary-text-color: #f8f9fa;
  --secondary-text-color: #ced4da;
  --border-color: #3d3d3d;
  --invert-value: 20%;
  --invert-value-hover: 60%;
}

@media (max-width: 768px) {
  .welcome-text{
    display:none;
  }
}

html body {
  background-color: var(--app-color) !important;
  overflow-x: hidden;
}

#app{
  background-color: var(--app-color);
  min-height: 100vh;
}

header {
  background-color: var(--secondary-color);
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
}

.header-link {
  color: white;
  text-decoration: none;
  font-size:xx-large;
  margin-left:5px;
}

.header-link:hover {
  text-decoration: none;
}

.header-buttons {
  display: flex;
  align-items: center;
}

.header-buttons button {
  color: var(--primary-text-color);
  background-color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 10px 20px;
  margin-left: 10px;
  cursor: pointer;
}

.header-buttons button:hover {
  background-color: var(--primary-color-hover);
  transition: background-color 0.3s, color 0.3s;
}

.user-info {
  display: flex;
  align-items: center;
}

.welcome-text {
  color: white;
  margin: 0;
  margin-right: 20px;
}

.content {
  margin: 20px;
}
</style>
