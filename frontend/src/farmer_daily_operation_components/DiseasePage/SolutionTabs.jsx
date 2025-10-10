import React, { useState } from 'react';
import { SparklesIcon, BeakerIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FaShoppingBasket, FaStore } from 'react-icons/fa';

import RecommendProducts from './RecommendProducts';
import AgriShops from './AgriShops';

// This is the same InfoCard component from IdentifyDisease.jsx
// It's good practice to move reusable components to their own files, 
// but for simplicity, we can redefine it here or import it.
const InfoCard = ({ icon, title, color, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm w-full">
        <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-200/80`}>
            {React.cloneElement(icon, { className: `w-7 h-7 ${color}` })}
            <h3 className={`text-lg font-bold ${color}`}>{title}</h3>
        </div>
        <div className="p-6 text-slate-700 leading-relaxed text-base">{children}</div>
    </div>
);


const SolutionTabs = ({ result, userLocation }) => {
    const [activeTab, setActiveTab] = useState('remedies');

    const renderContent = () => {
        switch (activeTab) {
            case 'remedies':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard title="Organic Remedies" color="text-amber-600" icon={<SparklesIcon />}>
                            {result.organic?.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2">{result.organic.map((r, i) => <li key={i}>{r}</li>)}</ul>
                            ) : (
                                <p className="text-slate-500 italic">No specific organic remedies listed.</p>
                            )}
                        </InfoCard>
                        <InfoCard title="Chemical Treatments" color="text-orange-600" icon={<BeakerIcon />}>
                            {result.chemicals?.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2">
                                    {result.chemicals.map((c, i) => (
                                        <li key={i}>
                                            {c}
                                            {result.links?.[i] && (
                                                <a href={result.links[i]} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-sky-600 hover:underline">(more info)</a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 italic">No specific chemical treatments listed.</p>
                            )}
                        </InfoCard>
                    </div>
                );
            case 'products':
                return <RecommendProducts chemicals={result.chemicals} disease={result.disease} />;
            case 'shops':
                return <AgriShops userLocation={userLocation} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 mb-6">
                <TabButton
                    title="Remedies & Treatments"
                    icon={<BeakerIcon className="w-5 h-5 mr-2" />}
                    isActive={activeTab === 'remedies'}
                    onClick={() => setActiveTab('remedies')}
                />
                <TabButton
                    title="Recommended Products"
                    icon={<FaShoppingBasket className="w-5 h-5 mr-2" />}
                    isActive={activeTab === 'products'}
                    onClick={() => setActiveTab('products')}
                />
                <TabButton
                    title="Nearby Shops"
                    icon={<FaStore className="w-5 h-5 mr-2" />}
                    isActive={activeTab === 'shops'}
                    onClick={() => setActiveTab('shops')}
                />
            </div>

            {/* Tab Content */}
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

const TabButton = ({ title, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center font-semibold px-4 py-3 border-b-2 transition-all duration-300
        ${isActive
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-slate-500 hover:text-green-600 hover:border-green-300'
            }`}
    >
        {icon}
        {title}
    </button>
);


export default SolutionTabs;