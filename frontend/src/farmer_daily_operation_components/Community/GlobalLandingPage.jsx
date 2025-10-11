import React from "react";
import { Users2, Sparkles, Calendar } from "lucide-react";

const GlobalLandingPage = ({ setView }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => setView("forums_page")} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-500 transition cursor-pointer">
            <Users2 className="text-blue-600 mb-3" size={32} />
            <h3 className="text-xl font-semibold text-gray-800">Forums</h3>
            <p className="text-gray-500 mt-1">Explore queries from national and global farmers.</p>
        </div>
        <div onClick={() => setView("innovation_chatbot")} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-500 transition cursor-pointer">
            <Sparkles className="text-blue-600 mb-3" size={32} />
            <h3 className="text-xl font-semibold text-gray-800">Innovation Chatbot</h3>
            <p className="text-gray-500 mt-1">Discover new methods and equipment in farming.</p>
        </div>
        <div onClick={() => setView("global_events")} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-500 transition cursor-pointer">
            <Calendar className="text-blue-600 mb-3" size={32} />
            <h3 className="text-xl font-semibold text-gray-800">Upcoming Events</h3>
            <p className="text-gray-500 mt-1">Find major agricultural summits and webinars.</p>
        </div>
    </div>
);

export default GlobalLandingPage;