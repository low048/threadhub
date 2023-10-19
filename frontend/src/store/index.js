import { createStore } from 'vuex';
import authModule from './modules/auth';
import postsModule from './modules/posts';
import commentsModule from './modules/comments';

export default createStore({
  modules: {
    auth: authModule,
    posts: postsModule,
    comments: commentsModule,
  },
});