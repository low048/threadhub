import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/firebase';

export default {
  state: {
    user: null,
    error: null,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async signUp({ commit }, { email, password }) {
      console.log("Vuex action: signUp called with:", email, password);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User signed up:", userCredential.user);
        commit('SET_USER', userCredential.user);
        commit('SET_ERROR', null); // Clear any previous errors
      } catch (error) {
        console.error("There was an error signing up: ", error);
        commit('SET_ERROR', error.message || 'An error occurred during signup.'); // Store error message to state
      }
    },
    async login({ commit }, { email, password }) {
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log("User logged in:", userCredential.user);
          commit('SET_USER', userCredential.user);
          commit('SET_ERROR', null); // Clear any previous errors
      } catch (error) {
          console.error("There was an error logging in: ", error);
          commit('SET_ERROR', error.message || 'An error occurred during login.'); // Store error message to state
      }
    },
    async logout({ commit }) {
      try {
          await signOut(auth);
          commit('SET_USER', null);
      } catch (error) {
          console.error("There was an error logging out: ", error);
          // Handle logout error, e.g., show a notification to the user
      }
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.user;
    },
    error(state) {
      return state.error;
    },
    currentUser(state) {
      return state.user;
    },
  },
};
