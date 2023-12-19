import { runTransaction, increment, collection, getDoc, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
    ADD_POST(state, post) {
      //check this later
      if (post.votes === undefined) post.votes = 0;
      if (post.timestamp === undefined) post.timestamp = new Date();
      state.postList.unshift(post);
    },
  },
  actions: {
    async fetchFeaturedPosts({ dispatch, commit, state }) {
      try {
          console.log("fetchFeaturedPosts called");
          const featuredPostsPaths = [
              'communities/explainlikeimfive/post/5QFlpxS3D1i406rMzIXk',
              'communities/lithuania/post/XO7FWcS9PlfpXZAWidd2',
              'communities/ChoosingBeggars/post/6kerGzzjjIxwO9y6tlmJ',
              'communities/explainlikeimfive/post/le0Xoyon3fs6ilgPPXyN',
          ];
  
          for (const path of featuredPostsPaths) {
              const pathSegments = path.split('/');
              const communityId = pathSegments[1];
              const postId = pathSegments[3];
  
              if (communityId && postId) {
                  await dispatch('fetchSinglePost', { communityId: { value: communityId }, postId: postId });
  
                  // Set the isFeatured property after fetching
                  const featuredPost = findPostById(state, postId);
                  if (featuredPost) {
                      const updatedPost = { ...featuredPost, isFeatured: true };
                      commit('SET_POSTS', [updatedPost]); // Use SET_POSTS to update the post
                  }
              }
          }
      } catch (error) {
          console.error("Error in fetchFeaturedPosts: ", error);
      }
    },     
    async fetchSinglePost({ commit, rootState, dispatch }, { communityId, postId }) {
      try {
        console.log("trying to fetch single post");
        const postRef = doc(db, `communities/${communityId.value}/posts`, postId);
        const postDoc = await getDoc(postRef);
        console.log("fetched single post", `communities/${communityId.value}/posts`, postId);
        if (postDoc.exists()) {
          let post = { id: postDoc.id, communityId: communityId.value, ...postDoc.data(), comments: [] };
          post.timestamp = post.timestamp.toDate();
          const commentsColRef = collection(postRef, 'comments');
          const commentsSnapshot = await getDocs(commentsColRef);

          post.comments = commentsSnapshot.docs.map(commentDoc => {
            const data = commentDoc.data();
            return { ...data, id: commentDoc.id, timestamp: data.timestamp.toDate() };
          });
          console.log("set single post");
          commit('SET_POSTS', [post]);
          console.log("set posts in fetchSinglePost");
          if (rootState.auth.user) {
            const userId = rootState.auth.user.uid;
            const userVoteValue = await dispatch('fetchUserVote', { userId, postId });
            post.userVote = userVoteValue;
            console.log("setting uservote to", userVoteValue, "in fetchSinglePost");
            commit('SET_POSTS', [post]);
          }
        }
      } catch (error) {
        console.error("Error fetching single post:", error);
      }
    },
    async fetchPosts({ commit, rootState, dispatch }, communityId) {
      try {
        console.log("fetching posts for", communityId.value);
        const postsColRef = collection(db, `communities/${communityId.value}/posts`);
        const querySnapshot = await getDocs(postsColRef);
        const posts = querySnapshot.docs.map(doc => {
          const post = { id: doc.id, communityId: communityId.value, ...doc.data(), comments: [] };
          const commentsColRef = collection(doc.ref, 'comments');
          return getDocs(commentsColRef).then(commentsSnapshot => {
            post.comments = commentsSnapshot.docs.map(commentDoc => {
              const data = commentDoc.data();
              return { ...data, id: commentDoc.id, timestamp: data.timestamp.toDate() };
            });
            post.timestamp = post.timestamp.toDate();
            return post;
          });
        });
        const resolvedPosts = await Promise.all(posts);
        commit('SET_POSTS', resolvedPosts);
        console.log("set posts in fetchPosts");
        if (rootState.auth.user) {
          const userId = rootState.auth.user.uid;
          for (let post of resolvedPosts) {
            if (post.id && userId) {
              const userVoteValue = await dispatch('fetchUserVote', { userId, postId: post.id });
              post.userVote = userVoteValue;
              console.log("setting uservote to", userVoteValue, "in fetchPosts");
            }
          }
          commit('SET_POSTS', resolvedPosts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    },
    async fetchUserVote({ state, commit }, { userId, postId }) {
      try {
        // Find the post in the state
        const post = findPostById(state, postId);
        console.log('Post found:', post);
        console.log('Current state.postList:', state.postList);
        // Check if the post is found and has a communityId
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

        const postsColRef = collection(db, `communities/${communityId}/posts`); //communityId.value if it's passed as a ref, yet to be decided
        const newPostRef = doc(postsColRef);
        await setDoc(newPostRef, {
          ...postData,
          votes: 0,
          timestamp: serverTimestamp()
        });
        commit('ADD_POST', { ...postData, id: newPostRef.id, communityId: communityId }); //communityId.value if it's passed as a ref, yet to be decided
        console.log("New post added with ID:", newPostRef.id);
        return newPostRef.id;
      }
      catch (error) {
        console.error("Error adding new post:", error);
      }
    },
  },
  getters: {
    getPostVotes: (state) => (postId) => {
      const post = findPostById(state, postId);
      return post ? post.votes : null;
    },
    getFeaturedPosts: state => state.featuredPosts,
  },
};