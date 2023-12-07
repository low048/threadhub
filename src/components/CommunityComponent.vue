<template>
    <div class="community" @click="navigateToCommunity">
        <h3>{{ "c/" + community.id }}</h3>
        <p class="description">{{ community.description }}</p>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
    props: {
        community: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const router = useRouter();
        const navigateToCommunity = () => {
            console.log(props.community.id);
            router.push({ name: 'CommunityPage', params: { communityId: props.community.id } });
        };
        return { navigateToCommunity };
    }
};
</script>

<style scoped>
.community {
    border: 1px solid var(--border-color);
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 5px;
    cursor: pointer;
    background-color: var(--primary-color);
}
.community:hover {
    background-color: var(--primary-color-hover);
    transition: background-color 0.2s ease;
}
h3 {
  color: var(--primary-text-color);
  font-size: 1.2rem;
  margin-bottom: 15px;
}

p {
  color: var(--secondary-text-color);
}
</style>