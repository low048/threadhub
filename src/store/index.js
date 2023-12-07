import { createStore } from 'vuex';
import authModule from './modules/auth';
import postsModule from './modules/posts';
import commentsModule from './modules/comments';
import communitiesModule from './modules/communities';

export default createStore({
  state: {
    darkMode: false,
  },
  mutations: {
    setDarkMode(state, darkMode) {
      state.darkMode = darkMode;
    },
  },
  actions: {
    toggleDarkMode({ commit, state }) {
      const darkMode = !state.darkMode;
      commit('setDarkMode', darkMode);
    },
  },
  getters: {
    isDarkMode(state) {
      return state.darkMode;
    },
  },
  modules: {
    auth: authModule,
    posts: postsModule,
    comments: commentsModule,
    communities: communitiesModule,
  },
});