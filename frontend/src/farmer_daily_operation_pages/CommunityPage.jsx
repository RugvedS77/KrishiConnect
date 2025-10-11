import React, { useState } from "react";

// Import all the sub-components
import LocalLandingPage from "../farmer_daily_operation_components/Community/LocalLandingPage"
import GlobalLandingPage from "../farmer_daily_operation_components/Community/GlobalLandingPage";
import MyCommunitiesListPage from "../farmer_daily_operation_components/Community/MyCommunitiesListPage";
import CommunityDetailPage from "../farmer_daily_operation_components/Community/CommunityDetailPage";
import AIHelpPage from "../farmer_daily_operation_components/Community/AIHelpPage";
import JoinCommunityPage from "../farmer_daily_operation_components/Community/JoinCommunityPage";
import CreateCommunityPage from "../farmer_daily_operation_components/Community/CreateCommunityPage";
import EventsPage from "../farmer_daily_operation_components/Community/EventsPage";
import ForumsPage from "../farmer_daily_operation_components/Community/ForumsPage";
import InnovationChatbotPage from "../farmer_daily_operation_components/Community/InnovationChatbotPage";

const CommunityPage = () => {
  const [view, setView] = useState("local_landing");
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const isLocal = view.startsWith("local");
  const isGlobal = view.startsWith("global");

  const renderCurrentView = () => {
    switch (view) {
      case "local_landing": return <LocalLandingPage setView={setView} />;
      case "my_communities_list": return <MyCommunitiesListPage setView={setView} setSelectedCommunityId={setSelectedCommunityId} />;
      case "community_detail": return <CommunityDetailPage setView={setView} communityId={selectedCommunityId} />;
      case "ai_help": return <AIHelpPage setView={setView} />;
      case "join_community": return <JoinCommunityPage setView={setView} />;
      case "create_community": return <CreateCommunityPage setView={setView} />;
      case "local_events": return <EventsPage setView={setView} type="local" />;
      case "global_landing": return <GlobalLandingPage setView={setView} />;
      case "forums_page": return <ForumsPage setView={setView} />;
      case "innovation_chatbot": return <InnovationChatbotPage setView={setView} />;
      case "global_events": return <EventsPage setView={setView} type="global" />;
      default: return <LocalLandingPage setView={setView} />;
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setView("local_landing")} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isLocal ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            Local
          </button>
          <button onClick={() => setView("global_landing")} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isGlobal ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            Global
          </button>
        </div>
      </div>
      {renderCurrentView()}
    </div>
  );
};

export default CommunityPage;