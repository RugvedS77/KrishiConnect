//  src/api/forumApi.js

import { API_BASE_URL } from './apiConfig';

export const forumApi = {
  // Get all posts (with optional category and search)
  getPosts: async (token, category = null, query = null) => {
    if (!token) throw new Error("No token provided");

    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (query) params.append('q', query);

    const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` } // <-- Always use JWT
    });

    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  // Get a single post by ID
  getPostById: async (token, postId) => {
    if (!token) throw new Error("No token provided");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  // Create a new post
  createPost: async (token, formData) => {
    if (!token) throw new Error("No token provided");

    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  // Create a new reply
  createReply: async (token, postId, content) => {
    if (!token) throw new Error("No token provided");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) throw new Error('Failed to add reply');
    return response.json();
  }
};
