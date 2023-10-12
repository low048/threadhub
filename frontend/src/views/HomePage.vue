<template>
    <div id="app">
        <div v-if="loading">Loading posts...</div>
        <div v-else>
            <post-component v-for="post in posts" :key="post.id" :post="post" @upvote="upvotePost" @downvote="downvotePost"></post-component>
        </div>
    </div>
</template>
    
<script>
import { ref, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import PostComponent from '@/components/PostComponent.vue';

export default {
    components: {
        PostComponent
    },
    setup() {
        const posts = ref([]);
        const loading = ref(true);

        onMounted(async () => {
            try {
                console.log("Fetching posts...");
                const postsCol = collection(db, 'posts');
                const querySnapshot = await getDocs(postsCol);
                posts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Posts fetched:", posts.value);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                loading.value = false;
            }
        });

        const upvotePost = (postId) => {
            const post = posts.value.find(p => p.id === postId);
            if (post) post.votes++;
            // TODO: Update votes in Firestore
        };

        const downvotePost = (postId) => {
            const post = posts.value.find(p => p.id === postId);
            if (post) post.votes--;
            // TODO: Update votes in Firestore
        };

        return { posts, loading, upvotePost, downvotePost };
    }
};
</script>

<style scoped>
#app {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
}
</style>