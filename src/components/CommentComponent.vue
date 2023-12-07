<template>
  <div class="comment-box">
    <div class="votes">
      <button @click="upvoteComment" class="vote-button">
        <img
          :src="userVoteValue === 1 ? require('@/assets/upvote_clicked.png') : require('@/assets/upvote.png')"
          alt="Upvote"
          class="vote-image"
        />
      </button>
      <p class="vote-number">{{ comment.votes }}</p>
      <button @click="downvoteComment" class="vote-button">
        <img
          :src="userVoteValue === -1 ? require('@/assets/downvote_clicked.png') : require('@/assets/downvote.png')"
          alt="Downvote"
          class="vote-image"
        />
      </button>
    </div>
    <div class="comment-content">
      <p>
        <strong>{{ comment.author }}</strong>:
        <textarea v-if="isEditing" v-model="editedContent"></textarea>
        <span v-else v-html="comment.content"></span>
      </p>
      <p class="comment-timestamp">
        Commented at: {{ comment.timestamp.toLocaleString() }}
      </p>

      <!-- Render the Edit button only if the user is the author and not editing -->
      <button v-if="isAuthor && !isEditing" @click="toggleEditing" class="edit-button">
        Edit
      </button>

      <!-- Render the Save button only if the user is the author and is editing -->
      <button v-if="isAuthor && isEditing" @click="saveCommentEdit" class="edit-button">
        Save
      </button>

      <!-- Add a Cancel button to exit edit mode without saving -->
      <button v-if="isAuthor && isEditing" @click="cancelEdit" class="edit-button">
        Cancel
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['comment', 'postId'], // Add postId to props
  data() {
    return {
      userVoteValue: null,
      isEditing: false,
      editedContent: null,
    };
  },
  computed: {
    isAuthor() {
      // Check if the current user is the author of the comment
      const currentUser = this.$store.state.auth.user;
      return currentUser && this.comment.authorId === currentUser.uid;
    },
  },
  watch: {
    '$store.state.auth.user': {
      immediate: true,
      handler(newValue) {
        console.log('Current user:', newValue);
        console.log('Comment authorId:', this.comment.authorId);
        if (newValue) {
          const userId = newValue.uid;
          this.fetchUserVote(userId);
          console.log('isAuthor:', this.isAuthor);
        }
      },
    },
  },
  methods: {
    async fetchUserVote(userId) {
      const vote = await this.$store.dispatch('fetchUserCommentVote', {
        userId,
        postId: this.postId,
        commentId: this.comment.id,
      });
      this.userVoteValue = vote;
    },
    upvoteComment() {
      this.voteComment(1);
    },
    downvoteComment() {
      this.voteComment(-1);
    },
    async voteComment(voteValue) {
      if (this.$store.state.auth.user) {
        const currentVote = this.userVoteValue;
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
        this.userVoteValue = voteValue;
        this.$emit('vote-change', this.comment.id, changeInVotes);

        await this.$store.dispatch('voteOnComment', {
          userId: this.$store.state.auth.user.uid,
          postId: this.postId,
          commentId: this.comment.id,
          voteValue,
        });

        // If you want to be super sure, you can re-fetch the vote count here (but this may not be necessary if your backend ensures vote counts are correct)
        this.fetchUserVote(this.$store.state.auth.user.uid);
      } else {
        console.log('User not logged in');
      }
    },
    async toggleEditing() {
      console.log('toggleEditing called. isEditing:', this.isEditing);
      if (this.isAuthor) {
        if (this.isEditing) {
          await this.saveCommentEdit();
        } else {
          this.editedContent = this.comment.content;
        }
        this.isEditing = !this.isEditing;
      } else {
        console.warn('User is not the author and cannot edit this comment.');
      }
    },

    async saveCommentEdit() {
  if (this.isAuthor) {
    try {
      await this.$store.dispatch('editComment', {
        postId: this.postId,
        commentId: this.comment.id,
        updatedContent: this.editedContent,
      });
      const updatedComment = { ...this.comment, content: this.editedContent };
      this.$emit('comment-edited', {
        commentId: this.comment.id,
        updatedContent: this.editedContent,
        updatedComment,
      });
      console.log(`Comment ${this.comment.id} edited successfully!`);
      this.isEditing = false; // Move this line to here
    } catch (error) {
      console.error('Error editing comment:', error);
      // Handle the error, such as displaying a message to the user
    }
  } else {
    console.warn('User is not the author and cannot edit this comment.');
      }
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
