import React from "react";
import { Users, Bot, UserPlus, Calendar, PlusCircle } from "lucide-react";

const LocalLandingPage = ({ setView }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div onClick={() => setView("my_communities_list")} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-green-500 transition cursor-pointer">
      <Users className="text-green-600 mb-3" size={32} />
      <h3 className="text-xl font-semibold text-gray-800">My Communities</h3>
      <p className="text-gray-500 mt-1">Participate in communities you have joined.</p>
    </div>
    <div onClick={() => setView("ai_help")} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-green-500 transition cursor-pointer">
      <Bot className="text-green-600 mb-3" size={32} />
      <h3 className="text-xl font-semibold text-gray-800">Help Me for Services</h3>
      <p className="text-gray-500 mt-1">Ask our AI assistant for local service queries.</p>
    </div>
    <div onClick={() => setView("join_community")} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-green-500 transition cursor-pointer">
      <UserPlus className="text-green-600 mb-3" size={32} />
      <h3 className="text-xl font-semibold text-gray-800">Join a Community</h3>
      <p className="text-gray-500 mt-1">Discover and join new farming communities.</p>
    </div>
    <div onClick={() => setView("local_events")} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-green-500 transition cursor-pointer">
      <Calendar className="text-green-600 mb-3" size={32} />
      <h3 className="text-xl font-semibold text-gray-800">Upcoming Events</h3>
      <p className="text-gray-500 mt-1">Find workshops and events happening near you.</p>
    </div>
    <div onClick={() => setView("create_community")} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-green-500 transition cursor-pointer">
      <PlusCircle className="text-green-600 mb-3" size={32} />
      <h3 className="text-xl font-semibold text-gray-800">Create a Community</h3>
      <p className="text-gray-500 mt-1">Start your own community for a specific crop or region.</p>
    </div>
  </div>
);

export default LocalLandingPage;