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
    PlusCircle
} from 'lucide-react';

// --- Dummy Data for Chart and Activity Feed ---
const chartData = [
  { day: 'Mon', sent: 5, accepted: 3 },
  { day: 'Tue', sent: 7, accepted: 4 },
  { day: 'Wed', sent: 4, accepted: 4 },
  { day: 'Thu', sent: 8, accepted: 5 },
  { day: 'Fri', sent: 6, accepted: 3 },
];

const activityFeed = [
    { icon: <Send size={20} className="text-blue-500" />, text: 'Proposal for Organic Wheat sent to Raj Patel.', time: '15 minutes ago' },
    { icon: <CheckCircle size={20} className="text-green-500" />, text: 'Contract #102 for Basmati Rice was accepted.', time: '2 hours ago' },
    { icon: <PlusCircle size={20} className="text-indigo-500" />, text: '$5,000 was added to your wallet.', time: '1 day ago' },
];

// --- Main Dashboard Component ---
const BuyerDashboard = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hello, John Doe!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening today.</p>
        </div>
        <p className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg mt-2 sm:mt-0">
          {today}
        </p>
      </header>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Wallet Balance" 
          value="$15,250.00" 
          icon={<Wallet size={24} />} 
          color="blue" 
          linkTo="/payments" 
        />
        <StatCard 
          title="Pending Proposals" 
          value="4" 
          icon={<FileClock size={24} />} 
          color="yellow" 
          linkTo="/contracts" 
        />
        <StatCard 
          title="Contracts in Progress" 
          value="7" 
          icon={<FileText size={24} />} 
          color="green" 
          linkTo="/contracts" 
        />
      </div>

      {/* --- MAIN CONTENT AREA (Chart and Activity Feed) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- PROPOSAL ACTIVITY CHART (Left Column) --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <BarChart2 className="text-gray-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Weekly Proposal Activity</h2>
          </div>
          <div className="h-60 flex justify-around items-end space-x-2">
            {chartData.map(data => (
              <div key={data.day} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-full flex items-end justify-center">
                  <div className="w-1/2 flex justify-around items-end h-full">
                     <div className="w-1/2 bg-blue-200 rounded-t-md hover:bg-blue-300 transition-all" style={{ height: `${data.sent * 10}%` }}></div>
                     <div className="w-1/2 bg-green-200 rounded-t-md hover:bg-green-300 transition-all" style={{ height: `${data.accepted * 10}%` }}></div>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-500 mt-2">{data.day}</p>
              </div>
            ))}
          </div>
           <div className="flex justify-center items-center space-x-4 mt-4 text-sm">
              <div className="flex items-center"><span className="w-3 h-3 bg-blue-200 rounded-sm mr-2"></span>Sent</div>
              <div className="flex items-center"><span className="w-3 h-3 bg-green-200 rounded-sm mr-2"></span>Accepted</div>
          </div>
        </div>

        {/* --- RECENT ACTIVITY FEED (Right Column) --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Activity className="text-gray-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <ul className="space-y-4">
            {activityFeed.map((item, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{item.icon}</div>
                <div>
                  <p className="text-sm text-gray-700">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Reusable StatCard Component ---
const StatCard = ({ title, value, icon, color, linkTo }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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


export default BuyerDashboard;