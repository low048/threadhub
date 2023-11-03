import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.css';
import './firebase';
import store from './store';
import { auth } from './firebase';

let app;

auth.onAuthStateChanged(user => {
  if (!app) {
    app = createApp(App)
      .use(store)
      .use(router)
      .mount('#app');
  }

  if (user) {
    store.commit('SET_USER', user);
  } else {
    store.commit('SET_USER', null);
  }
});