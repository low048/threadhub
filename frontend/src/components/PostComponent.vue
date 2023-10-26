<template>
    <div class="post">
        <div class="votes">
            <button @click="upvote" class="vote-button">
                <img :src="userVote === 1 ? require('@/assets/upvote_clicked.png') : require('@/assets/upvote.png')"
                    alt="Upvote" class="vote-image">
            </button>
            <p class="vote-number">{{ post.votes }}</p>
            <button @click="downvote" class="vote-button">
                <img :src="userVote === -1 ? require('@/assets/downvote_clicked.png') : require('@/assets/downvote.png')"
                    alt="Downvote" class="vote-image">
            </button>
        </div>
        <div class="post-content">
            <h2>
                <router-link :to="{ name: 'PostDetail', params: { id: post.id } }" style="text-decoration: none;">{{
                    post.title }}</router-link>
            </h2>
            <p v-html="trimmedContent(post.content)"></p>
        </div>
    </div>
</template>
  
<script>
import { computed, watch, ref } from 'vue';
import { useStore } from 'vuex';
import { toast } from 'vue3-toastify';

export default {
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    setup(props, context) {
        const store = useStore();
        const isAuthenticated = computed(() => store.getters.isAuthenticated);
        const userVote = ref(props.post.userVote || 0);

        watch(() => props.post.userVote, (newValue) => {
            userVote.value = newValue || 0;
        });

        const vote = async (voteValue) => {
            if (store.state.auth.user) {
                const currentVote = userVote.value;
                let newVoteValue;

                if (currentVote === voteValue) {
                    newVoteValue = 0;
                } else {
                    newVoteValue = voteValue;
                }

                try {
                    context.emit('vote-changed', { postId: props.post.id, change: newVoteValue - currentVote });
                    await store.dispatch('vote', {
                        userId: store.state.auth.user.uid,
                        postId: props.post.id,
                        voteValue: newVoteValue,
                        previousVote: currentVote
                    });
                } catch (error) {
                    toast("Error during voting:" + error, { autoClose: 2000, type: 'error', position: 'bottom-right' });
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

        const trimmedContent = content => {
            const maxLength = 200;
            return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
        };

        return {
            upvote,
            downvote,
            trimmedContent,
            userVote,
            isAuthenticated
        };
    }
};
</script>
  

<style scoped>
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

h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

.router-link-exact-active {
    color: #007bff;
    text-decoration: none;
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
}</style>
