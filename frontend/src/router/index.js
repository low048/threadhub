import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import PostDetail from '../views/PostDetail.vue';
import Login from '../views/LoginPage.vue';
import SignUp from '../views/SignUpPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail,
    props: true
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: Login
  },
  {
    path: '/signup',
    name: 'SignUpPage',
    component: SignUp
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
