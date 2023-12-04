import { runTransaction, increment, collection, getDoc, serverTimestamp, addDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { deleteDoc } from 'firebase/firestore';


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
    UPDATE_COMMENT_VOTE_COUNT(state, { commentId, newVoteCount }) {
      if (state.commentDetails.id === commentId) {
        state.commentDetails = { ...state.commentDetails, votes: newVoteCount };
      }
    },
    SET_USER_COMMENT_VOTE(state, voteValue) {
      state.commentDetails.userVote = voteValue;
    },
    UPDATE_COMMENT(state, updatedComment) {
      if (state.commentDetails.id === updatedComment.id) {
        state.commentDetails = { ...state.commentDetails, ...updatedComment };
      }
    },
  },
  actions: {
    async addComment({ commit, dispatch, rootState, rootGetters }, { communityId, postId, commentText }) {
      try {
        const commentWithLineBreaks = commentText.replace(/\n/g, '<br>');
        const user = rootGetters.currentUser || rootState.auth.user;
        const commentsColRef = collection(db, 'communities', communityId, 'posts', postId, 'comments');
        const newCommentRef = await addDoc(commentsColRef, {
          author: user.email,
          content: commentWithLineBreaks,
          votes: 0,
          timestamp: serverTimestamp(),
        });
        const newCommentId = newCommentRef.id;
        const newComment = {
          id: newCommentId,
          postId: postId,
          author: user.email,
          content: commentWithLineBreaks,
          votes: 0,
          timestamp: new Date(),
        };
        commit('ADD_COMMENT', newComment);
        dispatch('fetchUserCommentVote', { userId: user.uid, communityId: communityId, postId: postId, commentId: newCommentId });
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },
    async fetchUserCommentVote({ commit }, { userId, communityId, postId, commentId }) {
      console.log('fetchUserCommentVote params:', { userId, communityId, postId, commentId });
      try {
        const userVoteRef = doc(db, 'communities', communityId, 'posts', postId, 'comments', commentId, 'userVotes', userId);
        const userVoteDoc = await getDoc(userVoteRef);
        if (userVoteDoc.exists() && userVoteDoc.data()) {
          const userVote = userVoteDoc.data().vote || 0;
          commit('SET_USER_COMMENT_VOTE', userVote);
          return userVote;
        }
      } catch (error) {
        console.error("Error fetching user comment vote: ", error);
      }
      return 0;
    },
    async voteOnComment({ state, commit }, { userId, communityId, postId, commentId, voteValue }) {
      try {
        const userVoteRef = doc(db, 'communities', communityId, 'posts', postId, 'comments', commentId, 'userVotes', userId);
        const commentRef = doc(db, 'communities', communityId, 'posts', postId, 'comments', commentId);
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
          transaction.update(commentRef, { votes: increment(voteDifference) });
        });
        commit('UPDATE_COMMENT_VOTE_COUNT', { commentId: commentId, newVoteCount: state.commentDetails.votes + (voteValue - previousVote) });
        return voteValue;
      } catch (error) {
        console.error("Error voting on comment: ", error);
      }
    },
    async editComment({ state, commit, dispatch }, { postId, commentId, updatedContent }) {
      try {
        const commentRef = doc(db, 'posts', postId, 'comments', commentId);

        // Fetch the existing comment data
        const commentDoc = await getDoc(commentRef);

        if (commentDoc.exists() && commentDoc.data()) {
          const previousCommentDetails = {
            id: commentDoc.id,
            postId: postId, // Include postId here
            author: commentDoc.data().author,
            content: commentDoc.data().content,
            votes: commentDoc.data().votes,
            timestamp: commentDoc.data().timestamp.toDate(),
          };

          // Update the comment content in the database
          await updateDoc(commentRef, {
            content: updatedContent,
            timestamp: serverTimestamp(), // Update the timestamp to reflect the edit
          });

          // Construct the updated comment details
          const updatedCommentDetails = {
            ...previousCommentDetails,
            content: updatedContent,
            timestamp: new Date(), // Update the timestamp in the local state
          };

          // Update the comment details in the local state using the mutation
          commit('UPDATE_COMMENT', updatedCommentDetails);

          // If necessary, fetch the user's updated vote after the edit
          dispatch('fetchUserCommentVote', { userId: state.auth.user.uid, postId, commentId });

          // You can also dispatch other actions or perform additional logic as needed

          console.log(`Comment ${commentId} edited successfully!`);
        } else {
          console.error(`Comment ${commentId} not found.`);
        }

      } catch (error) {
        console.error("Error editing comment:", error);
      }
    },
  },
};
