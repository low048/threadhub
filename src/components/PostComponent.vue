<template>
    <div class="post" @click="navigateToPost">
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
            <p class="community-name" v-if="showCommunityId">c/{{ post.communityId }}</p>
            <h2>{{ post.title }}</h2>
            <p v-html="trimmedContent(post.content)"></p>
        </div>
    </div>
</template>
  
<script>
import { computed, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { toast } from 'vue3-toastify';

export default {
    props: {
        post: { type: Object, required: true },
        showCommunityId: { type: Boolean, default: false }
    },
    setup(props, context) {
        const store = useStore();
        const router = useRouter();
        const isAuthenticated = computed(() => store.getters.isAuthenticated);
        const userVote = ref(props.post.userVote || 0);

        watch(() => props.post.userVote, (newValue) => {
            userVote.value = newValue || 0;
        });

        const navigateToPost = () => {
            router.push({ name: 'PostDetail', params: { communityId: props.post.communityId, id: props.post.id } });
        };


        const vote = async (voteValue) => {

            if (store.state.auth.user) {
                const currentVote = userVote.value;
                let newVoteValue;

                if (currentVote === voteValue) {
                    newVoteValue = 0;
                } else {
                    newVoteValue = voteValue;
                }
                userVote.value = newVoteValue;
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
            event.stopPropagation();
            vote(1);
        };

        const downvote = () => {
            event.stopPropagation();
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
            isAuthenticated,
            navigateToPost,
        };
    }
};
</script>
  

<style scoped>
.post {
    background-color: var(--primary-color);
    border: 1px solid var(--border-color);
    filter: invert(--invert-value);
    padding: 20px;
    padding-bottom: 30px;
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
    border-radius: 5px;
    cursor: pointer;
}

.post:hover {
    background-color: var(--primary-color-hover);
    transition: background-color 0.2s ease;
}

.community-name{
    padding: 0px;
    margin-bottom: 5px;
}

.post-content {
    margin-left: 20px;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: var(--primary-text-color);
}

p {
    color: var(--primary-text-color);
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
</style>
