import React, { useState } from "react";
import { MessageSquarePlus } from "lucide-react";

const PostNewQuery = ({ onPostQuery }) => {
    const [newQuery, setNewQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newQuery.trim()) return;
        
        // This function would normally make an API call to create a new post
        onPostQuery(newQuery);
        setNewQuery("");
    };

    return (
        <div className="bg-white p-5 mb-8 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Ask the Community</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    value={newQuery}
                    onChange={(e) => setNewQuery(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    rows="3"
                    placeholder="What's on your mind? Ask a question..."
                ></textarea>
                <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                    <MessageSquarePlus size={16} className="mr-2" />
                    Post Question
                </button>
            </form>
        </div>
    );
};

export default PostNewQuery;