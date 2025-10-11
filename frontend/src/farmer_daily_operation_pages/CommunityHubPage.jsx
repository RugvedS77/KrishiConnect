import React, { useState } from "react";
import { Users, MessageSquare, Briefcase } from "lucide-react";

// Import the main page components
import SchemeExplorerPage from "./SchemeExplorerPage"
import AskExpertPage from "./AskExpertPage";
import CommunityPage from "./CommunityPage";

// --- Icons for the Main Hub ---
const CommunityIcon = () => <Users className="h-5 w-5 mr-2" />;
const SchemeIcon = () => <Briefcase className="h-5 w-5 mr-2" />;
const ExpertIcon = () => <MessageSquare className="h-5 w-5 mr-2" />;

export default function CommunityHubPage() {
  const [activeTab, setActiveTab] = useState("community");

  const getTabButtonClasses = (tabName, color) => {
    const isActive = activeTab === tabName;
    return `flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors duration-200 ${
      isActive
        ? `border-${color}-600 text-${color}-600`
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Community Hub
          </h1>
          <p className="text-gray-600 mt-2">
            Connect with farmers, find schemes, and get expert advice.
          </p>
        </div>
        <div className="border-b border-gray-200">
          <nav
            className="-mb-px flex justify-center space-x-4 sm:space-x-8"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab("community")}
              className={getTabButtonClasses("community", "green")}
            >
              <CommunityIcon /> Community
            </button>
            <button
              onClick={() => setActiveTab("schemes")}
              className={getTabButtonClasses("schemes", "blue")}
            >
              <SchemeIcon /> Govt. Schemes
            </button>
            <button
              onClick={() => setActiveTab("experts")}
              className={getTabButtonClasses("experts", "purple")}
            >
              <ExpertIcon /> Expert Advice
            </button>
          </nav>
        </div>
        <div className="mt-8">
          {activeTab === "community" && <CommunityPage />}
          {activeTab === "schemes" && <SchemeExplorerPage />}
          {activeTab === "experts" && <AskExpertPage />}
        </div>
      </div>
    </div>
  );
}