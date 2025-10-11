import React, { useState } from "react";
import { User, Send } from 'lucide-react';

const QueryWithSolutions = ({ queryData, onAddSolution }) => {
    const [newSolution, setNewSolution] = useState("");

    const handleSubmit = () => {
        // Don't submit empty comments
        if (!newSolution.trim()) return;

        // In a real app, this function would trigger an API call.
        // For now, it just logs the action and clears the input.
        onAddSolution(queryData.id, newSolution);
        setNewSolution("");
    };

    return (
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 flex flex-col">
            {/* --- Original Query --- */}
            <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-green-200 text-green-800 font-bold flex items-center justify-center mr-4 flex-shrink-0">
                    {queryData.user.avatar}
                </div>
                <div>
                    <p className="text-gray-800">{queryData.query}</p>
                    <p className="text-xs text-gray-500 mt-2">Posted by <strong>{queryData.user.name}</strong></p>
                </div>
            </div>

            {/* --- Existing Solutions --- */}
            {queryData.solutions && queryData.solutions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 pl-8 sm:pl-10 space-y-4">
                    {queryData.solutions.map((sol, index) => (
                        <div key={index} className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                                {sol.user.avatar}
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">{sol.text}</p>
                                <p className="text-xs text-gray-500 mt-1">Answer by <strong>{sol.user.name}</strong></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- NEW: Add a Solution Form --- */}
            <div className="mt-5 pt-4 border-t border-gray-200 flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 font-bold flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                    <User size={16} />
                </div>
                <div className="flex-grow">
                    <textarea
                        value={newSolution}
                        onChange={(e) => setNewSolution(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        rows="2"
                        placeholder="Write your solution or comment..."
                    ></textarea>
                    <button
                        onClick={handleSubmit}
                        className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        <Send size={14} className="mr-2" />
                        Post Solution
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QueryWithSolutions;