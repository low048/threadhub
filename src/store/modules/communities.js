import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  state: {
    communities: []
  },
  mutations: {
    SET_COMMUNITIES(state, communities) {
      console.log('Mutation SET_COMMUNITIES called', communities);
      state.communities = communities;
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
    }
  },
  getters: {
    allCommunities: state => {
      console.log("State in getter:", state.communities);
      return state.communities;
    }
  }
};