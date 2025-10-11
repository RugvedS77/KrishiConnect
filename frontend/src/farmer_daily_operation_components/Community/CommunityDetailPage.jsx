import React from "react";
import { ArrowLeft } from "lucide-react";
import * as data from "./data";
import QueryWithSolutions from "./QueryWithSolutions";
import PostNewQuery from "./PostNewQuery"; // <-- Import the new component

const CommunityDetailPage = ({ setView, communityId }) => {
    const community = data.communityDetails[communityId];
    const queries = data.communityQueries[communityId] || [];

    // Handler for adding a new solution to an existing query
    const handleAddSolution = (queryId, solutionText) => {
        console.log(`Adding solution to Query #${queryId}: "${solutionText}"`);
        // In a real app, you would update the state or refetch data here.
    };

    // Handler for posting a brand new query
    const handlePostQuery = (queryText) => {
        console.log(`Posting new query in ${community.name}: "${queryText}"`);
        // In a real app, you would update the state or refetch data here.
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <button onClick={() => setView("my_communities_list")} className="flex items-center text-sm font-semibold text-gray-600 hover:text-green-700 mb-4">
                <ArrowLeft size={16} className="mr-2" /> Back to My Communities
            </button>
            
            <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">{community.name}</h3>
                <p className="text-gray-600 mt-1">{community.description}</p>
            </div>

            {/* --- Place the new query form at the top --- */}
            <PostNewQuery onPostQuery={handlePostQuery} />

            {/* --- The list of existing queries --- */}
            <div className="space-y-6">
                {queries.map((q) => (
                    <QueryWithSolutions 
                        key={q.id} 
                        queryData={q} 
                        onAddSolution={handleAddSolution} // <-- Pass the handler function
                    />
                ))}
            </div>
        </div>
    );
};

export default CommunityDetailPage;