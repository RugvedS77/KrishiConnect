// src/components/NewPostForm.jsx (Corrected)

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../authStore';
import { forumApi } from '../../api/forumApi';
import { Loader2, AlertCircle, MessageSquare } from 'lucide-react';

export default function NewPostForm({ categories, onPostCreated, onCancel }) {
  const token = useAuthStore((state) => state.token);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !category) return setError('All fields are required.');
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      if (image) formData.append('image', image);

      await forumApi.createPost(token, formData);
      onPostCreated(); // Notify parent
      setTitle('');
      setContent('');
      setCategory(categories[0] || '');
      setImage(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md bg-white shadow-sm space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Content</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Category</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Image (optional)</label>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      </div>
      <div className="flex gap-2">
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {loading ? 'Posting...' : 'Create Post'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="bg-gray-300 px-4 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}