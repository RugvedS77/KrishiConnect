// src/api/forumApi.js
const API_BASE_URL = 'http://127.0.0.1:8000';

export const forumApi = {
  // Get all posts (with optional category and search)
  getPosts: async (category, query) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') {
      params.append('category', category);
    }
    if (query) {
      params.append('q', query);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/posts?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  // Get one post by its ID
  getPostById: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  // Create a new post (using FormData for the image)
  createPost: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      body: formData,
      // We don't set Content-Type; the browser does it for FormData
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  // Create a new reply
  createReply: async (postId, content, userId) => {
    // This endpoint expects form data, not JSON
    const formData = new FormData();
    formData.append('content', content);
    formData.append('user_id', userId);

    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/replies`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to add reply');
    return response.json();
  }
};