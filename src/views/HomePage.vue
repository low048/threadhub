<template>
    <div class="spinner-container" v-if="loading">
        <div class="spinner-border" role="status"></div>
    </div>
    <div class="homepage-layout">
        <div id="community-list" v-if="!loading" class="fade-in">
            <h3>Communities</h3>
            <community-component v-for="community in communities" :key="community.id"
                :community="community"></community-component>
        </div>
        <div id="featured-posts" v-if="!loading" class="fade-in">
            <h3>Featured Posts</h3>
            <PostComponent v-for="post in featuredPosts" :key="post.id" :post="post" :showCommunityId="true"/>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import CommunityComponent from '@/components/CommunityComponent.vue';
import PostComponent from '@/components/PostComponent.vue';

export default {
    components: {
        PostComponent,
        CommunityComponent
    },
    setup() {
        const store = useStore();

        const loading = ref(true);
        const communities = computed(() => store.getters['allCommunities']);

        const featuredPosts = computed(() => {
            return store.state.posts.postList
                .filter(post => post.isFeatured)
                .sort((a, b) => b.votes - a.votes); // Sorting by votes in descending order
        });
        
        onMounted(async () => {
            await store.dispatch('fetchFeaturedPosts');
            await store.dispatch('fetchCommunities');
            loading.value = false;
        });

        return {
            communities,
            featuredPosts, // Update the name to reflect its purpose
            loading,
        };
    }
}; 
</script>
  


<style scoped>
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
.homepage-layout {
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

#community-list {
    flex: 0 0 20vw;
    padding: 20px;
    max-height: 100vh;
    overflow: auto;
}

#featured-posts {
    flex-grow: 1;
    padding: 20px;
    max-width: 60vw;
}
.spinner-container {
  color: var(--primary-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70vh;
}
h3 {
  color: var(--primary-text-color);
}
</style>