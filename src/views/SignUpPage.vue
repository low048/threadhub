<template>
  <div class="auth-container">
    <!--<p>Already a user? <router-link to="/login">Log in</router-link></p>-->
    <form @submit.prevent="login">
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
p {
  color: var(--primary-text-color);
}
.auth-container {
  background-color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 20px;
  max-width: 300px;
  margin: auto;
  text-align: center;
}

input {
  background-color: var(--primary-color-hover);
  color: var(--primary-text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 5px;
}

form div {
  margin-bottom: 15px;
}

.signup-button {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  
}
.signup-button:hover {
  background-color: var(--secondary-color-hover);
  transition: background-color 0.3s, color 0.3s;
}
</style>
