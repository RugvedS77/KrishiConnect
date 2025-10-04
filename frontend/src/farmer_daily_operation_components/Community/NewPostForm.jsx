// src/components/NewPostForm.jsx
import React, { useState } from 'react';
import { forumApi } from '../../api/forumApi';

export function NewPostForm({ currentUser, categories, onPostCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 1. Create FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('user_id', currentUser.id);
    if (image) {
      formData.append('image', image);
    }

    // 2. Call the API
    try {
      await forumApi.createPost(formData);
      onPostCreated(); // Tell the parent page to refresh
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-lg border">
      <h3 className="text-xl font-semibold mb-3">Create a New Post</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          rows="4"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Upload Image (Optional)</label>
        <input 
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex gap-2">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400"
        >
          {isSubmitting ? 'Posting...' : 'Submit Post'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}