// // src/api/forumApi.js

// const API_BASE_URL = 'http://localhost:8000';

// export const forumApi = {
//   // Get all posts (with optional category and search)
//   getPosts: async (token, category, query) => {
//     const params = new URLSearchParams();
//     if (category && category !== 'All') {
//       params.append('category', category);
//     }
//     if (query) {
//       params.append('q', query);
//     }
    
//     const response = await fetch(`${API_BASE_URL}/api/forum/posts?${params.toString()}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     console.log("Token is available! Value:", token);
//     if (!response.ok) throw new Error('Failed to fetch posts');
//     return response.json();
//   },

//   // Get one post by its ID
//   getPostById: async (token, postId) => {
//     const response = await fetch(`${API_BASE_URL}/api/forum/posts/${postId}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     console.log("Token is available! Value:", token);
//     if (!response.ok) throw new Error('Failed to fetch post');
//     return response.json();
//   },

//   // Create a new post (using FormData for the image)
//   createPost: async (token, formData) => {
//     const response = await fetch(`${API_BASE_URL}/api/forum/posts`, {
//       method: 'POST',
//       body: formData,
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     if (!response.ok) throw new Error('Failed to create post');
//     return response.json();
//   },

//   // Create a new reply
//   createReply: async (token, postId, content) => {
//     // We updated the backend to accept JSON for this, which is simpler.
//     const response = await fetch(`${API_BASE_URL}/api/forum/posts/${postId}/replies`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({ content: content }),
//     });
//     if (!response.ok) throw new Error('Failed to add reply');
//     return response.json();
//   }
// };


const API_BASE_URL = 'http://localhost:8000/api/forum';

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
