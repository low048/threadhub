<template>
    <div class="add-community-container">
      <div class="add-community">
        <h1 class="community-title">Create New Community</h1>
        <form @submit.prevent="addCommunity" class="add-community-form">
          <input type="text" v-model="name" placeholder="Community Name" required class="community-input">
          <textarea v-model="description" placeholder="Community Description" required class="community-input"></textarea>
          <button type="submit" class="add-community-button">Create Community</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const store = useStore();
      const router = useRouter();
      const name = ref('');
      const description = ref('');
  
      const addCommunity = async () => {
        const communityData = { name: name.value, description: description.value };
        const communityId = await store.dispatch('addCommunity', communityData);
        name.value = '';
        description.value = '';
        if (communityId) {
          router.push({ name: 'CommunityPage', params: { communityId } });
        }
      };
  
      return { name, description, addCommunity };
    }
  };
  </script>
  
  <style scoped>
 h1 {
  color: var(--primary-text-color);
}
.add-community-container {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
}

.add-community {
    background-color: var(--primary-color);
    border: 1px solid var(--border-color);
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 5px;
}

.community-title {
    font-size: 1.75rem;
    margin-bottom: 10px;
}

.add-community-form {
    display: flex;
    flex-direction: column;
}

.community-input {
    background-color: var(--primary-color-hover);
    border: 1px solid var(--border-color);
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    width: 100%;
    color: var(--primary-text-color);
}

.add-community-button {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    width: 30%;
    float: right;
}

.add-community-button:hover {
    background-color: var(--secondary-color-hover);
    transition: background-color 0.3s ease;
}
  </style>
  