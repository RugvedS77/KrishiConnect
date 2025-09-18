import React, { useState, useMemo } from 'react';
import { History, FileDown, Search, Star, Package, DollarSign, CheckCircle } from 'lucide-react';

// --- Expanded Dummy Data (Updated to INR & added Ratings) ---
const dummyCompletedContracts = [
  {
    id: 'C-082',
    cropType: 'Wheat (Durum)',
    buyerName: 'Local Mill Co.',
    quantity: '50 Tons',
    finalPayment: 950000,
    deliveryDate: '2025-05-20',
    pdfUrl: '/contracts/C-082.pdf',
    rating: 5,
  },
  {
    id: 'C-075',
    cropType: 'Cotton (Short Staple)',
    buyerName: 'Global Agro Traders',
    quantity: '150 Tons',
    finalPayment: 1820000,
    deliveryDate: '2025-04-12',
    pdfUrl: '/contracts/C-075.pdf',
    rating: 4,
  },
  {
    id: 'C-061',
    cropType: 'Rice (Basmati)',
    buyerName: 'GreenLeaf Organics',
    quantity: '80 Tons',
    finalPayment: 2200000,
    deliveryDate: '2025-02-10',
    pdfUrl: '/contracts/C-061.pdf',
    rating: 5,
  },
  {
    id: 'C-058',
    cropType: 'Sugarcane',
    buyerName: 'Mahanadi Sugars',
    quantity: '200 Tons',
    finalPayment: 3500000,
    deliveryDate: '2025-01-15',
    pdfUrl: '/contracts/C-058.pdf',
    rating: 4,
  },
  {
    id: 'C-049',
    cropType: 'Organic Tomatoes',
    buyerName: 'Fresh Veggies Inc.',
    quantity: '20 Tons',
    finalPayment: 450000,
    deliveryDate: '2024-12-20',
    pdfUrl: '/contracts/C-049.pdf',
    rating: 5,
  },
];

// --- Helper Components ---

// New Stat Card component
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm flex items-start space-x-4">
    <div className={`p-3 rounded-full ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// New Rating component
const StarRating = ({ rating }) => (
  <div className="flex space-x-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ))}
  </div>
);

export default function CompletedContractsPage() {
  const [completed, setCompleted] = useState(dummyCompletedContracts);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate stats for the new cards
  const stats = useMemo(() => {
    const totalEarnings = completed.reduce((acc, c) => acc + c.finalPayment, 0);
    const avgRating = completed.reduce((acc, c) => acc + c.rating, 0) / completed.length;
    return {
      totalContracts: completed.length,
      totalEarnings: totalEarnings,
      averageRating: avgRating.toFixed(1),
    };
  }, [completed]);

  // Filter logic for the search bar
  const filteredContracts = useMemo(() => {
    return completed.filter(
      (contract) =>
        contract.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [completed, searchTerm]);

  return (
    <div className="space-y-6 bg-gray-50 p-6 md:p-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Completed Contracts (History)
      </h1>

      {/* --- FEATURE: Summary Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Contracts Completed"
          value={stats.totalContracts}
          icon={<CheckCircle size={22} className="text-green-600" />}
          colorClass="bg-green-100"
        />
        <StatCard
          title="Total Earned"
          value={`₹${stats.totalEarnings.toLocaleString('en-IN')}`}
          icon={<DollarSign size={22} className="text-blue-600" />}
          colorClass="bg-blue-100"
        />
        <StatCard
          title="Average Rating"
          value={`${stats.averageRating} / 5.0`}
          icon={<Star size={22} className="text-yellow-500" />}
          colorClass="bg-yellow-100"
        />
      </div>
      
      {/* --- FEATURE: Search Bar --- */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by crop or buyer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300"
        />
        <div className="absolute left-3 top-0 h-full flex items-center">
          <Search size={18} className="text-gray-400" />
        </div>
      </div>


      {filteredContracts.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <History size={48} className="text-gray-400 mb-4 mx-auto" /> {/* Lucide Icon */}
          <h3 className="text-xl font-semibold text-gray-800">No History</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No contracts match your search.' : 'Fulfilled contracts will appear here.'}
          </p>
        </div>
      ) : (
        // --- Table Wrapper (Lineless theme) ---
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              
              {/* Table Head */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th> {/* New Column */}
                  <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>

              {/* Table Body (Lineless theme) */}
              <tbody className="bg-white">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{contract.cropType}</p>
                      <p className="text-sm text-gray-500">ID: {contract.id}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{contract.buyerName}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{contract.quantity}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm font-semibold text-green-600">
                        ₹{contract.finalPayment.toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{contract.deliveryDate}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <StarRating rating={contract.rating} /> {/* New Column Data */}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      {/* Download PDF Button */}
                      <a
                        href={contract.pdfUrl}
                        download
                        className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors"
                      >
                        <FileDown size={14} className="mr-1.5" /> {/* Lucide Icon */}
                        Download PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}