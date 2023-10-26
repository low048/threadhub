<template>
    <div id="app">
        <div class="loading-posts" v-if="loading">Loading posts...</div>
        <div v-else>
            <post-component v-for="post in posts" :key="post.id" :post="post"></post-component>
        </div>
    </div>
</template>
    
<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import PostComponent from '@/components/PostComponent.vue';

export default {
    components: { PostComponent },
    setup() {
        const store = useStore();
        const loading = ref(true);
        const posts = computed(() => store.state.posts.postList);

        onMounted(async () => {
            await store.dispatch('fetchPosts');
            loading.value = false;
        });

        return { posts, loading };
    }
};
</script>

<style scoped>
#app {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
}

.loading-posts{
    text-align: center;
}
</style>