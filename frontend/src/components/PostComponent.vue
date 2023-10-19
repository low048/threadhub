<template>
    <div class="post">
        <div class="votes">
            <button @click="upvote" class="vote-button">
                <img :src="userVoteValue === 1 ? require('@/assets/upvote_clicked.png') : require('@/assets/upvote.png')" alt="Upvote" class="vote-image">
            </button>
            <p class="vote-number">{{ post.votes }}</p>
            <button @click="downvote" class="vote-button">
                <img :src="userVoteValue === -1 ? require('@/assets/downvote_clicked.png') : require('@/assets/downvote.png')" alt="Downvote" class="vote-image">
            </button>
        </div>
        <div class="post-content">
            <h2>
                <router-link :to="{ name: 'PostDetail', params: { id: post.id } }" style="text-decoration: none;">
                    {{ post.title }}
                </router-link>
            </h2>
            <p v-html="trimmedContent(post.content)"></p>
        </div>
    </div>
</template>


<script>
export default {
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            userVoteValue: null  // A local data property to store the fetched user vote
        };
    },
    watch: {
        // Watch the user state from Vuex
        '$store.state.auth.user': {
            immediate: true,  // Run this watcher immediately when the component is created
            handler(newValue) {
                if (newValue) {
                    const userId = newValue.uid;
                    this.fetchUserVote(userId);  // Fetch the user's vote when the user data changes
                }
            }
        }
    },
    methods: {
        async fetchUserVote(userId) {
            // Fetch the user vote and store it in the local data property
            const vote = await this.$store.dispatch('fetchUserVote', { userId, postId: this.post.id });
            this.userVoteValue = vote;
        },
        upvote() {
            this.vote(1);
        },
        downvote() {
            this.vote(-1);
        },
        async vote(voteValue) {
            if (this.$store.state.auth.user) {
                const currentVote = this.userVoteValue;
                if (currentVote === voteValue) {
                    // If the user clicks on the same vote button again, reset the vote to 0
                    voteValue = 0;
                }

                // Optimistically update UI
                this.userVoteValue = voteValue;

                // Dispatch vote action
                await this.$store.dispatch('vote', {
                    userId: this.$store.state.auth.user.uid,
                    postId: this.post.id,
                    voteValue
                });

                // Re-fetch the user's vote after the vote action completes
                this.fetchUserVote(this.$store.state.auth.user.uid);
            } else {
                console.log("User not logged in");
                // Handle unauthenticated user, e.g., show a login prompt
            }
        },
        trimmedContent(content) {
            const maxLength = 200; // Maximum number of characters to display
            if (content.length > maxLength) {
                return content.substring(0, maxLength) + '...'; // Add ellipsis when content is too long
            } else {
                return content;
            }
        }
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
}
</style>
