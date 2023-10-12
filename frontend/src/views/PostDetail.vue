<template>
    <div class="post-container">
        <div v-if="loading">Loading post...</div>
        <div v-else>
            <div class="post">
                <div class="votes">
                    <button @click="upvote" class="vote-button">
                        <img src="@/assets/upvote.png" alt="Upvote" class="vote-image">
                    </button>
                    <p class="vote-number">{{ post.votes }}</p>
                    <button @click="downvote" class="vote-button">
                        <img src="@/assets/downvote.png" alt="Downvote" class="vote-image">
                    </button>
                </div>
                <div class="post-content">
                    <h1 class="post-title">{{ post.title }}</h1>
                    <p>{{ post.content }}</p>
                </div>
            </div>
            <div class="comments-section">
                <h2>Comments</h2>
                <div class="add-comment">
                    <textarea v-model="newComment" placeholder="Add a comment..." class="comment-input" rows="3"></textarea>
                    <button @click="addComment" class="comment-button">Post Comment</button>
                </div>
                <div v-for="comment in comments" :key="comment.id" class="comment">
                    <comment-component :comment="comment" />
                </div>
            </div>
        </div>
    </div>
</template>



<script>
import { ref, onMounted, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import CommentComponent from "@/components/CommentComponent.vue";

export default {
    components: {
        CommentComponent,
    },
    props: ['id'],
    setup(props) {
        const store = useStore();
        const route = useRoute();
        const post = ref({});
        const newComment = ref('');
        const loading = ref(true);

        const comments = computed(() => store.state.postDetails.comments);

        const fetchPostDetails = async (postId) => {
            loading.value = true;
            post.value = await store.dispatch('fetchPostDetails', postId);
            // Fetch comments logic remains here or can also be moved to Vuex as per your use case
            loading.value = false;
        };

        onMounted(() => {
            fetchPostDetails(route.params.id);
        });

        watch(() => route.params.id, (newPostId) => {
            fetchPostDetails(newPostId);
        });
        
        const upvote = () => {
            post.value.votes++;
            // TODO: Update votes in Firestore
        };

        const downvote = () => {
            post.value.votes--;
            // TODO: Update votes in Firestore
        };
        const addComment = async () => {
            if (newComment.value.trim() !== '') {
                await store.dispatch('addComment', { postId: props.id, commentText: newComment.value.trim() });
                newComment.value = '';
            }
        };

        return { post, comments, newComment, loading, upvote, downvote, addComment };
    }
};
</script>
    

<style scoped>
.post-container {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
}

.post {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
    border-radius: 5px;
}

.post-content {
    margin-left: 20px;
}

.post-title {
    font-size: 1.75rem;
    margin-bottom: 10px;
}

.votes {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 72px;
}

.vote-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.vote-image {
    width: 24px;
    height: 24px;
}

.vote-number {
    width: 24px;
    height: 18px;
    text-align: center;
}
.comment-input {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
    width: 100%;
    margin-bottom: 10px;
}

.comment-button {
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

.comment-button:hover {
    background-color: #0056b3;
}

</style>