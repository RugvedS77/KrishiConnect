// src/components/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you use react-router

const API_BASE_URL = 'http://127.0.0.1:8000';

export function PostCard({ post }) {
  const imageUrl = post.image_url ? `${API_BASE_URL}${post.image_url}` : null;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex transition-all duration-300 hover:shadow-xl">
      {/* Image Thumbnail */}
      {imageUrl && (
        <div className="w-1/3">
          <img src={imageUrl} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}
      
      {/* Post Content */}
      <div className={`p-4 flex flex-col ${imageUrl ? 'w-2/3' : 'w-full'}`}>
        <span className="text-xs font-semibold uppercase text-blue-500">{post.category}</span>
        <Link to={`/community/post/${post.id}`}>
          <h3 className="text-lg font-bold text-gray-800 hover:text-blue-700">{post.title}</h3>
        </Link>
        
        <div className="flex-grow"></div> {/* Pushes content to bottom */}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <img 
              src={`${API_BASE_URL}${post.author_avatar}`} 
              alt={post.author_name} 
              className="w-6 h-6 rounded-full" 
            />
            <span className="text-sm text-gray-600">{post.author_name}</span>
          </div>
          <span className="text-sm text-gray-500">{post.reply_count} replies</span>
        </div>
      </div>
    </div>
  );
}