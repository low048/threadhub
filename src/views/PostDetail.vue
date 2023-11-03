<template>
    <div class="post-container">
        <div class="loading-post" v-if="loading">Loading post...</div>
        <div v-else>
            <div class="post">
                <div class="votes">
                    <button @click="upvote" class="vote-button">
                        <img :src="userVoteValue === 1 ? require('@/assets/upvote_clicked.png') : require('@/assets/upvote.png')"
                            alt="Upvote" class="vote-image">
                    </button>
                    <p class="vote-number">{{ post.votes }}</p>
                    <button @click="downvote" class="vote-button">
                        <img :src="userVoteValue === -1 ? require('@/assets/downvote_clicked.png') : require('@/assets/downvote.png')"
                            alt="Downvote" class="vote-image">
                    </button>
                </div>
                <div class="post-content">
                    <h1 class="post-title">{{ post.title }}</h1>
                    <p v-html="post.content"></p>
                    <div v-if="post.timestamp">
                        <p class="author-timestamp">by u/{{ post.author }} at {{ post.timestamp.toLocaleString() }}</p>
                    </div>
                </div>
            </div>
            <div class="comments-section">
                <h2>Comments</h2>
                <div class="add-comment" v-if="isAuthenticated">
                    <textarea v-model="newComment" placeholder="Add a comment..." class="comment-input" rows="3"></textarea>
                    <button @click="addComment" class="comment-button">Post Comment</button>
                </div>
                <div v-else>
                    <p>You must be logged in to post a comment.</p>
                </div>
                <div v-for="comment in comments" :key="comment.id" class="comment">
                    <comment-component :comment="comment" :postId="post.id" @vote-change="handleCommentVoteChange" />
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
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
    components: {
        CommentComponent,
    },
    props: ['id'],
    setup(props) {
        const store = useStore();
        const route = useRoute();
        onMounted(() => {
            const postId = route.params.id;
            if (store.state.posts.postList.length === 0 || !store.state.posts.postList.find(p => p.id === postId)) {
                store.dispatch('fetchSinglePost', postId);
            }
            if (store.state.auth.user) {
                fetchUserVote(store.state.auth.user.uid, postId);
            }
        });
        const post = computed(() => {
            return store.state.posts.postList.find(p => p.id === route.params.id) || {};
        });
        const newComment = ref('');
        const loading = ref(false);
        const isAuthenticated = computed(() => store.getters.isAuthenticated);
        const comments = computed(() => {
            if (!post.value || !post.value.comments) {
                return [];
            }
            return [...post.value.comments].sort((a, b) => b.votes - a.votes);
        });
        const userVoteValue = ref(post.value.userVote !== undefined ? post.value.userVote : 0);

        const fetchUserVote = async (userId, postId) => {
            if (!postId) return;
            const vote = await store.dispatch('fetchUserVote', { userId, postId });
            userVoteValue.value = vote !== null ? vote : 0;
        };

        const handleCommentVoteChange = (commentId, changeInVotes) => {
            const targetComment = comments.value.find(c => c.id === commentId);
            if (targetComment) {
                targetComment.votes += changeInVotes;
            }
        };

        watch(() => route.params.id, (newPostId) => {
            if (store.state.auth.user) {
                fetchUserVote(store.state.auth.user.uid, newPostId);
            }
        });

        watch(() => store.state.auth.user, newValue => {
            if (newValue && post.value.id) {
                fetchUserVote(newValue.uid, post.value.id);
            }
        }, { immediate: true });

        watch(userVoteValue, (newValue) => {
            console.log("User vote value changed to:", newValue);
        });

        const vote = async (voteValue) => {
            if (store.state.auth.user) {
                const currentVote = userVoteValue.value;
                let newVoteValue;
                if (currentVote === voteValue) {
                    newVoteValue = 0;
                } else {
                    newVoteValue = voteValue;
                }
                userVoteValue.value = newVoteValue;
                try {
                    await store.dispatch('vote', {
                        userId: store.state.auth.user.uid,
                        postId: post.value.id,
                        voteValue: newVoteValue,
                        previousVote: currentVote
                    });
                } catch (error) {
                    userVoteValue.value = currentVote;
                    toast("Error while updating vote", { autoClose: 2000, type: 'error', position: 'bottom-right' });
                }
            } else {
                toast("User not logged in", { autoClose: 2000, type: 'error', position: 'bottom-right' });
            }
        };

        const upvote = () => {
            vote(1);
        };

        const downvote = () => {
            vote(-1);
        };

        const addComment = async () => {
            if (newComment.value.trim() !== '') {
                await store.dispatch('addComment', { postId: props.id, commentText: newComment.value.trim() });
                newComment.value = '';
            }
        };

        return {
            post,
            isAuthenticated,
            comments,
            newComment,
            loading,
            userVoteValue,
            upvote,
            downvote,
            addComment,
            handleCommentVoteChange
        };
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

.loading-post {
    text-align: center;
}

.author-timestamp {
    color: #666;
    font-size: 0.9rem;
    margin-top: 10px;
}
</style>