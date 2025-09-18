import React, { useState } from 'react';
import { PlusCircle, X, Loader } from 'lucide-react';

// Mock data updated to INR (₹) and whole numbers
const initialTransactions = [
  { date: '2025-09-18', desc: 'Payment Released for Contract #104', amount: '-₹12,200', status: 'Pending' },
  { date: '2025-09-17', desc: 'Payment Released for Contract #103', amount: '-₹40,000', status: 'Completed' },
  { date: '2025-09-15', desc: 'Advance for Contract #2 (Basmati Rice)', amount: '-₹80,000', status: 'Completed' },
  { date: '2025-09-10', desc: 'Funds Added via Wire Transfer', amount: '+₹5,00,000', status: 'Completed' },
  { date: '2025-09-01', desc: 'Payment Released for Contract #101', amount: '-₹37,500', status: 'Completed' },
  { date: '2025-08-25', desc: 'Advance for Contract #1 (Organic Wheat)', amount: '-₹25,000', status: 'Completed' },
  { date: '2025-08-20', desc: 'Funds Added via Bank Deposit', amount: '+₹1,00,000', status: 'Completed' },
];

// --- Add Funds Modal Component ---
const AddFundsModal = ({ onClose, onAddFunds }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseInt(amount, 10); // Use parseInt for whole numbers
    if (!numericAmount || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    // Simulate API call
    setIsSubmitting(true);
    setTimeout(() => {
      onAddFunds(numericAmount);
      setIsSubmitting(false);
      onClose();
    }, 1000); // 1-second delay
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
                Amount (INR) {/* Changed to INR */}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span> {/* Changed to ₹ */}
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-12 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="5000" // Updated placeholder
                  min="1"
                  required
                />
              </div>
            </div>
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

// --- Main Payments Component ---
const Payments = () => {
  // Initial balance calculated from mock data (all are integers)
  const [balance, setBalance] = useState(415250);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to handle adding funds
  const handleAddFunds = (amount) => {
    // 1. Update the balance
    setBalance((prevBalance) => prevBalance + amount);

    // 2. Create a new transaction record
    const newTransaction = {
      date: new Date().toISOString().split('T')[0],
      desc: 'Funds Added via UPI/Card', // Updated description
      amount: `+₹${amount.toLocaleString('en-IN')}`, // Formatted for INR
      status: 'Completed',
    };

    // 3. Add the new transaction to the top of the list
    setTransactions((prevTransactions) => [
      newTransaction,
      ...prevTransactions,
    ]);
  };

  // Helper to get status tag styles
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

  return (
    <>
      {/* Render the modal if it's open */}
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

        {/* Wallet Card - Removed 'border' */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <p className="text-sm text-gray-500">Current Wallet Balance</p>
            {/* Updated to show ₹ and use 'en-IN' locale for formatting */}
            <p className="text-3xl font-bold text-gray-800">
              ₹{balance.toLocaleString('en-IN')}
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

        {/* Transaction History - Removed 'border' lines */}
        <div className="bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold p-6"> {/* Removed border-b, increased padding */}
            Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Description
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              {/* Removed divide-y */}
              <tbody>
                {/* Sliced to show only the 5 most recent transactions */}
                {transactions.slice(0, 5).map((tx, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-b-0"> {/* Added ultra-light border */}
                    <td className="px-6 py-5 text-gray-500 whitespace-nowrap">{tx.date}</td> {/* Increased py */}
                    <td className="px-6 py-5 font-medium text-gray-800">
                      {tx.desc}
                    </td>
                    <td
                      className={`px-6 py-5 font-semibold whitespace-nowrap ${
                        tx.amount.startsWith('-')
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {tx.amount}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusClass(
                          tx.status
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Optional: Add a "View All" link if there are more than 5 transactions */}
          {transactions.length > 5 && (
            <div className="p-4 text-right bg-gray-50"> {/* Removed border-t */}
              <a href="#" className="text-sm font-medium text-green-600 hover:underline">
                View all transactions
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payments;