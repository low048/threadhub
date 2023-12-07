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
            <p><strong>{{ comment.author }}</strong>: <span v-html="comment.content"></span></p>
            <p class="comment-timestamp">Commented at: {{ comment.timestamp.toLocaleString() }}</p>
        </div>
        <div class="edit-delete-icons" v-if="isAuthor(comment.author)">
            <img src="@/assets/edit.png" alt="Edit Post" class="edit-icon" @click="editComment">
            <img src="@/assets/delete.png" alt="Delete Post" class="delete-icon" @click="deleteComment">
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
        isAuthor(commentAuthor) {
            console.log("commentAuthor: ", commentAuthor);
            const loggedInUser = this.$store.state.auth.user;
            return loggedInUser && loggedInUser.email === commentAuthor;
        },
        async editComment() {
            try {
                const editedContent = prompt("Edit your comment:", this.comment.content);
                if (editedContent !== null) {
                    await this.$store.dispatch('editComment', {
                        communityId: this.communityId,
                        postId: this.postId,
                        commentId: this.comment.id,
                        editedContent
                    });
                }
            } catch (error) {
                console.error("Error editing comment:", error);
            }
        },

        async deleteComment() {
            try {
                const confirmDelete = confirm("Are you sure you want to delete this comment?");
                if (confirmDelete) {
                await this.$store.dispatch('deleteComment', {
                    communityId: this.communityId,
                    postId: this.postId,
                    commentId: this.comment.id
                });
                }
            } catch (error) {
                console.error("Error deleting comment:", error);
            }
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
        }
    }
};
</script>

<style scoped>
.edit-delete-icons {
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: auto; /* Pushes the icons to the bottom */
  margin-left: auto;
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
}
.comment-box {
    background-color: var(--primary-color);
    border: 1px solid var(--border-color);
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
    border-radius: 5px;
}

.comment-content {
    margin-left: 20px;
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
    color: var(--secondary-text-color);
    font-size: 0.9rem;
    margin-top: 10px;
}
</style>
