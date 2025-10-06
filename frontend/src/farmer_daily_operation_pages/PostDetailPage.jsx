// src/farmer_daily_operation_pages/PostDetailPage.jsx (New File)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../authStore';
import { forumApi } from '../api/forumApi';
import { Loader2, AlertCircle, Send, ArrowLeft } from 'lucide-react';

// A simple component to display a single reply
const ReplyCard = ({ reply }) => (
    <div className="p-4 bg-gray-50 border-t">
        <p className="text-sm text-gray-700">{reply.content}</p>
        <p className="text-xs text-gray-500 mt-2">
            by <span className="font-semibold">{reply.author.full_name}</span> on {new Date(reply.created_at).toLocaleDateString()}
        </p>
    </div>
);

// A form for submitting a new reply
const ReplyForm = ({ postId, onReplySuccess }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = useAuthStore((state) => state.token);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await forumApi.createReply(token, postId, content);
            console.log(response)
            setContent('');
            onReplySuccess(); // Tell the parent to refresh
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 border-t pt-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                required
            />
            <div className="flex justify-end mt-2">
                <button type="submit" disabled={isSubmitting} className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
                    {isSubmitting ? <Loader2 className="animate-spin"/> : <Send size={16} className="mr-2"/>}
                    Submit Reply
                </button>
            </div>
        </form>
    );
};


export default function PostDetailPage() {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { postId } = useParams(); // Get post ID from the URL
    const { token, user } = useAuthStore();

    const fetchPost = useCallback(async () => {
        if (!token || !postId) return;
        setLoading(true);
        try {
            const data = await forumApi.getPostById(token, postId);
            setPost(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, postId]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" size={32}/></div>;
    if (error) return <div className="p-4 bg-red-50 text-red-700">{error}</div>;
    if (!post) return <div className="p-4">Post not found.</div>;

    const canReply = user && user.id !== post.author.id;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Link to="/farmer/os/community-hub" className="flex items-center text-sm text-blue-600 hover:underline mb-4">
                <ArrowLeft size={16} className="mr-1"/> Back to All Posts
            </Link>

            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                {/* Post Content */}
                <div className="p-6">
                    <p className="text-sm font-semibold text-blue-600">{post.category}</p>
                    <h1 className="text-3xl font-bold text-gray-900 mt-1">{post.title}</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Posted by <span className="font-semibold">{post.author.full_name}</span>
                    </p>
                    {post.image_url && <img src={post.image_url} alt={post.title} className="mt-4 rounded-lg w-full" />}
                    <p className="text-gray-800 mt-6 whitespace-pre-wrap">{post.content}</p>
                </div>
                
                {/* --- REPLIES SECTION --- */}
                <div className="bg-gray-50/50">
                    <h2 className="text-lg font-semibold p-4 border-b border-t">
                        Replies ({post.replies.length})
                    </h2>
                    
                    {/* Map over the replies array and render a card for each one */}
                    {post.replies.length > 0 ? (
                        post.replies.map(reply => <ReplyCard key={reply.id} reply={reply} />)
                    ) : (
                        <p className="p-4 text-sm text-gray-500">No replies yet. Be the first to respond!</p>
                    )}
                    
                    {/* Show the reply form if the user is allowed to reply */}
                    {canReply && (
                        <div className="p-4 border-t">
                            <ReplyForm postId={post.id} onReplySuccess={fetchPost} />
                        </div>
                    )}
                </div>
                {/* --- END OF REPLIES SECTION --- */}
            </div>
        </div>
    );
}