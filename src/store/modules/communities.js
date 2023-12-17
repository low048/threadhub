import { collection, getDocs, doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  state: {
    communities: []
  },
  mutations: {
    SET_COMMUNITIES(state, communities) {
      console.log('Mutation SET_COMMUNITIES called', communities);
      state.communities = communities;
    },
    ADD_COMMUNITY(state, community) {
      state.communities.push(community);
    }
  },
  actions: {
    async fetchCommunities({ commit }) {
      try {
        const querySnapshot = await getDocs(collection(db, 'communities'));
        const communities = [];
        querySnapshot.forEach((doc) => {
          communities.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched communities:", communities);
        commit('SET_COMMUNITIES', communities);
      } catch (error) {
        console.error("Error fetching communities: ", error);
      }
    },
    async addCommunity({ commit, rootState }, communityData) {
      try {
        // Extract the community name and remove it from the data to be saved
        const { name, ...dataWithoutName } = communityData;
    
        // Define the document reference with the community name as the ID
        const communityRef = doc(db, 'communities', name);
    
        // Add author (user email) and timestamp
        const user = rootState.auth.user; // Ensure the user is authenticated
        const communityInfo = {
          ...dataWithoutName, // Spread the remaining community data
          author: user.email, // Add the user's email as the author
          timestamp: serverTimestamp() // Use Firebase's serverTimestamp
        };
    
        // Write the community info to Firestore
        await setDoc(communityRef, communityInfo);
    
        // Prepare the community object for Vuex store, including the name as ID
        const newCommunity = { id: name, ...communityInfo };
        commit('ADD_COMMUNITY', newCommunity);
    
        return name; // Returning the community name as the ID
      } catch (error) {
        console.error("Error adding community:", error);
      }
    },
    async editCommunity({ commit }, { communityId, description }) {
      try {
        const communityRef = doc(db, 'communities', communityId);
        await updateDoc(communityRef, { description });
        commit('UPDATE_COMMUNITY', { communityId, description });
      } catch (error) {
        console.error("Error editing community:", error);
      }
    },
    async deleteCommunity({ commit }, { communityId }) {
      try {
        const communityRef = doc(db, 'communities', communityId);
        await deleteDoc(communityRef);
        commit('REMOVE_COMMUNITY', communityId);
      } catch (error) {
        console.error("Error deleting community:", error);
      }
    },
  },
  getters: {
    allCommunities: state => {
      console.log("State in getter:", state.communities);
      return state.communities;
    }
  }
};