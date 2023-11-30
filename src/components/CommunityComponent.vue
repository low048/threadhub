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
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    &:hover {
        background-color: #f5f5f5;
    }
}

h3 {
    font-size: 1.2rem;
    margin-bottom: 15px;
}

.author, .description, .timestamp {
    font-size: 0.9rem;
    color: #555;
}
</style>