import { runTransaction, increment, collection, getDoc, serverTimestamp, addDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  state: {
    commentDetails: {
      id: null,
      content: '',
      votes: 0,
      author: '',
      userVote: 0,
    },
  },
  mutations: {
    SET_COMMENT_DETAILS(state, comment) {
      state.commentDetails = comment;
    },
    UPDATE_COMMENT_VOTE_COUNT(state, { commentId, newVoteCount }) {
      if (state.commentDetails.id === commentId) {
        state.commentDetails = { ...state.commentDetails, votes: newVoteCount };
      }
    },
    SET_USER_COMMENT_VOTE(state, voteValue) {
      state.commentDetails.userVote = voteValue;
    },
  },
  actions: {
    async addComment({ commit, dispatch, rootState, rootGetters }, { postId, commentText }) {
      try {
        const commentWithLineBreaks = commentText.replace(/\n/g, '<br>'); // Replace new lines with <br> tags

        // Use rootState or rootGetters here
        const user = rootGetters.currentUser || rootState.auth.user;

        const newCommentRef = await addDoc(collection(db, 'posts', postId, 'comments'), {
          author: user.email,
          content: commentWithLineBreaks,
          votes: 0,
          timestamp: serverTimestamp(),
        });

        // Obtain the ID of the newly created comment
        const newCommentId = newCommentRef.id;

        // Add the new comment to the local state
        const newComment = {
            id: newCommentId,
            postId: postId, // Include postId here
            author: user.email,
            content: commentWithLineBreaks,
            votes: 0,
            timestamp: new Date(),
        };
        commit('ADD_COMMENT', newComment);

        // After adding the new comment, fetch the user vote for that comment
        dispatch('fetchUserCommentVote', { userId: user.uid, postId: postId, commentId: newCommentId });

      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },
    async fetchUserCommentVote({ commit }, { userId, postId, commentId }) {
      try {
        console.log("postId:", postId);
        console.log("commentId:", commentId);
        console.log("userId:", userId);
        const userVoteRef = doc(db, 'posts', postId, 'comments', commentId, 'userVotes', userId);

        const userVoteDoc = await getDoc(userVoteRef);

        if (userVoteDoc.exists() && userVoteDoc.data()) {
          const userVoteValue = userVoteDoc.data().vote || 0;
          commit('SET_USER_COMMENT_VOTE', userVoteValue);
          return userVoteValue;
        }
      } catch (error) {
        console.error("Error fetching user comment vote: ", error);
      }
      return 0;
    },
    async voteOnComment({ state, commit }, { userId, postId, commentId, voteValue }) {
      try {
        const userVoteRef = doc(db, 'posts', postId, 'comments', commentId, 'userVotes', userId);
        const commentRef = doc(db, 'posts', postId, 'comments', commentId);

        let previousVote = 0;

        await runTransaction(db, async (transaction) => {
          const userVoteDoc = await transaction.get(userVoteRef);

          if (userVoteDoc.exists && userVoteDoc.data() && typeof userVoteDoc.data().vote !== 'undefined') {
            previousVote = userVoteDoc.data().vote;
          } else {
            previousVote = 0;
            transaction.set(userVoteRef, { vote: 0 });
          }

          const voteDifference = voteValue - previousVote;
          transaction.set(userVoteRef, { vote: voteValue }, { merge: true });
          transaction.update(commentRef, {
            votes: increment(voteDifference)
          });
        });

        commit('UPDATE_COMMENT_VOTE_COUNT', { commentId: commentId, newVoteCount: state.commentDetails.votes + (voteValue - previousVote) });
        return voteValue;

      } catch (error) {
        console.error("Error voting on comment: ", error);
      }
    },
  },
};
