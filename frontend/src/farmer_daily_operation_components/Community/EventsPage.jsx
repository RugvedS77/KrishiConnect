import React from "react";
import { ArrowLeft, MapPin, Link, Mic, Mail, Calendar } from "lucide-react";
import * as data from "./data";

const EventsPage = ({ setView, type }) => {
    const isLocal = type === "local";
    const events = isLocal ? data.localEvents : data.globalEvents;
    const backView = isLocal ? "local_landing" : "global_landing";

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            {/* --- Header --- */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{isLocal ? "Local" : "Global"} Events</h3>
                <button
                    onClick={() => setView(backView)}
                    className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-700 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back to Hub
                </button>
            </div>

            {/* --- Events List --- */}
            <div className="space-y-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                        <div className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-lg font-semibold text-blue-800">{event.title}</p>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <MapPin size={14} className="mr-1.5" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 ml-4 text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center">
                                    <Calendar size={14} className="mr-1.5" />
                                    {event.date}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 my-4">{event.description}</p>

                            {/* --- Details Section --- */}
                            <div className="bg-white rounded-md p-4 border border-slate-200 space-y-3">
                                <div className="flex items-start">
                                    <Mic size={16} className="mr-3 mt-0.5 text-slate-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">KEY SPEAKERS</p>
                                        <p className="text-sm text-slate-800">{event.speakers.join(", ")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Mail size={16} className="mr-3 mt-0.5 text-slate-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">CONTACT</p>
                                        <p className="text-sm text-slate-800">{event.contact}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Footer / Call to Action --- */}
                        <div className="bg-slate-100 px-5 py-3">
                            <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <Link size={14} className="mr-2" />
                                Register or Learn More
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventsPage;