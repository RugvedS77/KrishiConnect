import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import * as data from "./data";
import QueryWithSolutions from "./QueryWithSolutions";

const ForumsPage = ({ setView }) => {
    const [forumTab, setForumTab] = useState("national");
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <button onClick={() => setView("global_landing")} className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-700 mb-4">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <div className="flex border-b mb-4">
                <button onClick={() => setForumTab("national")} className={`py-2 px-4 font-semibold ${forumTab === "national" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>National (India)</button>
                <button onClick={() => setForumTab("global")} className={`py-2 px-4 font-semibold ${forumTab === "global" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>Global</button>
            </div>
            <div className="space-y-4">
                {forumTab === "national" && data.nationalQueries.map((q) => <QueryWithSolutions key={q.id} queryData={q} />)}
                {forumTab === "global" && data.globalQueries.map((q) => <QueryWithSolutions key={q.id} queryData={q} />)}
            </div>
        </div>
    );
};

export default ForumsPage;