import { createStore } from 'vuex';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, getDocs, addDoc, collection, serverTimestamp } from 'firebase/firestore'; // Importing Firestore methods
import { db } from '@/firebase'; // Importing your Firestore instance

const auth = getAuth();

export default createStore({
  state: {
    user: null,
    error: null, // Added to store potential error messages
    postDetails: {
        id: null,
        title: '',
        content: '',
        votes: 0,
        author:'',
        comments: [],
    },
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_POST_DETAILS(state, post) {
      state.postDetails = post;
    },
    ADD_COMMENT(state, comment) {
        state.postDetails.comments.push(comment);
    },
  },
  actions: {
    async signUp({ commit }, { email, password }) {
      console.log("Vuex action: signUp called with:", email, password);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User signed up:", userCredential.user);
        commit('SET_USER', userCredential.user);
        commit('SET_ERROR', null); // Clear any previous errors
      } catch (error) {
        console.error("There was an error signing up: ", error);
        commit('SET_ERROR', error.message || 'An error occurred during signup.'); // Store error message to state
      }
    },
    async login({ commit }, { email, password }) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        commit('SET_USER', userCredential.user);
        commit('SET_ERROR', null); // Clear any previous errors
      } catch (error) {
        console.error("There was an error logging in: ", error);
        commit('SET_ERROR', error.message || 'An error occurred during login.'); // Store error message to state
      }
    },
    async logout({ commit }) {
      try {
        await signOut(auth);
        commit('SET_USER', null);
      } catch (error) {
        console.error("There was an error logging out: ", error);
        // Handle logout error, e.g., show a notification to the user
      }
    },
    async fetchPostDetails({ commit }, postId) {
        // Check if post details are already in the state
        // Note: You might want to check if the comments are also fetched, not just the post details
        // ...

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
                return post;
            }
        } catch (error) {
            console.error("Error fetching post details:", error);
        }
        return null;
    },
    
    async addComment({ commit }, { postId, commentText }) {
        try {
          const commentWithLineBreaks = commentText.replace(/\n/g, '<br>'); // Replace new lines with <br> tags
          await addDoc(collection(db, 'posts', postId, 'comments'), {
            author: 'currentUser',
            content: commentWithLineBreaks,
            votes: 0,
            timestamp: serverTimestamp(),
          });
          // Add the new comment to the local state
          const newComment = {
            author: 'currentUser',
            content: commentWithLineBreaks,
            votes: 0,
            timestamp: new Date(),
          };
          commit('ADD_COMMENT', newComment);
        } catch (error) {
          console.error("Error adding comment:", error);
        }
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.user;
    },
    error(state) {
      return state.error;
    },
  },
});
