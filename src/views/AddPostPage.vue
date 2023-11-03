<template>
    <div class="add-post-container">
        <div class="add-post">
            <h1 class="post-title">Add New Post</h1>
            <form @submit.prevent="addPost" class="add-post-form">
                <input type="text" v-model="title" placeholder="Post Title" required class="post-input">
                <textarea v-model="content" placeholder="Post Content" required class="post-input"></textarea>
                <button type="submit" class="comment-button">Add Post</button>
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
        const title = ref('');
        const content = ref('');

        const addPost = async () => {
            const postId = await store.dispatch('addPost', {
                title: title.value,
                content: content.value
            });
            title.value = '';
            content.value = '';

            if (postId) {
                router.push({ name: 'PostDetail', params: { id: postId } });
            }
        };

        return { title, content, addPost };
    }
};
</script>
  
<style scoped>
.add-post-container {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
}

.add-post {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 5px;
}

.post-title {
    font-size: 1.75rem;
    margin-bottom: 10px;
}

.add-post-form {
    display: flex;
    flex-direction: column;
}

.post-input {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    width: 100%;
}

.comment-button {
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.comment-button:hover {
    background-color: #0056b3;
}
</style>