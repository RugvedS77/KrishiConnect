import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Wallet, 
    FileClock, 
    FileText, 
    ArrowRight, 
    BarChart2, 
    Activity,
    CheckCircle,
    Send,
    PlusCircle,
    ShoppingBag
} from 'lucide-react';

// --- Expanded Dummy Data (Updated for INR) ---
const walletBalance = 415250;
const pendingProposals = 4;
const activeContracts = 7;

const chartData = [
  { day: 'Sun', sent: 3, accepted: 2 },
  { day: 'Mon', sent: 5, accepted: 3 },
  { day: 'Tue', sent: 7, accepted: 4 },
  { day: 'Wed', sent: 4, accepted: 4 },
  { day: 'Thu', sent: 8, accepted: 5 },
  { day: 'Fri', sent: 6, accepted: 3 },
  { day: 'Sat', sent: 9, accepted: 6 },
];

const activityFeed = [
    { icon: <CheckCircle size={20} className="text-green-500" />, text: 'Contract #103 for Basmati Rice was accepted by Vikram Singh.', time: '35 minutes ago' },
    { icon: <Send size={20} className="text-blue-500" />, text: 'Proposal for Organic Wheat sent to Raj Patel.', time: '2 hours ago' },
    { icon: <PlusCircle size={20} className="text-indigo-500" />, text: '₹5,00,000 was added to your wallet.', time: '1 day ago' },
    { icon: <FileText size={20} className="text-gray-500" />, text: 'Contract #101 with Sunita Reddy is now in progress.', time: '2 days ago' },
];

// --- Reusable StatCard Component (Updated Styling) ---
const StatCard = ({ title, value, icon, color, linkTo }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg hover:ring-2 hover:ring-green-500 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${colors[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
        <Link to={linkTo} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
};

// --- Interactive SVG Line Chart Component ---
const ProposalChart = () => {
    const [tooltip, setTooltip] = useState(null);
    const width = 500;
    const height = 240;
    const padding = 30;

    const xScale = (index) => padding + (index * (width - 2 * padding)) / (chartData.length - 1);
    const yScale = (value) => height - padding - (value / 10) * (height - 2 * padding); // Max value of 10

    const linePath = (dataKey) => 
        `M ${xScale(0)} ${yScale(chartData[0][dataKey])} ` +
        chartData.slice(1).map((d, i) => `L ${xScale(i + 1)} ${yScale(d[dataKey])}`).join(' ');
        
    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Y-axis labels and grid lines */}
                {[0, 2, 4, 6, 8, 10].map(val => (
                    <g key={val}>
                        <text x={padding - 10} y={yScale(val) + 3} textAnchor="end" fontSize="10" fill="#9CA3AF">{val}</text>
                        <line x1={padding} y1={yScale(val)} x2={width-padding} y2={yScale(val)} stroke="#E5E7EB" strokeDasharray="2,2" />
                    </g>
                ))}
                
                {/* X-axis labels */}
                {chartData.map((d, i) => (
                    <text key={d.day} x={xScale(i)} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#6B7280">{d.day}</text>
                ))}

                {/* Data Lines */}
                <path d={linePath('sent')} fill="none" stroke="#60A5FA" strokeWidth="2" />
                <path d={linePath('accepted')} fill="none" stroke="#4ADE80" strokeWidth="2" />

                {/* Data Points with Tooltip Handlers */}
                {chartData.map((d, i) => (
                    <g key={`points-${d.day}`}>
                        <circle cx={xScale(i)} cy={yScale(d.sent)} r="6" fill="white" stroke="#60A5FA" strokeWidth="2" className="cursor-pointer"
                            onMouseEnter={() => setTooltip({ x: xScale(i), y: yScale(d.sent), sent: d.sent, accepted: d.accepted, day: d.day })}
                            onMouseLeave={() => setTooltip(null)} />
                        <circle cx={xScale(i)} cy={yScale(d.accepted)} r="6" fill="white" stroke="#4ADE80" strokeWidth="2" className="cursor-pointer"
                            onMouseEnter={() => setTooltip({ x: xScale(i), y: yScale(d.accepted), sent: d.sent, accepted: d.accepted, day: d.day })}
                            onMouseLeave={() => setTooltip(null)} />
                    </g>
                ))}
                
                {/* Tooltip */}
                {tooltip && (
                    <g transform={`translate(${tooltip.x}, ${tooltip.y - 45})`}>
                        <rect x="-40" y="-10" width="80" height="40" rx="5" fill="rgba(0,0,0,0.7)" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{tooltip.day}</text>
                        <text x="0" y="20" textAnchor="middle" fill="#60A5FA" fontSize="9">Sent: {tooltip.sent}</text>
                        <text x="0" y="30" textAnchor="middle" fill="#4ADE80" fontSize="9">Accepted: {tooltip.accepted}</text>
                    </g>
                )}
            </svg>
        </div>
    );
};

// --- Main Dashboard Component ---
const BuyerDashboard = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 bg-gray-50 p-6 md:p-8 min-h-screen">
      {/* --- HEADER --- */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hello, Mayuresh Marade!</h1>
          <p className="text-gray-500 mt-1">Here's a summary of your activity.</p>
        </div>
        <Link to="/buyer/browse" className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-green-700 mt-4 sm:mt-0">
            <ShoppingBag size={20} />
            <span>Browse Listings</span>
        </Link>
      </header>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Wallet Balance" 
          value={`₹${walletBalance.toLocaleString('en-IN')}`} 
          icon={<Wallet size={24} />} 
          color="blue" 
          linkTo="/payments" 
        />
        <StatCard 
          title="Pending Proposals" 
          value={pendingProposals} 
          icon={<FileClock size={24} />} 
          color="yellow" 
          linkTo="/contracts" 
        />
        <StatCard 
          title="Contracts in Progress" 
          value={activeContracts} 
          icon={<FileText size={24} />} 
          color="green" 
          linkTo="/contracts" 
        />
      </div>

      {/* --- MAIN CONTENT AREA (Chart and Activity Feed) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- PROPOSAL ACTIVITY CHART (Left Column) --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <BarChart2 className="text-gray-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Weekly Proposal Activity</h2>
          </div>
          <ProposalChart />
           <div className="flex justify-center items-center space-x-4 mt-4 text-sm">
             <div className="flex items-center"><span className="w-3 h-3 bg-blue-400 rounded-sm mr-2"></span>Sent</div>
             <div className="flex items-center"><span className="w-3 h-3 bg-green-400 rounded-sm mr-2"></span>Accepted</div>
           </div>
        </div>

        {/* --- RECENT ACTIVITY FEED (Right Column) --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <Activity className="text-gray-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <div className="relative space-y-6">
            <div className="absolute left-3.5 top-2 h-[calc(100%-1rem)] w-0.5 bg-gray-200 z-0"></div>
            {activityFeed.map((item, index) => (
              <div key={index} className="relative flex items-start space-x-4 z-10">
                <div className="bg-white rounded-full p-1 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-700">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;