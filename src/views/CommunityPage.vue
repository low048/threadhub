<template>
    <div class="community-layout">
        <div id="community-info">
            <div v-if="loading">
                Loading community details...
            </div>
            <div v-else>
                <h3>{{ "c/" + communityDetails.id }}</h3>
                <p class="description">{{ communityDetails.description }}</p>
                <p class="author">Created by: {{ communityDetails.author }}</p>
                <p class="timestamp">Created on: {{ formatDate(communityDetails.timestamp) }}</p>
            </div>
        </div>
        <div id="community-posts">
            <div class="loading-posts" v-if="loading">
                Loading posts...
            </div>
            <div v-else>
                <post-component v-for="post in communityPosts" :key="post.id" :post="post"></post-component>
                <button class="addpost-button" @click="goToAddPostPage">Add Post</button>
            </div>
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
            // Logic to filter posts for this community
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

        onMounted(async () => {
            await store.dispatch('fetchCommunities');
            await store.dispatch('fetchPosts', communityId);
            loading.value = false;
            communityDetails.value = store.getters['allCommunities'].find(community => community.id === communityId.value) || {};

            /*if (!communityPosts.value.length) {
                await store.dispatch('fetchPosts', communityId);
            }*/
        });

        return { communityPosts, communityDetails, loading, formatDate, goToAddPostPage };
    }
};
</script>
  
<style scoped>
.community-layout {
  display: flex;
  align-items: flex-start;
}

#community-info {
  border: 1px solid #ddd;
  padding: 20px;
  margin-top: 20px;
  border-radius: 5px;
  background-color: white; /* Optional: Adjust based on your design */
  max-height: 100vh;
  overflow: auto;
  flex: 0 0 20vw; /* Adjust width as needed */
  transition: background-color 0.2s ease;
}

#community-posts {
  flex-grow: 1;
  padding: 20px;
  max-width: 60vw;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.author, .description, .timestamp {
  font-size: 0.9rem;
  color: #555;
}

.loading-posts {
  text-align: center;
}

.addpost-button {
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease;
    margin-bottom: 10px;
}

.addpost-button:hover {
    background-color: #0056b3;
}
</style>
