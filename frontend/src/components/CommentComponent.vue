<template>
    <div class="comment-box">
        <div class="votes">
            <button @click="upvoteComment" class="vote-button">
                <img src="@/assets/upvote.png" alt="Upvote" class="vote-image">
            </button>
            <p class="vote-number">{{ comment.votes }}</p>
            <button @click="downvoteComment" class="vote-button">
                <img src="@/assets/downvote.png" alt="Downvote" class="vote-image">
            </button>
        </div>
        <div class="comment-content">
            <p><strong>{{ comment.author }}</strong>: <span v-html="comment.content"></span></p>
            <p class="comment-timestamp">Commented at: {{ comment.timestamp.toLocaleString() }}</p>
        </div>
    </div>
</template>

<script>
export default {
    props: ['comment'],
    methods: {
        upvoteComment() {
            // TODO: Implement upvote logic for comment
        },
        downvoteComment() {
            // TODO: Implement downvote logic for comment
        }
    }
};
</script>

<style scoped>
.comment-box {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
    border-radius: 5px;
}

.comment-content {
    margin-left: 20px;
}

.comment-author {
    font-size: 1rem;
    margin-bottom: 5px;
}

.comment-text {
    margin-bottom: 10px;
}

.comment-votes {
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
