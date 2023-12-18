<template>
  <div class="community-layout">
    <div class="spinner-container" v-if="loading">
      <div class="spinner-border" role="status"></div>
    </div>
    <div id="community-info" v-if="!loading" class="fade-in">
      <div class="edit-delete-icons" v-if="isAuthor(communityDetails.author)">
        <img src="@/assets/edit.png" alt="Edit Community" class="edit-icon" @click="goToEditCommunityPage">
        <img src="@/assets/delete.png" alt="Delete Community" class="delete-icon" @click="deleteCommunity">
      </div>
      <h3>{{ "c/" + communityDetails.id }}</h3>
      <p class="description">{{ communityDetails.description }}</p>
      <p class="author">Created by: {{ "u/" + communityDetails.author }}</p>
      <p class="timestamp">Created on: {{ formatDate(communityDetails.timestamp) }}</p>
      <button class="addpost-button" @click="goToAddPostPage">Add Post</button>
    </div>
    <div id="community-posts" v-if="!loading" class="fade-in">
      <div v-if="communityPosts.length === 0" class="no-posts-message">
        No posts to show.
      </div>
      <post-component v-for="post in communityPosts" :key="post.id" :post="post"
        :showCommunityId="false"></post-component>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import PostComponent from '@/components/PostComponent.vue';

export default {
  components: { PostComponent },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const communityId = ref(route.params.communityId);
    const communityDetails = ref({});
    const loading = ref(true);

    const communityPosts = computed(() => {
      return store.state.posts.postList.filter(post => post.communityId === communityId.value);
    });

    const formatDate = (timestamp) => {
      if (timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleDateString();
      }
      return '';
    };

    const goToAddPostPage = () => {
      router.push({ name: 'AddPostPage', params: { communityId: communityDetails.value.id } });
    };

    const goToEditCommunityPage = () => {
      router.push({ name: 'EditCommunityPage', params: { communityId: communityDetails.value.id } });
    };

    const isAuthor = (communityAuthor) => {
      const loggedInUser = store.state.auth.user;
      return loggedInUser && loggedInUser.email === communityAuthor;
    };

    const deleteCommunity = () => {
      const confirmDelete = confirm("Are you sure you want to delete this community?");
      if (confirmDelete) {
        store.dispatch('deleteCommunity', { communityId: communityId.value });
        router.push({ name: 'Home' });
      }
    };

    onMounted(async () => {
      try {
        await store.dispatch('fetchCommunities');
        await store.dispatch('fetchPosts', communityId);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        loading.value = false;
      }
      communityDetails.value = store.getters['allCommunities'].find(community => community.id === communityId.value) || {};
    });

    return { communityPosts, communityDetails, loading, formatDate, goToAddPostPage, isAuthor, goToEditCommunityPage, deleteCommunity };
  },
};
</script>
  
<style scoped>
@media (max-width: 768px) {
  .community-layout {
    flex-direction: column;
    align-items: center;
  }

  .community-layout #community-info {
    width: 100%;
    max-width: 100vw;
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
    top: 0;
  }

  .community-layout #community-posts {
    width: 100%;
    max-width: 100vw;
    padding: 0px;
  }
}

.fade-in {
  opacity: 0;
  animation: fade-in-animation 0.3s ease-in forwards;
}

@keyframes fade-in-animation {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.community-layout {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

#community-info {
  border: 1px solid var(--border-color);
  padding: 20px;
  margin-top: 20px;
  border-radius: 5px;
  background-color: var(--primary-color);
  max-height: 100vh;
  flex: 0 0 20vw;
  position: -webkit-sticky;
  position: sticky;
  top: 10px;
  z-index: 10;
}

#community-posts {
  flex-grow: 1;
  padding: 20px;
  max-width: 50vw;
  padding-right: 50px;
}

h3 {
  color: var(--primary-text-color);
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.author,
.description,
.timestamp {
  font-size: 0.9rem;
  color: var(--secondary-text-color);
  ;
  margin-bottom: 10px;
}

.addpost-button {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
}

.addpost-button:hover {
  background-color: var(--secondary-color-hover);
  transition: background-color 0.3s ease;
}

.spinner-container {
  color: var(--primary-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70vh;
  width: 100%;
}

.no-posts-message {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 20px;
  font-size: 1.2rem;
  color: var(--primary-text-color);
}

.edit-delete-icons {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
}

.edit-icon,
.delete-icon {
  width: 24px;
  height: 24px;
  margin-left: 10px;
  cursor: pointer;
  filter: invert(var(--invert-value));
}

.edit-icon:hover,
.delete-icon:hover {
  filter: invert(var(--invert-value-hover));
}
</style>
