import React from "react";
import { ArrowLeft } from "lucide-react";

const CreateCommunityPage = ({ setView }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <button onClick={() => setView("local_landing")} className="flex items-center text-sm font-semibold text-gray-600 hover:text-green-700 mb-4">
            <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Create a New Community</h3>
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Community Name</label>
                <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition">Create Community</button>
        </form>
    </div>
);

export default CreateCommunityPage;