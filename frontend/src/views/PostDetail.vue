<template>
<div class="post-container">
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
            <h1 class="post-title">{{ post.title }}</h1>
            <p>{{ post.content }}</p>
        </div>
    </div>
    <div class="comments-section">
        <h2>Comments</h2>
        <div v-for="comment in comments" :key="comment.id" class="comment">
            <p><strong>{{ comment.username }}</strong>: {{ comment.text }}</p>
        </div>
        <div class="add-comment">
            <input v-model="newComment" placeholder="Add a comment..." />
            <button @click="addComment">Post Comment</button>
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: ['id'],
    data() {
        const posts = [{
                id: '1',
                title: 'Post 1',
                content: 'Content of post 1',
                votes: 0
            },
            {
                id: '2',
                title: 'Post 2',
                content: 'Content of post 2',
                votes: 0
            },
            // More posts...
        ];
        return {
            post: posts.find(p => p.id === this.id) || {},
            newComment: '',
            comments: [
                { id: 1, username: 'user1', text: 'Great post!' },
                { id: 2, username: 'user2', text: 'Thanks for sharing.' }
                // More comments...
            ]
        };
    },
    methods: {
        upvote() {
            this.post.votes++;
        },
        downvote() {
            this.post.votes--;
        },
        addComment() {
            if (this.newComment.trim() !== '') {
                this.comments.push({
                    id: this.comments.length + 1,
                    username: 'currentUser', // Replace with actual username
                    text: this.newComment.trim()
                });
                this.newComment = '';
            }
        }
    }
};
</script>

<style scoped>
.post-container {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
}

.post {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
    border-radius: 5px;
}

.post-content {
    margin-left: 20px;
}

.post-title {
    font-size: 1.75rem;
    margin-bottom: 10px;
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
