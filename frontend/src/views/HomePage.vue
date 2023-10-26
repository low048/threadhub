<template>
    <div id="app">
        <div class="loading-posts" v-if="loading">Loading posts...</div>
        <div v-else>
            <post-component v-for="post in posts" :key="post.id" :post="post"></post-component>
            <button class="addpost-button" @click="goToAddPostPage">Add Post</button>
        </div>
    </div>
</template>
    
<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import PostComponent from '@/components/PostComponent.vue';

export default {
    components: { PostComponent },

    setup() {
        const store = useStore();
        const router = useRouter();
        const loading = ref(true);
        const posts = computed(() => store.state.posts.postList);

        onMounted(async () => {
            await store.dispatch('fetchPosts');
            loading.value = false;
        });

        const goToAddPostPage = () => {
            router.push({ name: 'AddPostPage' });
        };

        return { posts, loading, goToAddPostPage };
    }
};
</script>

<style scoped>
#app {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
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