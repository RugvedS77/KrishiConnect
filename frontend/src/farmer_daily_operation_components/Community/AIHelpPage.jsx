import React, { useState } from "react";
import { ArrowLeft, Bot } from "lucide-react";
import * as data from "./data";

const AIHelpPage = ({ setView }) => {
    const [output, setOutput] = useState("");
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <button onClick={() => setView("local_landing")} className="flex items-center text-sm font-semibold text-gray-600 hover:text-green-700 mb-6">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <div className="text-center">
                <Bot className="text-green-600 mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-semibold text-gray-800">Local Services AI</h3>
                <p className="text-gray-600 mt-2 mb-6">Select a predefined query to get an instant answer.</p>
            </div>
            <div className="w-full max-w-md mx-auto space-y-3 mb-4">
                {data.aiLocalPrompts.map(p => (
                    <button key={p.id} onClick={() => setOutput(p.response)} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition">{p.prompt}</button>
                ))}
            </div>
            {output && <div className="mt-6 w-full max-w-md mx-auto p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-800">{output}</p></div>}
        </div>
    );
};

export default AIHelpPage;