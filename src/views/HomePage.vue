<template>
    <div class="spinner-container" v-if="loading">
        <div class="spinner-border" role="status"></div>
    </div>
    <div class="homepage-layout">
        <div class="community-section">
            <div class="community-header fade-in" v-if="!loading">
                <button @click="goToAddCommunityPage" class="add-community-button">+</button>
                <h3>Communities</h3>
                <button class="expand-button" @click="showCommunities = !showCommunities">
                    {{ showCommunities ? 'Hide' : 'Show' }}
                </button>
            </div>
            <div id="community-list" v-if="!loading && showCommunities" class="fade-in">
                <community-component v-for="community in communities" :key="community.id"
                    :community="community"></community-component>
            </div>
        </div>
        <div id="featured-posts" v-if="!loading" class="fade-in">
            <h3 class="featured-posts-title">Featured Posts</h3>
            <PostComponent v-for="post in featuredPosts" :key="post.id" :post="post" />
        </div>
    </div>
</template>



<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import CommunityComponent from '@/components/CommunityComponent.vue';
import PostComponent from '@/components/PostComponent.vue';

export default {
    components: {
        PostComponent,
        CommunityComponent
    },
    setup() {
        const store = useStore();
        const router = useRouter();
        const loading = ref(true);
        const showCommunities = ref(true);
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

        // Method to navigate to AddCommunityPage
        const goToAddCommunityPage = () => {
            router.push({ name: 'AddCommunityPage' });
        };


        return {
            communities,
            featuredPosts, // Update the name to reflect its purpose
            loading,
            goToAddCommunityPage,
            showCommunities
        };
    }
}; 
</script>
  


<style scoped>
@media (max-width: 768px) {
    .homepage-layout {
        flex-direction: column;
    }

    .homepage-layout .community-section {
        width: 100%;
        padding: 0px;
    }

    .homepage-layout #community-list {
        order: 1;
    }

    .homepage-layout #featured-posts {
        max-width: 100vw;
        order: 2;
        padding: 0px;
        padding-top: 0px;
    }

    .homepage-layout .expand-button {
        display: block;
    }

    .homepage-layout .community-section {
        padding-bottom: 0px;
    }
}

.community-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    padding: 20px;
}

.community-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
}

.expand-button {
    display: none;
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    padding: 5px 10px;
    width: 20%;
    height: 35px;
    margin-left: auto;
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

.homepage-layout {
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

#featured-posts {
    flex-grow: 1;
    padding: 20px;
    max-width: 50vw;
    padding-right: 50px;
}

.spinner-container {
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70vh;
    width: 100%;
}

h3 {
    color: var(--primary-text-color);
    height: 35px;
    padding-top: 5px;
    margin-right: auto;
}

.featured-posts-title{
    margin-bottom: 18px;
}

.add-community-button {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    font-size: 20px;
    width: 35px;
    height: 35px;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.add-community-button:hover {
    background-color: var(--secondary-color-hover);
    transition: background-color 0.3s ease;
}</style>