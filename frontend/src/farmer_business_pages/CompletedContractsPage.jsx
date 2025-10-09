import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    History, 
    FileDown, 
    Search, 
    Star, 
    DollarSign, 
    CheckCircle,
    Loader2, // Added
    AlertCircle  // Added
} from 'lucide-react';
import { useAuthStore } from '../authStore'; // Added
import { API_BASE_URL } from './apiConfig';

// --- Helper Components (Unchanged) ---

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

// --- Main Page Component (UPDATED with API logic) ---
export default function CompletedContractsPage() {
  // --- STATE FOR API DATA ---
  const [completed, setCompleted] = useState([]); // This will hold the data from the API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useAuthStore((state) => state.token);
  
  // State for search (unchanged)
  const [searchTerm, setSearchTerm] = useState('');

  // --- API: Fetch Completed Contracts ---
  const fetchCompletedContracts = useCallback(async () => {
    if (!token) {
        setLoading(false);
        setError("Please log in to view contract history.");
        return;
    }
    setLoading(true);
    setError(null);

    try {
      // ASSUMPTION: You must create this endpoint in your backend.
      // It should query contracts where status == ContractStatus.completed
      const response = await fetch(`${API_BASE_URL}/api/contracts/completed`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to fetch completed contracts.");
      }

      const data = await response.json(); // List[ContractDashboardResponse]

      // Map backend data to the props your UI needs
      const formattedData = data.map(item => ({
        id: item.id,
        cropType: item.listing.crop_type,
        buyerName: item.buyer.full_name,
        quantity: `${item.quantity_proposed} ${item.listing.unit}`,
        finalPayment: parseFloat(item.total_value), // Stat card needs this as a number
        deliveryDate: new Date(item.listing.harvest_date).toLocaleDateString('en-IN'),
        
        // --- PLACEHOLDER DATA ---
        // Your backend schema does not provide these. We add mocks so the UI works.
        pdfUrl: `/contracts/mock-pdf-for-${item.id}.pdf`,
        rating: Math.floor(Math.random() * 2) + 4, // Random 4 or 5 star rating
      }));

      setCompleted(formattedData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch data when component loads
  useEffect(() => {
    fetchCompletedContracts();
  }, [fetchCompletedContracts]);


  // Calculate stats for the new cards (This logic works perfectly with the new state)
  const stats = useMemo(() => {
    if (completed.length === 0) {
      return { totalContracts: 0, totalEarnings: 0, averageRating: 'N/A' };
    }
    const totalEarnings = completed.reduce((acc, c) => acc + c.finalPayment, 0);
    const avgRating = completed.reduce((acc, c) => acc + c.rating, 0) / completed.length;
    return {
      totalContracts: completed.length,
      totalEarnings: totalEarnings,
      averageRating: avgRating.toFixed(1),
    };
  }, [completed]);

  // Filter logic for the search bar (This logic also works perfectly with the new state)
  const filteredContracts = useMemo(() => {
    return completed.filter(
      (contract) =>
        contract.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [completed, searchTerm]);
  
  // --- RENDER FUNCTION for Loading/Error states ---
  const renderContent = () => {
    if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-600" size={48} />
          <p className="ml-4 text-gray-600">Loading contract history...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex items-start h-24 bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" /> 
          <div>
            <p className="font-semibold">Error Loading Contracts</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (completed.length === 0) {
         return (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                <History size={48} className="text-gray-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800">No History</h3>
                <p className="text-gray-500">
                    Fulfilled contracts will appear here.
                </p>
            </div>
         );
    }
    
    // --- Render Table if data exists ---
    return (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {/* We use filteredContracts here to respect the search bar */}
                {filteredContracts.length === 0 && searchTerm && (
                    <tr>
                        <td colSpan="7" className="text-center p-8 text-gray-500">
                            No contracts match your search for "{searchTerm}".
                        </td>
                    </tr>
                )}
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
                      <StarRating rating={contract.rating} />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={contract.pdfUrl}
                        download
                        className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors"
                      >
                        <FileDown size={14} className="mr-1.5" />
                        Download PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 p-6 md:p-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Completed Contracts (History)
      </h1>

      {/* --- Summary Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Contracts Completed"
          value={loading ? '-' : stats.totalContracts}
          icon={<CheckCircle size={22} className="text-green-600" />}
          colorClass="bg-green-100"
        />
        <StatCard
          title="Total Earned"
          value={loading ? '₹-' : `₹${stats.totalEarnings.toLocaleString('en-IN')}`}
          icon={<DollarSign size={22} className="text-blue-600" />}
          colorClass="bg-blue-100"
        />
        <StatCard
          title="Average Rating"
          value={loading ? '- / 5.0' : `${stats.averageRating} / 5.0`}
          icon={<Star size={22} className="text-yellow-500" />}
          colorClass="bg-yellow-100"
        />
      </div>
      
      {/* --- Search Bar --- */}
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

     {/* --- Render Table or Loading/Error State --- */}
     {renderContent()}

    </div>
  );
}