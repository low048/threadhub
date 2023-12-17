<template>
    <div class="add-post-container">
        <div class="add-post">
            <h1 class="post-title">Add New Post in c/{{ communityId }}</h1>
            <form @submit.prevent="addPost" class="add-post-form">
                <input type="text" v-model="title" placeholder="Post Title" required class="post-input">
                <textarea v-model="content" placeholder="Post Content" required class="post-input" :style="{height: '30vh'}"></textarea>
                <label for="image-upload" class="image-upload-label">Upload image:</label>
                <input type="file" @change="handleImageUpload" accept="image/*" class="image-upload-input">
                <div v-if="imagePreview">
                  <img :src="imagePreview" class="image-preview">
                </div>
                <button type="submit" class="add-post-button">Add Post</button>
            </form>
        </div>
    </div>
</template>
  
<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { storage } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const title = ref('');
    const content = ref('');
    const communityId = ref(route.params.communityId);

    const imageFile = ref(null);
    const imagePreview = ref('');

    const handleImageUpload = event => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        imageFile.value = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    const uploadImage = async () => {
      if (!imageFile.value || !store.state.auth.user) return null;

      const userId = store.state.auth.user.uid; // Get the authenticated user's ID
      const storageReference = storageRef(storage, `users/${userId}/images/${Date.now()}-${imageFile.value.name}`);

      try {
        const snapshot = await uploadBytes(storageReference, imageFile.value);
        return await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Failed to upload image: ", error);
        return null;
      }
    };

    const addPost = async () => {
    let imageUrl = null;
    if (imageFile.value) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        console.error("Failed to upload image", { type: 'error' });
        return;
      }
    }

    const postData = {
      title: title.value,
      content: content.value,
      imageUrl: imageUrl // include the image URL
    };

    const postId = await store.dispatch('addPost', {
      postData, 
      communityId: communityId.value
    });

    title.value = '';
    content.value = '';

    if (postId) {
      router.push({ name: 'PostDetail', params: { id: postId, communityId: communityId.value } });
    } else {
      console.error("Failed to create post", { type: 'error' });
    }
  };


    return {
      title, 
      content, 
      addPost,
      communityId,
      imageFile,
      imagePreview,
      handleImageUpload,
      uploadImage,
    };
  }
};
</script>

  
<style scoped>
h1 {
  color: var(--primary-text-color);
}
.image-preview{
  max-width: 50%;
  margin-bottom: 10px;
}
.image-upload-input{
  color: var(--primary-text-color);
  margin-bottom: 10px;
}
.image-upload-label {
  color: var(--primary-text-color);
  margin-bottom: 10px; /* Space between label and input */
}
.add-post-container {
    max-width: 50vw;
    margin: 0 auto;
    padding: 20px;
}

.add-post {
    background-color: var(--primary-color);
    border: 1px solid var(--border-color);
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
    background-color: var(--primary-color-hover);
    border: 1px solid var(--border-color);
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    width: 100%;
    color: var(--primary-text-color);
}

.add-post-button {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    width: 20%;
    float: right;
}

.add-post-button:hover {
    background-color: var(--secondary-color-hover);
    transition: background-color 0.3s ease;
}
</style>