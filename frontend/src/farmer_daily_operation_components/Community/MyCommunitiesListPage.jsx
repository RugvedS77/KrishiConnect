import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import * as data from "./data";

const MyCommunitiesListPage = ({ setView, setSelectedCommunityId }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <button onClick={() => setView("local_landing")} className="flex items-center text-sm font-semibold text-gray-600 hover:text-green-700 mb-4">
            <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Communities</h3>
        <div className="space-y-3">
            {data.userJoinedCommunities.map((id) => {
                const c = data.communityDetails[id];
                return (
                    <div key={id} onClick={() => { setSelectedCommunityId(id); setView("community_detail"); }} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                        <div className="flex items-center">
                            <div className="text-2xl mr-4">{c.icon}</div>
                            <div>
                                <p className="font-semibold text-gray-800">{c.name}</p>
                                <p className="text-sm text-gray-500">{c.members.toLocaleString()} members</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400" />
                    </div>
                );
            })}
        </div>
    </div>
);

export default MyCommunitiesListPage;