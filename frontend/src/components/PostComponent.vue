<template>
<div class="post">
    <div class="votes">
        <button @click="upvote" class="vote-button">
            <img src="@/assets/upvote.png" alt="Upvote" class="vote-image">
        </button>
        <p class="vote-number">{{ post.votes }}</p>
        <button @click="downvote" class="vote-button">
            <img src="@/assets/downvote.png" alt="Downvote" class="vote-image">
        </button>
    </div>
    <div class="post-content">
        <h2>
            <router-link :to="{ name: 'PostDetail', params: { id: post.id.toString() } }">
                {{ post.title }}
            </router-link>
        </h2>
        <p>{{ post.content }}</p>
    </div>
</div>
</template>

    
<script>
export default {
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    methods: {
        upvote() {
            this.$emit('upvote', this.post.id);
        },
        downvote() {
            this.$emit('downvote', this.post.id);
        }
    }
};
</script>

    
<style scoped>
.post {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: start;
}

.post-content {
    margin-left: 20px;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

.router-link-exact-active {
    color: #007bff;
    text-decoration: none;
}

.votes {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 72px;
}

.vote-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.vote-image {
    width: 24px;
    height: 24px;
}

.vote-number {
    width: 24px;
    height: 18px;
    text-align: center;
}
</style>
