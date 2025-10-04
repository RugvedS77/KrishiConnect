// src/pages/ForumPage.jsx
import React, { useState, useEffect } from 'react';
import { forumApi } from '../api/forumApi'
import { useAuthStore } from '../authStore';
import { PostCard } from '../farmer_daily_operation_components/Community/PostCard' 
import { NewPostForm } from '../farmer_daily_operation_components/Community/NewPostForm'; 

const CATEGORIES = ['All', 'Crop Diseases & Pests', 'Equipment & Machinery', 'Government Schemes'];

export function CommunityPage() {
  const { currentUser } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  
  // State for filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const query = searchTerm.length > 2 ? searchTerm : '';
      const data = await forumApi.getPosts(activeCategory, query);
      setPosts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch posts on load, or when filters change
  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header: Title and Search */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Community Forum</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Search</button>
        </form>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`py-2 px-4 rounded-full text-sm font-medium ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* New Post Button & Form */}
      <div className="mb-4">
        {currentUser && !showNewPostForm && (
          <button 
            onClick={() => setShowNewPostForm(true)}
            className="bg-green-600 text-white font-bold py-2 px-5 rounded-md"
          >
            Create New Post
          </button>
        )}
        {currentUser && showNewPostForm && (
          <NewPostForm 
            currentUser={currentUser} 
            categories={CATEGORIES.filter(c => c !== 'All')}
            onPostCreated={() => {
              setShowNewPostForm(false);
              fetchPosts(); // Refresh the list
            }}
            onCancel={() => setShowNewPostForm(false)}
          />
        )}
      </div>

      {/* Posts List */}
      {isLoading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="col-span-2 text-gray-500">No posts found.</p>
          )}
        </div>
      )}
    </div>
  );
}