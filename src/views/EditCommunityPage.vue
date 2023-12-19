<template>
    <div class="edit-community-container">
        <div class="edit-community">
            <h1 class="community-title">Edit Community</h1>
            <form @submit.prevent="editCommunity" class="edit-community-form">
                <span class="community-name">{{ 'c/' + communityId }}</span>
                <textarea v-model="description" placeholder="Community Description" required
                    class="community-input"></textarea>
                <button type="submit" class="edit-community-button">Save Changes</button>
            </form>
        </div>
    </div>
</template>
  
<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

export default {
    setup() {
        const store = useStore();
        const router = useRouter();
        const route = useRoute();
        const communityId = route.params.communityId;
        const description = ref('');

        onMounted(async () => {
            const community = store.getters['allCommunities'].find(c => c.id === communityId);
            if (community) {
                description.value = community.description;
            }
        });

        const editCommunity = async () => {
            await store.dispatch('editCommunity', { communityId, description: description.value });
            router.push({ name: 'CommunityPage', params: { communityId } });
        };

        return { communityId, description, editCommunity };
    }
};
</script>
  
<style scoped>
h1 {
    color: var(--primary-text-color);
}

.edit-community-container {
    max-width: 40vw;
    margin: 0 auto;
    padding: 20px;
}

.edit-community {
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

.edit-community-form {
    display: flex;
    flex-direction: column;
}

.community-name {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: var(--primary-text-color);
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

.edit-community-button {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    width: 30%;
}

.edit-community-button:hover {
    background-color: var(--secondary-color-hover);
    transition: background-color 0.3s ease;
}

@media (max-width: 768px){
  .edit-community-container{
    width: 100%;
    max-width: 100vw;
  }
  .edit-community-button{
    width: 40%;
  }
}
</style>
  