import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Wallet, 
    FileSignature, 
    Inbox, 
    Loader2, 
    AlertCircle, 
    Sparkles, // Added for AI Helper
    X          // Added for Modal
} from 'lucide-react';
import { useAuthStore } from '../authStore';

// --- Helper: Reusable Dashboard Card (From Original Code) ---
const DashboardCard = ({ title, value, icon, isLoading }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between min-h-[120px]">
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {title}
      </p>
      {isLoading ? (
        <Loader2 className="h-9 w-9 mt-1 animate-spin text-green-600" />
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      )}
    </div>
    <div className="bg-green-100 p-3 rounded-full">{icon}</div>
  </div>
);

// --- NEW: AI Compliance Helper Modal Component ---
const ComplianceHelperModal = ({ contracts, token, onClose }) => {
    const [selectedContractId, setSelectedContractId] = useState('');
    const [aiAdvice, setAiAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateAdvice = async () => {
        if (!selectedContractId) {
            setError("Please select a contract to analyze.");
            return;
        }
        setIsLoading(true);
        setError('');
        setAiAdvice('');

        try {
            // This is the backend route for the compliance helper
            const response = await fetch(`http://localhost:8000/api/contracts/${selectedContractId}/compliance-check`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to get AI advice.");
            }
            const data = await response.json(); // This is the AIAdviceSchema
            setAiAdvice(data.advice_text);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <Sparkles size={20} className="mr-2 text-green-600"/>AI Compliance Helper
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </header>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <p className="text-sm text-gray-600">Select one of your ongoing contracts to get a personalized risk assessment and action plan from your AI assistant, Sahayak.</p>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700">Ongoing Contract</label>
                            <select 
                                value={selectedContractId} 
                                onChange={(e) => setSelectedContractId(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="" disabled>Select a contract...</option>
                                {contracts.length > 0 ? (
                                    contracts.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {`ID #${c.id}: ${c.listing.crop_type} with ${c.buyer.full_name}`}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No ongoing contracts found.</option>
                                )}
                            </select>
                        </div>
                        <button onClick={handleGenerateAdvice} disabled={isLoading || !selectedContractId} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">
                            {isLoading ? <Loader2 className="animate-spin" /> : "Generate Report"}
                        </button>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {aiAdvice && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                            <h3 className="font-bold text-lg text-green-800">Your AI-Powered Advice</h3>
                            {/* The 'whitespace-pre-wrap' class preserves formatting like newlines from the AI's response */}
                            <p className="text-gray-700 whitespace-pre-wrap">{aiAdvice}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Merged Dashboard Component ---
export default function FarmerDashboard() {
  // --- Dashboard Summary State ---
  const [walletBalance, setWalletBalance] = useState('0.00');
  const [ongoingCount, setOngoingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // --- NEW STATE (from compliance code) ---
  const [isHelperModalOpen, setIsHelperModalOpen] = useState(false);
  const [ongoingContracts, setOngoingContracts] = useState([]); // This holds the full data for the modal

  // --- Auth Store ---
  const token = useAuthStore((state) => state.token);

  // --- LiveCropPrices State & Logic (From Original Code) ---
  const API_KEY = "579b464db66ec23bdd00000194007030867a4adf468997280f6ec1bb";
  const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

  const [cropName, setCropName] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [cropData, setCropData] = useState([]);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [mandiError, setMandiError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const cropOptions = [
    "Onion", "Tomato", "Potato", "Rice", "Wheat", "Sugarcane", "Cotton",
  ];
  const stateOptions = ["Maharashtra", "Karnataka", "Gujarat", "Punjab"];
  const districtOptions = {
    Maharashtra: ["Pune", "Nashik", "Nagpur", "Kolhapur"],
    Karnataka: ["Bangalore", "Mysore", "Hubli"],
    Gujarat: ["Ahmedabad", "Surat", "Rajkot"],
    Punjab: ["Ludhiana", "Amritsar", "Patiala"],
  };

  // This function is unchanged
  const fetchCropPrices = async () => {
    if (!cropName || !state || !district) {
      setMandiError("Please select a crop, state, and district.");
      return;
    }
    setMandiLoading(true);
    setMandiError("");
    setCropData([]);
    setHasSearched(true);

    try {
      const response = await fetch(
        `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[commodity]=${cropName}&filters[state]=${state}&filters[district]=${district}&limit=20`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.records && data.records.length > 0) {
        setCropData(data.records);
      } else {
        setMandiError("❌ No records found for the selected filters.");
      }
    } catch (err) {
      setMandiError("❌ Failed to fetch data. Please try again.");
    } finally {
      setMandiLoading(false);
    }
  };
  // --- End of Mandi Price Logic ---


  // --- UPDATED: Function to fetch all dashboard counts (Merged Logic) ---
  const fetchDashboardSummary = useCallback(async () => {
    if (!token) {
      setDashboardLoading(false);
      setDashboardError("Not logged in.");
      return;
    }

    setDashboardLoading(true);
    setDashboardError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Define all the API calls
      const walletPromise = fetch("http://localhost:8000/api/wallet/me", { headers });
      const ongoingPromise = fetch("http://localhost:8000/api/contracts/ongoing", { headers });
      // This is the "corrected" URL from your compliance code block
      const pendingPromise = fetch("http://localhost:8000/api/contracts/proposals/pending", { headers });

      // Wait for all of them to finish
      const [walletRes, ongoingRes, pendingRes] = await Promise.all([
        walletPromise,
        ongoingPromise,
        pendingPromise
      ]);

      // --- Process Wallet ---
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWalletBalance(parseFloat(walletData.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      } else {
        throw new Error('Failed to fetch wallet balance');
      }

      // --- Process Ongoing Contracts ---
      if (ongoingRes.ok) {
        const ongoingData = await ongoingRes.json();
        setOngoingCount(ongoingData.length); // Set the count for the card
        setOngoingContracts(ongoingData);   // Save the full list for the modal
      } else {
        throw new Error('Failed to fetch ongoing contracts');
      }

      // --- Process Pending Proposals ---
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingCount(pendingData.length); // This also uses the list length
      } else {
        throw new Error('Failed to fetch pending proposals.');
      }

    } catch (err) {
      setDashboardError(err.message);
    } finally {
      setDashboardLoading(false);
    }
  }, [token]);

  // --- Run the fetch function on page load ---
  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);


  // --- RENDER ---
  return (
    <div className="space-y-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* --- Dashboard Error Message --- */}
      {dashboardError && (
         <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" /> 
          <div>
            <p className="font-semibold">Dashboard Summary Error</p>
            <p className="text-sm">{dashboardError}</p>
          </div>
        </div>
      )}

      {/* --- Quick Summary Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Wallet Balance"
          value={`₹${walletBalance}`}
          icon={<Wallet className="h-8 w-8 text-green-600" />}
          isLoading={dashboardLoading}
        />
        <DashboardCard
          title="Ongoing Contracts"
          value={ongoingCount}
          icon={<FileSignature className="h-8 w-8 text-green-600" />}
          isLoading={dashboardLoading}
        />
        <DashboardCard
          title="Pending Proposals"
          value={pendingCount}
          icon={<Inbox className="h-8 w-8 text-green-600" />}
          isLoading={dashboardLoading}
        />
      </div>

      {/* --- NEW: Quick Actions Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex flex-col md:flex-row gap-4">
              <button
                  onClick={() => setIsHelperModalOpen(true)}
                  className="flex-1 text-left p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                disabled={ongoingContracts.length === 0} // Disable if no contracts exist
              >
                  <div className="flex items-center">
                      <Sparkles className="h-8 w-8 text-green-600 mr-4"/>
                      <div>
                          <p className="font-bold text-green-800">AI Compliance Helper</p>
                          <p className="text-sm text-gray-600">Get a risk assessment and action plan for an ongoing contract.</p>
                      </div>
                  </div>
              </button>
          </div>
      </div>

      {/* --- Live Crop Prices Component (Original Code) --- */}
      <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
          🌾 Live Mandi Prices
        </h2>

        {/* Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Crop Dropdown */}
          <div>
            <label className="block font-medium mb-1 text-sm text-gray-600">Crop:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
            >
              <option value="" disabled>Select Crop</option>
              {cropOptions.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block font-medium mb-1 text-sm text-gray-600">State:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setDistrict(""); // Reset district on state change
              }}
            >
              <option value="" disabled>Select State</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block font-medium mb-1 text-sm text-gray-600">District:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!state}
            >
              <option value="" disabled>Select District</option>
              {state && districtOptions[state]?.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md mb-6 transition-colors duration-300"
          onClick={fetchCropPrices}
          disabled={mandiLoading}
        >
          {mandiLoading ? 'Fetching...' : '🔍 Get Prices'}
        </button>

        {/* Loading / Error */}
        {mandiLoading && <div className="text-center"><Loader2 className="animate-spin inline-block text-gray-500" /></div>}
        {mandiError && (
          <p className="text-center text-red-600 font-semibold">{mandiError}</p>
        )}

        {/* Table Result */}
        {hasSearched && !mandiLoading && cropData.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Results for <span className="text-green-700">{cropName}</span> in{" "}
              <span className="text-green-700">
                {district}, {state}
              </span>
            </h3>

            <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
              <thead className="bg-green-100 text-left">
                <tr>
                  <th className="py-2 px-4 border-b border-gray-300">📅 Date</th>
                  <th className="py-2 px-4 border-b border-gray-300">🏬 Mandi</th>
                  <th className="py-2 px-4 border-b border-gray-300">
                    📉 Min Price
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300">
                    📈 Max Price
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300">
                    📊 Modal Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {cropData.map((record, index) => {
                  let formattedDate = "Date Unavailable";
                  if (record.arrival_date) {
                    const dateParts = record.arrival_date.split("-");
                    if (dateParts.length === 3) {
                      const d = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                      if (!isNaN(d)) {
                        formattedDate = d.toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric",
                        });
                      } else {
                        formattedDate = record.arrival_date; 
                      }
                    } else {
                      formattedDate = record.arrival_date;
                    }
                  }
                  return (
                    <tr key={index} className="hover:bg-gray-100 transition-colors">
                      <td className="py-2 px-4 border-b border-gray-200">{formattedDate}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{record.market}</td>
                      <td className="py-2 px-4 border-b border-gray-200">₹{record.min_price}</td>
                      <td className="py-2 px-4 border-b border-gray-200">₹{record.max_price}</td>
                      <td className="py-2 px-4 border-b border-gray-200">₹{record.modal_price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- NEW: Render the modal when it's open --- */}
      {isHelperModalOpen && (
        <ComplianceHelperModal 
            contracts={ongoingContracts}
            token={token}
            onClose={() => setIsHelperModalOpen(false)}
        />
      )}
      
    </div>
  );
}