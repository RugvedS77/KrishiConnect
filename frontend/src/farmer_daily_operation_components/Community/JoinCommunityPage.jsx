import React from "react";
import { ArrowLeft } from "lucide-react";
import * as data from "./data";

const JoinCommunityPage = ({ setView }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <button onClick={() => setView("local_landing")} className="flex items-center text-sm font-semibold text-gray-600 hover:text-green-700 mb-4">
            <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Discover Communities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(data.communityDetails).filter((c) => !data.userJoinedCommunities.includes(c.id)).map((c) => (
                <div key={c.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{c.name}</p>
                    <p className="text-sm text-gray-500 mb-3">{c.members.toLocaleString()} members</p>
                    <button className="w-full bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-green-700 text-sm transition">Join</button>
                </div>
            ))}
        </div>
    </div>
);

export default JoinCommunityPage