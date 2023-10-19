import { runTransaction, increment, collection, getDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  state: {
    postDetails: {
      id: null,
      title: '',
      content: '',
      votes: 0,
      author: '',
      comments: [],
      userVote: 0, // 1 for upvote, -1 for downvote, 0 for no vote
    },
    userVote: null,
  },
  mutations: {
    SET_POST_DETAILS(state, post) {
      state.postDetails = post;
    },
    ADD_COMMENT(state, comment) {
      state.postDetails.comments.push(comment);
    },
    UPDATE_VOTE_COUNT(state, { postId, newVoteCount }) {
      if (state.postDetails.id === postId) {
         state.postDetails = { ...state.postDetails, votes: newVoteCount };
      }
    },
    SET_USER_VOTE(state, voteValue) {
      state.postDetails.userVote = voteValue;
    },
  },
  actions: {
    async fetchPostDetails({ dispatch, commit, rootGetters }, postId) {
        // Check if post details are already in the state
        // Note: You might want to check if the comments are also fetched, not just the post details
        // ...
        console.log("postId from post.js:", postId);
        try {
            // Fetch post details from Firestore
            const postDocRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postDocRef);
            if (postDoc.exists()) {
                const post = { id: postDoc.id, ...postDoc.data(), comments: [] };
                // Fetch comments for the post
                const commentsColRef = collection(postDocRef, 'comments');
                const commentsSnapshot = await getDocs(commentsColRef);
                post.comments = commentsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        // Convert Firestore Timestamp to JavaScript Date object
                        timestamp: data.timestamp.toDate()
                    };
                });

                commit('SET_POST_DETAILS', post);
                // If the user is authenticated, fetch their vote for this post
                // Use rootGetters to access the user from the auth module
                const user = rootGetters.currentUser;
                if (user) {
                    dispatch('fetchUserVote', { userId: user.uid, postId });
                }
                return post;
            }
        } catch (error) {
            console.error("Error fetching post details:", error);
        }
        return null;
    },
    async vote({ state, commit }, { userId, postId, voteValue }) {
        try {
            const userVoteRef = doc(db, 'posts', postId, 'userVotes', userId);
            const postRef = doc(db, 'posts', postId);
            
            let previousVote = 0;
    
            await runTransaction(db, async (transaction) => {
              const userVoteDoc = await transaction.get(userVoteRef);
          
              // If the document exists and has a 'vote' field
              if (userVoteDoc.exists && userVoteDoc.data() && typeof userVoteDoc.data().vote !== 'undefined') {
                  previousVote = userVoteDoc.data().vote;
                  console.log("User Vote Doc Exists:", userVoteDoc.exists);
                  console.log("User Vote Data:", userVoteDoc.data());
                  console.log("Previous Vote Value:", previousVote);
                  console.log("New Vote Value:", voteValue);
  
              } else {
                  // Document doesn't exist or vote data is missing
                  previousVote = 0;
                  transaction.set(userVoteRef, { vote: 0 });
              }
          
              // Adjust post's vote count based on the difference
              const voteDifference = voteValue - previousVote;
              console.log("Vote Difference:", voteDifference);
  
              // Update the user's vote
              transaction.set(userVoteRef, { vote: voteValue }, { merge: true });
          
              // Update the post's vote count
              transaction.update(postRef, {
                  votes: increment(voteDifference)
              });
          });
  
        // Optimistically update local state
        commit('UPDATE_VOTE_COUNT', { postId: postId, newVoteCount: state.postDetails.votes + (voteValue - previousVote) });
        console.log("Updated Local Vote Count:", state.postDetails.votes + (voteValue - previousVote));
        
        return voteValue;  // Return the value that was set.
            
        } catch (error) {
            console.error("Error voting: ", error);
        }
    },
    async fetchTotalVotes({ commit }, postId) {
        try {
          const userVotesRef = collection(db, 'posts', postId, 'userVotes');
          const userVotesSnapshot = await getDocs(userVotesRef);
  
          let totalVotes = 0;
          userVotesSnapshot.forEach(doc => {
            totalVotes += doc.data().vote;
          });
  
          commit('SET_TOTAL_VOTES', { postId, totalVotes });
        } catch (error) {
          console.error("Error fetching total votes: ", error);
        }
      },
      async fetchUserVote({ commit }, { userId, postId }) {
        try {
            const userVoteRef = doc(db, 'posts', postId, 'userVotes', userId);
            const userVoteDoc = await getDoc(userVoteRef);
    
            if (userVoteDoc.exists() && userVoteDoc.data()) {
                const userVoteValue = userVoteDoc.data().vote || 0;
                commit('SET_USER_VOTE', userVoteValue);
                return userVoteValue;
            }
        } catch (error) {
            console.error("Error fetching user vote: ", error);
        }
        return null;
      },
  },
  getters: {
    getPostVotes: (state) => (postId) => {
      if (state.postDetails.id === postId) {
        return state.postDetails.votes;
      }
      return null;
    },
  },
};
