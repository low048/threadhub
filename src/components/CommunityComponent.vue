<template>
    <div :class="['community', { dark: darkMode }]" @click="navigateToCommunity">
        <h3>{{ "c/" + community.id }}</h3>
        <p class="description">{{ community.description }}</p>
    </div>
</template>

<script>
import store from '@/store';
import { useRouter } from 'vue-router';

export default {
    props: {
        community: {
            type: Object,
            required: true
        }
    },
    computed: {
        darkMode() {
            return store.getters.isDarkMode;
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
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}
.community:hover {
    background-color: #f5f5f5;
}
h3 {
    font-size: 1.2rem;
    margin-bottom: 15px;
}
.community.dark {
    background-color: #222;
    border-color: #333;
    color: #fff;
}
.community.dark:hover {
    background-color: #333;
    color: #eee;
}
</style>