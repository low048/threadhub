import { runTransaction, increment, collection, getDoc, getDocs, doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const findPostById = (state, postId) => {
  // Find the post in the postList
  return state.postList.find(p => p.id === postId);
};

export default {
  state: {
    postList: [],
  },
  mutations: {
    SET_POSTS(state, newPosts) {
      newPosts.forEach(newPost => {
        const existingPostIndex = state.postList.findIndex(post => post.id === newPost.id);
        if (existingPostIndex !== -1) {
          // Update existing post
          state.postList[existingPostIndex] = newPost;
        } else {
          // Add new post
          state.postList.push(newPost);
        }
      });
    },
    ADD_COMMENT(state, comment) {
      const post = findPostById(state, comment.postId);
      if (post) {
        if (!post.comments) {
          post.comments = [];
        }
        post.comments = [...post.comments, comment];
      }
    },    
    EDIT_COMMENT(state, { commentId, editedContent }) {
      state.postList.forEach(post => {
        const commentIndex = post.comments.findIndex(comment => comment.id === commentId);
        if (commentIndex !== -1) {
          post.comments[commentIndex].content = editedContent;
        }
      });
    },
    DELETE_COMMENT(state, commentId) {
      state.postList.forEach(post => {
        const commentIndex = post.comments.findIndex(comment => comment.id === commentId);
        if (commentIndex !== -1) {
          post.comments.splice(commentIndex, 1);
        }
      });
    },
    UPDATE_VOTE_COUNT(state, { postId, newVoteCount }) {
      const post = findPostById(state, postId);
      if (post) post.votes = newVoteCount;
    },
    SET_USER_VOTE(state, { postId, voteValue }) {
      const post = findPostById(state, postId);
      if (post) post.userVote = voteValue;
    },
    ADD_POST(state, post) {
      //check this later
      if (post.votes === undefined) post.votes = 0;
      if (post.timestamp === undefined) post.timestamp = new Date();
      state.postList.unshift(post);
    },
    EDIT_POST(state, { postId, editedContent }) {
      const postIndex = state.postList.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        state.postList[postIndex].content = editedContent;
      }
    },
    DELETE_POST(state, postId) {
      const postIndex = state.postList.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        state.postList.splice(postIndex, 1);
      }
    },
  },
  actions: {
    async fetchFeaturedPosts({ dispatch, commit, state }) {
      try {
        const featuredPostsPaths = [
            'communities/ChatGPT/post/E19h9FeAkaSXp0ityGc8',
            'communities/explainlikeimfive/post/5QFlpxS3D1i406rMzIXk',
            'communities/lithuania/post/XO7FWcS9PlfpXZAWidd2',
            'communities/ChoosingBeggars/post/6kerGzzjjIxwO9y6tlmJ',
            'communities/lithuania/post/VLTOpOPWQycJODdI5Cns',
            'communities/explainlikeimfive/post/le0Xoyon3fs6ilgPPXyN',
            'communities/ChoosingBeggars/post/5UYYHUORFy3zJ95XgVYG',
        ];

        const fetchPostPromises = featuredPostsPaths.map(path => {
          const pathSegments = path.split('/');
          return dispatch('fetchSinglePost', { communityId: { value: pathSegments[1] }, postId: pathSegments[3] });
        });
    
        const results = await Promise.allSettled(fetchPostPromises);
    
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const postId = featuredPostsPaths[index].split('/')[3];
            const featuredPost = findPostById(state, postId);
            if (featuredPost) {
              const updatedPost = { ...featuredPost, isFeatured: true };
              commit('SET_POSTS', [updatedPost]);
            }
          } else {
            console.error('Error fetching post:', result.reason);
          }
        });
      } catch (error) {
        console.error("Error in fetchFeaturedPosts: ", error);
      }
    },  
    async fetchSinglePost({ commit, rootState, dispatch }, { communityId, postId }) {
      try {
        const postRef = doc(db, `communities/${communityId.value}/posts`, postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          let post = { id: postDoc.id, communityId: communityId.value, ...postDoc.data(), comments: [] };
          post.timestamp = post.timestamp.toDate();
          const commentsColRef = collection(postRef, 'comments');
          const commentsSnapshot = await getDocs(commentsColRef);

          post.comments = commentsSnapshot.docs.map(commentDoc => {
            const data = commentDoc.data();
            return { ...data, id: commentDoc.id, timestamp: data.timestamp.toDate() };
          });
          commit('SET_POSTS', [post]);
          if (rootState.auth.user) {
            const userId = rootState.auth.user.uid;
            const userVoteValue = await dispatch('fetchUserVote', { userId, postId });
            post.userVote = userVoteValue;
            commit('SET_POSTS', [post]);
          }
        }
      } catch (error) {
        console.error("Error fetching single post:", error);
      }
    },
    async fetchPosts({ commit, rootState, dispatch }, communityId) {
      try {
        const postsColRef = collection(db, `communities/${communityId.value}/posts`);
        const querySnapshot = await getDocs(postsColRef);
        
        const postsPromises = querySnapshot.docs.map(doc => {
          const postRef = doc.ref;
          const commentsColRef = collection(postRef, 'comments');
          return getDocs(commentsColRef).then(commentsSnapshot => {
            const post = {
              id: doc.id,
              communityId: communityId.value,
              ...doc.data(),
              comments: commentsSnapshot.docs.map(commentDoc => {
                const data = commentDoc.data();
                return { ...data, id: commentDoc.id, timestamp: data.timestamp.toDate() };
              }),
              timestamp: doc.data().timestamp.toDate()
            };
            return post;
          });
        });
    
        const results = await Promise.allSettled(postsPromises);
    
        const resolvedPosts = results.filter(result => result.status === 'fulfilled').map(result => result.value);
    
        commit('SET_POSTS', resolvedPosts);
    
        if (rootState.auth.user) {
          const userId = rootState.auth.user.uid;
          const userVotePromises = resolvedPosts.map(post => {
            if (post.id) {
              return dispatch('fetchUserVote', { userId, postId: post.id }).then(userVoteValue => {
                post.userVote = userVoteValue;
                return post;
              });
            }
            return Promise.resolve(post);
          });
    
          const voteResults = await Promise.allSettled(userVotePromises);
          const postsWithVotes = voteResults.filter(result => result.status === 'fulfilled').map(result => result.value);
          
          commit('SET_POSTS', postsWithVotes);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    },
    async fetchUserVote({ state, commit }, { userId, postId }) {
      try {
        const post = findPostById(state, postId);
        if (post && post.communityId) {
          const userVoteRef = doc(db, `communities/${post.communityId}/posts`, postId, 'userVotes', userId);
          const userVoteDoc = await getDoc(userVoteRef);

          if (userVoteDoc.exists() && userVoteDoc.data()) {
            const userVote = userVoteDoc.data().vote || 0;
            commit('SET_USER_VOTE', { postId: postId, voteValue: userVote });
            return userVote;
          }
        } else {
          console.error("Post not found in state or missing communityId", post);
        }
      } catch (error) {
        console.error("Error fetching user vote: ", error);
      }
      return null;
    },
    async vote({ state, commit }, { userId, postId, voteValue, previousVote }) {
      try {
        const post = findPostById(state, postId)
        if (post) {
          const updatedVoteCount = post.votes + (voteValue - previousVote);
          commit('UPDATE_VOTE_COUNT', { postId: postId, newVoteCount: updatedVoteCount });
        }
        const userVoteRef = doc(db, `communities/${post.communityId}/posts`, postId, 'userVotes', userId);
        const postRef = doc(db, `communities/${post.communityId}/posts`, postId);
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
    async addPost({ commit, rootState, rootGetters }, { postData, communityId }) {
      try {
        const user = rootGetters.currentUser || rootState.auth.user;
        postData.author = user.email;

        if (postData.content) {
          postData.content = postData.content.replace(/\n/g, '<br>');
        }

        const postsColRef = collection(db, `communities/${communityId}/posts`); //communityId.value if it's passed as a ref, yet to be decided
        const newPostRef = doc(postsColRef);
        await setDoc(newPostRef, {
          ...postData,
          votes: 0,
          timestamp: serverTimestamp()
        });
        commit('ADD_POST', { ...postData, id: newPostRef.id, communityId: communityId }); //communityId.value if it's passed as a ref, yet to be decided
        return newPostRef.id;
      }
      catch (error) {
        console.error("Error adding new post:", error);
      }
    },
    async editPost({ commit }, { communityId, postId, editedContent }) {
      try {
        const postRef = doc(db, 'communities', communityId, 'posts', postId);
        await updateDoc(postRef, { content: editedContent, timestamp: serverTimestamp() });
        commit('EDIT_POST', { postId, editedContent });
      } catch (error) {
        console.error("Error editing post:", error);
      }
    },
    async deletePost({ commit }, { communityId, postId }) {
      try {
        const postRef = doc(db, 'communities', communityId, 'posts', postId);
        await deleteDoc(postRef);
        commit('DELETE_POST', postId);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  },
  getters: {
    getPostVotes: (state) => (postId) => {
      const post = findPostById(state, postId);
      return post ? post.votes : null;
    },
    getFeaturedPosts: state => state.featuredPosts,
  },
};
