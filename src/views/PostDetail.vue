<template>
    <div class="spinner-container" v-if="loading">
        <div class="spinner-border" role="status"></div>
    </div>
    <div v-else class="content-container">
        <button @click="goToCommunityPage" class="back-to-community-button" v-if="!loading">Back to c/{{ communityId }}</button>
        <div class="post-container">
            <div>
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
                        <img v-if="post.imageUrl" :src="post.imageUrl" class="post-image">
                        <div v-if="post.timestamp">
                            <p class="author-timestamp">by u/{{ post.author }} at {{ post.timestamp.toLocaleString() }}</p>
                        </div>
                    </div>
                    <div class="edit-delete-icons" v-if="isAuthor(post.author)">
                        <img src="@/assets/edit.png" alt="Edit Post" class="edit-icon" @click="editPost">
                        <img src="@/assets/delete.png" alt="Delete Post" class="delete-icon" @click="deletePost">
                    </div>
                </div>
                <div class="comments-section">
                    <h2>Comments</h2>
                    <div class="add-comment" v-if="isAuthenticated">
                        <textarea v-model="newComment" placeholder="Add a comment..." class="comment-input"
                            rows="3"></textarea>
                        <button @click="addComment" class="comment-button">Post Comment</button>
                    </div>
                    <div v-else>
                        <p>You must be logged in to post a comment.</p>
                    </div>
                    <div v-for="comment in comments" :key="comment.id" class="comment">
                        <comment-component v-if="communityId" :comment="comment" :postId="post.id"
                            :communityId="communityId" @vote-change="handleCommentVoteChange" />
                    </div>
                </div>
            </div>
        </div>
        <div class="ghost-element"></div>
    </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
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
        const router = useRouter();
        const route = useRoute();
        const communityId = ref(route.params.communityId);
        onMounted(async () => {
            console.log("Community ID:", communityId.value);
            const postId = route.params.id;
            if (store.state.posts.postList.length === 0 || !store.state.posts.postList.find(p => p.id === postId)) {
                await store.dispatch('fetchSinglePost', { communityId: communityId, postId });
                console.log("fetched single post from postdetails");
            }
            loading.value = false;
        });

        const post = computed(() => {
            return store.state.posts.postList.find(p => p.id === route.params.id) || {};
        });

        const newComment = ref('');
        const loading = ref(true);
        const isAuthenticated = computed(() => store.getters.isAuthenticated);
        const comments = computed(() => {
            if (!post.value || !post.value.comments) {
                return [];
            }
            return [...post.value.comments].sort((a, b) => b.votes - a.votes);
        });

        const userVoteValue = ref(0);

        watch(() => post.value.userVote, (newVote) => {
            userVoteValue.value = newVote !== undefined ? newVote : 0;
        }, { immediate: true });

        watch(() => post.value.comments, (newComments) => {
            console.log("new comments:", newComments);
        }, { immediate: true });

        const handleCommentVoteChange = (commentId, changeInVotes) => {
            const targetComment = comments.value.find(c => c.id === commentId);
            if (targetComment) {
                targetComment.votes += changeInVotes;
            }
        };

        const vote = async (voteValue) => {
            if (store.state.auth.user) {
                if (post.value.userVote === undefined) post.value.userVote = 0;
                const currentVote = post.value.userVote;
                let newVoteValue;

                if (currentVote === voteValue) {
                    newVoteValue = 0;
                } else {
                    newVoteValue = voteValue;
                }
                // Update the post's userVote directly
                post.value.userVote = newVoteValue;
                try {
                    await store.dispatch('vote', {
                        userId: store.state.auth.user.uid,
                        postId: post.value.id,
                        voteValue: newVoteValue,
                        previousVote: currentVote
                    });
                } catch (error) {
                    // Revert the vote on error
                    post.value.userVote = currentVote;
                    toast("Error while updating vote", {
                        autoClose: 2000,
                        type: 'error',
                        position: 'bottom-right'
                    });
                }
            } else {
                toast("User not logged in", {
                    autoClose: 2000,
                    type: 'error',
                    position: 'bottom-right'
                });
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
                await store.dispatch('addComment', { postId: props.id, communityId: communityId.value, commentText: newComment.value.trim() });
                newComment.value = '';
            }
        };

        const isAuthor = (postAuthor) => {
            const loggedInUser = store.state.auth.user;
            return loggedInUser && loggedInUser.email === postAuthor;
        };

        const editPost = async () => {
            try {
                const editedContent = prompt("Edit your post:", post.value.content);
                if (editedContent !== null) {
                    await store.dispatch('editPost', {
                        communityId: communityId.value,
                        postId: post.value.id,
                        editedContent
                    });
                }
            } catch (error) {
                console.error("Error editing post:", error);
            }
        };

        const deletePost = async () => {
            try {
                const confirmDelete = confirm("Are you sure you want to delete this post?");
                if (confirmDelete) {
                    await store.dispatch('deletePost', {
                        communityId: communityId.value,
                        postId: post.value.id
                    });
                    router.push({ name: 'Home' }); // Replace 'Home' with your home route name
                }
            } catch (error) {
                console.error("Error deleting post:", error);
            }
        };

        const goToCommunityPage = () => {
            router.push({ name: 'CommunityPage', params: { communityId: communityId.value } });
        };

        return {
            post,
            communityId,
            isAuthenticated,
            comments,
            newComment,
            loading,
            userVoteValue,
            upvote,
            downvote,
            addComment,
            handleCommentVoteChange,
            isAuthor,
            editPost,
            deletePost,
            goToCommunityPage
        };
    }
};
</script>

<style scoped>
@media (max-width: 768px) {
    .back-to-community-button {
        display: none;
    }

    .content-container .post-container {
        max-width: 100vw;
        padding: 0px;
    }
}

.post-image {
    max-width: 100%;
    max-height: 90vh;
}

.content-container {
    display: flex;
    justify-content: center;
    /* Centers the post-container */
    align-items: flex-start;
    flex-wrap: wrap;
    /* Allows items to wrap if needed */
    opacity: 0;
    animation: fade-in-animation 0.1s ease-in forwards;
}

.ghost-element {
    width: 150px;
    /* Adjust this to match the button's width */
    visibility: hidden;
    /* Make the element invisible */
}

.back-to-community-button {
    margin-right: 0px;
    /* Adjusts the right margin to move it closer to the post-container */
    margin-top: 20px;
    order: -1;
    /* Places the button before the post-container */
    background-color: var(--primary-color);
    color: var(--primary-text-color);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    position: -webkit-sticky;
    position: sticky;
    top: 10px;
    z-index: 10;
}

.back-to-community-button:hover {
    background-color: var(--primary-color-hover);
    transition: background-color 0.3s ease;
}

@keyframes fade-in-animation {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

p,
h1,
h2 {
    color: var(--primary-text-color);
}

h2 {
    margin-top: 30px;
}

.post-container {
    max-width: 50vw;
    padding: 20px;
    margin-left: 10px;
    flex-grow: 1;
}

.post {
    background-color: var(--primary-color);
    border: 1px solid var(--border-color);
    padding: 20px;
    padding-right: 50px;
    display: flex;
    align-items: flex-start;
    border-radius: 5px;
    position: relative;
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
    border: 1px solid var(--border-color);
    background-color: var(--primary-color);
    color: var(--primary-text-color);
    padding: 10px;
    border-radius: 5px;
    width: 100%;
    margin-bottom: 10px;
}

.comment-button {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 10px;
}

.comment-button:hover {
    background-color: var(--secondary-color-hover);
    transition: background-color 0.3s ease;
}

.loading-post {
    text-align: center;
}

.author-timestamp {
    color: var(--secondary-text-color);
    font-size: 0.9rem;
    margin-top: 10px;
}

.spinner-container {
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70vh;
    width: 100%;
}

.edit-delete-icons {
    position: absolute;
    bottom: 10px;
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

p {
    color: var(--primary-text-color);
}</style>