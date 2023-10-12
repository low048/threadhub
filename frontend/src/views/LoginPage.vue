<template>
  <div class="auth-container">
    <h2>Log In</h2>
    <form @submit.prevent="login">
      <div>
        <input type="email" id="email" v-model="email" required placeholder="Email" />
      </div>
      <div>
        <input type="password" id="password" v-model="password" required placeholder="Password" />
      </div>
      <button type="submit" class="login-button">Log In</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const store = useStore();
    const router = useRouter();

    const login = async () => {
      await store.dispatch('login', { email: email.value, password: password.value });
      // Redirect to the homepage after successful login
      router.push({ name: 'Home' });
    };

    return { email, password, login };
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 300px;
  margin: auto;
  text-align: center;
}

form div {
  margin-bottom: 15px;
}

.login-button{
  background-color: #007bff;
  color: white;
  border: 1px solid #007bff;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.login-button:hover {
  background-color: white;
  color: #007bff;
}

.error-text {
  color: red;
}
</style>