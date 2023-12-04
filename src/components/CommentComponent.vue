<template>
    <div class="comment-box">
        <div class="votes">
            <button @click="upvoteComment" class="vote-button">
                <img :src="userVote === 1 ? require('@/assets/upvote_clicked.png') : require('@/assets/upvote.png')"
                    alt="Upvote" class="vote-image">
            </button>
            <p class="vote-number">{{ comment.votes }}</p>
            <button @click="downvoteComment" class="vote-button">
                <img :src="userVote === -1 ? require('@/assets/downvote_clicked.png') : require('@/assets/downvote.png')"
                    alt="Downvote" class="vote-image">
            </button>
        </div>
        <div class="comment-content">
            <p>
        <strong>{{ comment.author }}</strong>:
        <textarea v-if="isEditing" v-model="editedContent"></textarea>
        <span v-else v-html="comment.content"></span>
      </p>
      <p class="comment-timestamp">Commented at: {{ comment.timestamp.toLocaleString() }}</p>

      <button v-if="isAuthor" @click="toggleEditing" class="edit-button">
        {{ isEditing ? 'Save' : 'Edit' }}
      </button>
      
      <!-- Add a Cancel button to exit edit mode without saving -->
      <button v-if="isAuthor && isEditing" @click="cancelEdit" class="cancel-button">
        Cancel
      </button>
    </div>
  </div>
</template>

<script>
export default {
    props: ['comment', 'postId', 'communityId'],
    data() {
        return {
            userVote: null
        };
    },
    computed: {
        isAuthor() {
            // Check if the current user is the author of the comment
            const currentUser = this.$store.state.auth.user;
            return currentUser && this.comment.authorId === currentUser.uid;
        }
    },
    watch: {
        '$store.state.auth.user': {
            immediate: true,
            handler(newValue) {
                if (newValue) {
                    const userId = newValue.uid;
                    this.fetchUserVote(userId);
                }
            }
        }
    },
    computed: {
        isCommentAuthor() {
            return this.$store.state.auth.user && this.comment.author === this.$store.state.auth.user.email;
        },
    },
    methods: {
        async fetchUserVote(userId) {
            const vote = await this.$store.dispatch('fetchUserCommentVote', { userId, communityId: this.communityId, postId: this.postId, commentId: this.comment.id });
            this.userVote = vote;
        },
        upvoteComment() {
            this.voteComment(1);
        },
        downvoteComment() {
            this.voteComment(-1);
        },
        async voteComment(voteValue) {
            if (this.$store.state.auth.user) {
                const currentVote = this.userVote;
                let changeInVotes = 0;

                if (currentVote === voteValue) {
                    voteValue = 0;
                }
                if (currentVote === null) {
                    changeInVotes = voteValue;
                } else {
                    changeInVotes = voteValue - currentVote;
                }

                // Optimistically update the UI
                this.userVote = voteValue;
                this.$emit('vote-change', this.comment.id, changeInVotes);

                await this.$store.dispatch('voteOnComment', {
                    userId: this.$store.state.auth.user.uid,
                    communityId: this.communityId,
                    postId: this.postId,
                    commentId: this.comment.id,
                    voteValue
                });

                // If you want to be super sure, you can re-fetch the vote count here (but this may not be necessary if your backend ensures vote counts are correct)
                this.fetchUserVote(this.$store.state.auth.user.uid);
            } else {
                console.log("User not logged in");
            }
        },
        toggleEditing() {
            if (this.isEditing) {
                // Save the edited content and exit editing mode
                this.saveCommentEdit();
            } else {
                // Enter editing mode
                this.editedContent = this.comment.content;
            }
            this.isEditing = !this.isEditing;
        },
        saveCommentEdit() {
            // Dispatch the editComment action with updated content
            this.$store.dispatch('editComment', {
                postId: this.postId,
                commentId: this.comment.id,
                updatedContent: this.editedContent
            });

            this.comment.content = this.editedContent;
            this.isEditing = false;
        },
        cancelEdit() {
      this.isEditing = false;
      this.editedContent = this.comment.content;
        },
    },
};
</script>

<style scoped>
.comment-box {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
    border-radius: 5px;
}

.comment-content {
    margin-left: 20px;
}

.cancel-button {
  margin-left: 10px;
  cursor: pointer;
  color: #007BFF; /* Change color as needed */
  border: none;
  background: none;
}
.comment-author {
    font-size: 1rem;
    margin-bottom: 5px;
}

.comment-text {
    margin-bottom: 10px;
}

.comment-votes {
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

.comment-timestamp {
    color: #666;
    font-size: 0.9rem;
    margin-top: 10px;
}
</style>
