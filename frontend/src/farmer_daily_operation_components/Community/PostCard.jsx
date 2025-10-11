// // src/components/PostCard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../authStore';
import { forumApi } from '../../api/forumApi';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export function PostCard({ post, user }) {

  console.log(post,"----",user) 
  // --- ADD THIS DEBUGGING BLOCK ---
    console.log({
        message: "--- Debugging Reply Button ---",
        postTitle: post.title,
        isUserLoggedIn: !!user,
        loggedInUserId: user?.id,
        postAuthorId: post.author_id,
        isUserTheAuthor: user?.id === post.author_id,
        shouldShowReplyButton: !!user && user?.id !== post.author_id
    });

    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token);

    // This check determines if the "Reply" button should be shown.
    const canReply = user.id != post.author_id;

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        setError(null);
        try {
            // Calls the API function to create the new reply
            await forumApi.createReply(token, post.id, replyContent);
            
            // Reset the form on success
            setReplyContent('');
            setIsReplying(false);
            alert("Reply submitted successfully!");
            // In a real app, you might trigger a function here to refresh the post's reply count
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm border flex flex-col">
            {/* Main Post Content */}
            <div className="flex-grow">
                <Link to={`/farmer/os/community-hub/posts/${post.id}`}>
                    <h2 className="text-xl font-semibold text-blue-700 hover:underline cursor-pointer">{post.title}</h2>
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                    By {post.author.full_name} in <span className="font-medium">{post.category}</span>
                </p>
                {post.image_url && <img src={post.image_url} alt={post.title} className="mt-3 rounded-md max-h-60 w-full object-cover" />}
                {/* We can show a snippet of the content on the main page */}
                <p className="text-gray-700 mt-3 line-clamp-3">{post.content}</p>
            </div>
            
            {/* Footer with Reply Count and Action Button */}
            <div className="border-t mt-4 pt-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600">
                        <MessageSquare size={16} className="mr-2" />
                        <span className="text-sm">{post.reply_count} replies</span>
                    </div>

                    {/* --- NEW LOGIC --- */}
                    {/* Only show the reply button if the current user is NOT the author */}
                    {canReply && (
                        <button 
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                            {isReplying ? 'Cancel' : 'Reply'}
                        </button>
                    )}
                </div>

                {/* --- NEW: The Reply Form (shows when isReplying is true) --- */}
                {isReplying && canReply && (
                    <form onSubmit={handleReplySubmit} className="mt-4">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Replying to ${post.author_name}...`}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            rows="3"
                            required
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                        <div className="flex justify-end mt-2">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 w-32"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin"/> : <><Send size={14} className="mr-2"/> Post Reply</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}