import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import PostDetail from '../views/PostDetail.vue';
import LoginPage from '../views/LoginPage.vue';
import SignUpPage from '../views/SignUpPage.vue';
import AddPostPage from '../views/AddPostPage.vue';
import CommunityPage from '../views/CommunityPage.vue';
import AddCommunityPage from '../views/AddCommunityPage.vue';
import EditCommunityPage from '../views/EditCommunityPage.vue';
import store from '@/store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/communities/:communityId/post/:id',
    name: 'PostDetail',
    component: PostDetail,
    props: true
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/signup',
    name: 'SignUpPage',
    component: SignUpPage
  },
  {
    path: '/communities/:communityId/add-post',
    name: 'AddPostPage',
    component: AddPostPage,
    props: true,
    meta: { requiresAuth: true }
  },
  { 
    path: '/communities/:communityId', 
    name: 'CommunityPage', 
    component: CommunityPage, 
    props: true
  },
  {
    path: '/add-community',
    name: 'AddCommunityPage',
    component: AddCommunityPage,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/communities/:communityId/edit',
    name: 'EditCommunityPage',
    component: EditCommunityPage,
    props: true,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !store.getters.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
