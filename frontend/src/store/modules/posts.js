import { runTransaction, increment, collection, getDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '@/firebase';

const findPostById = (state, postId) => state.postList.find(p => p.id === postId);


export default {
  state: {
    postList: [],
  },
  mutations: {
    SET_POSTS(state, posts) {
      state.postList = posts;
    },
    ADD_COMMENT(state, comment) {
        console.log("Adding comment: ", comment);
        const post = findPostById(state, comment.postId);
        console.log(post);
        if (post) {
            post.comments = [...post.comments, comment];
            console.log("post.comments = [...post.comments, comment]");
        }
    },  
    UPDATE_VOTE_COUNT(state, { postId, newVoteCount }) {
      const post = findPostById(state, postId);
      if (post) post.votes = newVoteCount;
    },
    SET_USER_VOTE(state, { postId, voteValue }) {
      const post = findPostById(state, postId);
      if (post) post.userVote = voteValue;
    },
  },
  actions: {
      async fetchSinglePost({ commit }, postId) {
        try {
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);

            if (postDoc.exists()) {
                let post = { id: postDoc.id, ...postDoc.data(), comments: [] };
                const commentsColRef = collection(postRef, 'comments');
                const commentsSnapshot = await getDocs(commentsColRef);

                post.comments = commentsSnapshot.docs.map(commentDoc => {
                    const data = commentDoc.data();
                    return { ...data, id: commentDoc.id, timestamp: data.timestamp.toDate() };
                });

                commit('SET_POSTS', [post]); // Add the single post to the list
            }
        } catch (error) {
            console.error("Error fetching single post:", error);
        }
    },
    async fetchPosts({ commit, rootState, dispatch }) {
      try {
        const postsCol = collection(db, 'posts');
        const querySnapshot = await getDocs(postsCol);
        const posts = querySnapshot.docs.map(doc => {
          const post = { id: doc.id, ...doc.data(), comments: [] };
          const commentsColRef = collection(doc.ref, 'comments');
          return getDocs(commentsColRef).then(commentsSnapshot => {
            post.comments = commentsSnapshot.docs.map(commentDoc => {
              const data = commentDoc.data();
              return { ...data, id: commentDoc.id, timestamp: data.timestamp.toDate() };
            });
            return post;
          });
        });
        const resolvedPosts = await Promise.all(posts);
        if (rootState.auth.user) {
          const userId = rootState.auth.user.uid;
          for (let post of resolvedPosts) {
            if (post.id && userId) {
              const userVote = await dispatch('fetchUserVote', { userId, postId: post.id });
              post.userVote = userVote;
            }
          }
        }
        commit('SET_POSTS', resolvedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    },    
    async vote({ state, commit }, { userId, postId, voteValue, previousVote }) {
      try {

        console.log("currentVote", voteValue);
        console.log("previousVote", previousVote);

        const post = state.postList.find(p => p.id === postId);
        if (post) {
          const updatedVoteCount = post.votes + (voteValue - previousVote);
          console.log("updatedVoteCount", updatedVoteCount);
          commit('UPDATE_VOTE_COUNT', { postId: postId, newVoteCount: updatedVoteCount });
        }

        const userVoteRef = doc(db, 'posts', postId, 'userVotes', userId);
        const postRef = doc(db, 'posts', postId);

        await runTransaction(db, async (transaction) => {
          const userVoteDoc = await transaction.get(userVoteRef);

          if (userVoteDoc.exists && userVoteDoc.data() && typeof userVoteDoc.data().vote !== 'undefined') {
            // If the document exists and has a 'vote' field
            previousVote = userVoteDoc.data().vote;
          } else {
            // Document doesn't exist or vote data is missing
            previousVote = 0;
            transaction.set(userVoteRef, { vote: 0 });
          }

          // Adjust post's vote count based on the difference
          const voteDifference = voteValue - previousVote;

          // Update the user's vote
          transaction.set(userVoteRef, { vote: voteValue }, { merge: true });

          // Update the post's vote count
          transaction.update(postRef, {
            votes: increment(voteDifference)
          });
        });

        commit('SET_USER_VOTE', { postId: postId, voteValue: voteValue });


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

        commit('UPDATE_VOTE_COUNT', { postId, totalVotes });
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
          commit('SET_USER_VOTE', { postId: postId, voteValue: userVoteValue });
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
      const post = findPostById(state, postId);
      return post ? post.votes : null;
    },
  },
};
