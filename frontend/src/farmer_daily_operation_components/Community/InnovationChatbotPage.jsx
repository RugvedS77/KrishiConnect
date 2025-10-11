import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

const InnovationChatbotPage = ({ setView }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
        <button onClick={() => setView("global_landing")} className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-700 mb-6">
            <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        <Sparkles className="text-blue-600 mx-auto mb-4" size={48} />
        <h3 className="text-2xl font-semibold text-gray-800">Innovation Chatbot</h3>
        <p className="text-gray-600 mt-2 mb-6">Ask about new equipment, market methods, and farming tech.</p>
        <div className="w-full max-w-md mx-auto bg-gray-50 p-4 rounded-lg text-left">
            <p className="font-semibold text-gray-700 mb-2 text-center">Example Prompts:</p>
            <ul className="space-y-2 text-sm text-gray-600">
                <li>&bull; "Show me the latest drone technology for spraying pesticides."</li>
                <li>&bull; "What are new techniques for water conservation in sugarcane farming?"</li>
            </ul>
        </div>
    </div>
);

export default InnovationChatbotPage;