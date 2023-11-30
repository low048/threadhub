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
  },
};
