<template>
  <div class="auth-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="signUp">
      <div>
        <input type="email" id="email" v-model="email" required placeholder="Email" />
      </div>
      <div>
        <input type="password" id="password" v-model="password" required placeholder="Password" />
      </div>
      <button type="submit" class="signup-button">Sign Up</button>
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

    const signUp = async () => {
      await store.dispatch('signUp', { email: email.value, password: password.value });
      // Redirect to the homepage after successful sign up
      router.push({ name: 'Home' });
    };

    return { email, password, signUp };
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

.signup-button{
  background-color: #007bff;
  color: white;
  border: 1px solid #007bff;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.signup-button:hover {
  background-color: white;
  color: #007bff;
}
</style>
