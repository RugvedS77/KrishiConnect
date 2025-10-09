import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, X, Loader2 as Loader } from 'lucide-react';
import { useAuthStore } from '../authStore';
import { Link } from 'react-router-dom'; // Import Link
import { API_BASE_URL } from "../api/apiConfig";

// --- Add Funds Modal Component (Updated to handle live API) ---
const AddFundsModal = ({ onClose, onAddFunds }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseInt(amount, 10);
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddFunds(numericAmount);
      onClose(); // Close the modal on success
    } catch (err) {
      setError(err.message); // Show API error in the modal
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Funds to Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount (INR)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-12 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="5000"
                  min="1"
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <PlusCircle size={20} />
              )}
              <span>
                {isSubmitting ? 'Processing...' : 'Confirm & Add Funds'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Helper Functions to format API data ---
const getTransactionDescription = (tx) => {
  switch (tx.type) {
    case 'deposit':
      return 'Funds Added via Gateway';
    case 'escrow':
      return `Funds Locked for Contract #${tx.contract_id}`;
    case 'release':
      return `Funds Released for Contract #${tx.contract_id}`;
    default:
      return 'General Transaction';
  }
};

const getFormattedAmount = (tx) => {
  const amount = parseFloat(tx.amount).toLocaleString('en-IN');
  if (tx.type === 'deposit') {
    return { text: `+₹${amount}`, class: 'text-green-600' };
  }
  if (tx.type === 'escrow') {
    return { text: `-₹${amount}`, class: 'text-red-600' };
  }
  // This applies to a Farmer's 'release' or 'withdrawal'
  if (tx.type === 'release') {
     return { text: `+₹${amount}`, class: 'text-green-600' };
  }
   if (tx.type === 'withdrawal') {
     return { text: `-₹${amount}`, class: 'text-red-600' };
  }
  return { text: `₹${amount}`, class: 'text-gray-800' };
};

const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
};


// --- Main Payments Component ---
const Payments = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const token = useAuthStore((state) => state.token);

  // --- API: Function to fetch ALL wallet and transaction data ---
  const fetchPaymentData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!token) {
      setError("Please log in to view payments.");
      setIsLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // --- FIX 1: Corrected API path for transactions ---
      const [walletRes, transRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/wallet/me`, { headers }),
        fetch(`${API_BASE_URL}/api/wallet/me/transactions`, { headers }) // <-- ADDED /me/
      ]);

      if (!walletRes.ok || !transRes.ok) {
        throw new Error("Failed to load payment data. (Wallet or Tx route failed)");
      }

      const walletData = await walletRes.json();
      const transData = await transRes.json();

      setBalance(parseFloat(walletData.balance));
      setTransactions(transData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  // --- API: Function to handle adding funds ---
  const handleAddFunds = async (amount) => {
    if (!token) {
        throw new Error("Authentication expired. Please log in again.");
    }

    // --- FIX 2: Corrected API path for adding funds ---
    const response = await fetch(`${API_BASE_URL}/api/wallet/me/add-funds`, { // <-- ADDED /me/ and -funds
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amount })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to add funds.");
    }

    // Success! Re-fetch all data to sync state.
    await fetchPaymentData();
  };


  return (
    <>
      {isModalOpen && (
        <AddFundsModal
          onClose={() => setIsModalOpen(false)}
          onAddFunds={handleAddFunds}
        />
      )}

      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-600 mt-1">
            Manage your wallet and view transaction history.
          </p>
        </header>

        {/* Wallet Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <p className="text-sm text-gray-500">Current Wallet Balance</p>
            <p className="text-3xl font-bold text-gray-800">
              {isLoading ? (
                 <Loader size={28} className="animate-spin text-green-600 mt-1" />
              ) : (
                // Format balance to always show 2 decimal places
                `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700"
          >
            <PlusCircle size={20} />
            <span>Add Funds</span>
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold p-6">
            Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Description</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Amount</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8">
                       <Loader size={24} className="animate-spin inline-block text-gray-500" />
                    </td>
                  </tr>
                ) : error ? (
                   <tr>
                    <td colSpan="4" className="text-center p-8 text-red-600 font-medium">
                       {error}
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center p-8 text-gray-500">
                            No transactions found.
                        </td>
                    </tr>
                ) : (
                  transactions.slice(0, 5).map((tx) => {
                    const formattedAmount = getFormattedAmount(tx);
                    // Your backend Transaction model doesn't have a 'status' field, so we default to 'Completed'
                    const status = 'Completed'; 
                    return (
                        <tr key={tx.id} className="border-b border-gray-50 last:border-b-0">
                            <td className="px-6 py-5 text-gray-500 whitespace-nowrap">
                                {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-5 font-medium text-gray-800">
                                {getTransactionDescription(tx)}
                            </td>
                            <td className={`px-6 py-5 font-semibold whitespace-nowrap ${formattedAmount.class}`}>
                                {formattedAmount.text}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusClass(status)}`}>
                                    {status}
                                </span>
                            </td>
                        </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {transactions.length > 5 && (
            <div className="p-4 text-right bg-gray-50">
              <Link to="#" className="text-sm font-medium text-green-600 hover:underline">
                View all transactions
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payments;