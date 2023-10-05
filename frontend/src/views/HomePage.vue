<template>
<div id="app">
    <post-component v-for="post in posts" :key="post.id" :post="post" @upvote="upvotePost" @downvote="downvotePost"></post-component>
</div>
</template>

  
<script>
import PostComponent from '@/components/PostComponent.vue';

export default {
    components: {
        PostComponent
    },
    data() {
        return {
            posts: [{
                    id: 1,
                    title: 'Post 1',
                    content: 'This is the first post',
                    votes: 0
                },
                {
                    id: 2,
                    title: 'Post 2',
                    content: 'This is the second post',
                    votes: 0
                },
                // Add more posts as needed
            ]
        };
    },
    methods: {
        upvotePost(postId) {
            const post = this.posts.find(p => p.id === postId);
            if (post) post.votes++;
        },
        downvotePost(postId) {
            const post = this.posts.find(p => p.id === postId);
            if (post) post.votes--;
        }
    }
};
</script>

<style scoped>
#app {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
}
</style>
