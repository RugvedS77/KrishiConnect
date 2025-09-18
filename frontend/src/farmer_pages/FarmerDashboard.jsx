import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, FileSignature, Inbox } from 'lucide-react';

export default function FarmerDashboard() {
  // --- Dashboard Summary State ---
  const walletBalance = '3,450.00';
  const ongoingContracts = 3;
  const pendingProposals = 5;

  // --- LiveCropPrices State & Logic (Integrated) ---
  const API_KEY = "579b464db66ec23bdd00000194007030867a4adf468997280f6ec1bb";
  const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

  const [cropName, setCropName] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [cropData, setCropData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);


  const cropOptions = [
    "Onion",
    "Tomato",
    "Potato",
    "Rice",
    "Wheat",
    "Sugarcane",
    "Cotton",
  ];
  const stateOptions = ["Maharashtra", "Karnataka", "Gujarat", "Punjab"];
  const districtOptions = {
    Maharashtra: ["Pune", "Nashik", "Nagpur", "Kolhapur"],
    Karnataka: ["Bangalore", "Mysore", "Hubli"],
    Gujarat: ["Ahmedabad", "Surat", "Rajkot"],
    Punjab: ["Ludhiana", "Amritsar", "Patiala"],
  };

  const fetchCropPrices = async () => {
    if (!cropName || !state || !district) {
      setError("Please select a crop, state, and district.");
      return;
    }
    setLoading(true);
    setError("");
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
        setError("❌ No records found for the selected filters.");
      }
    } catch (err) {
      setError("❌ Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* --- Quick Summary Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* 1. Wallet Balance Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Wallet Balance
            </p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{walletBalance}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
             <Wallet className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* 2. Ongoing Contracts Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Ongoing Contracts
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {ongoingContracts}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <FileSignature className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* 3. Pending Proposals Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Pending Proposals
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {pendingProposals}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Inbox className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* --- Live Crop Prices Component --- */}
      <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          🌾 Live Mandi Prices
        </h2>

        {/* Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Crop Dropdown */}
          <div>
            <label className="block font-medium mb-1 text-sm text-gray-600">Crop:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md mb-6 transition-colors duration-300"
          onClick={fetchCropPrices}
          disabled={loading}
        >
          {loading ? 'Fetching...' : '🔍 Get Prices'}
        </button>

        {/* Loading / Error */}
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && (
          <p className="text-center text-red-600 font-semibold">{error}</p>
        )}

        {/* Table Result */}
        {hasSearched && !loading && cropData.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Results for <span className="text-blue-700">{cropName}</span> in{" "}
              <span className="text-blue-700">
                {district}, {state}
              </span>
            </h3>

            <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
              <thead className="bg-blue-100 text-left">
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
                           day: "numeric",
                           month: "long",
                           year: "numeric",
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
      
    </div>
  );
}

