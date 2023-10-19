<template>
    <div id="app">
        <div v-if="loading">Loading posts...</div>
        <div v-else>
            <post-component v-for="post in posts" :key="post.id" :post="post"></post-component>
        </div>
    </div>
</template>
    
<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import PostComponent from '@/components/PostComponent.vue';

export default {
    components: {
        PostComponent
    },
    setup() {
        const posts = ref([]);
        const loading = ref(true);
        let unsubscribe; // To hold the unsubscribe function for the Firestore listener
        
        onMounted(() => {
            const postsCol = collection(db, 'posts');
            unsubscribe = onSnapshot(postsCol, (querySnapshot) => {
                posts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                loading.value = false;
            });
        });

        // Ensure you unsubscribe from the Firestore listener when the component is destroyed
        onBeforeUnmount(() => {
            if (unsubscribe) {
                unsubscribe();
            }
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
</style>