import { PlusCircle } from 'lucide-react';

const transactions = [
    { date: '2025-09-15', desc: 'Advance for Contract #2 (Basmati Rice)', amount: '-$480,000.00', status: 'Completed' },
    { date: '2025-09-10', desc: 'Funds Added via Wire Transfer', amount: '+$500,000.00', status: 'Completed' },
    { date: '2025-09-01', desc: 'Payment Released for Contract #101', amount: '-$62,500.00', status: 'Completed' },
    { date: '2025-08-25', desc: 'Advance for Contract #1 (Organic Wheat)', amount: '-$62,500.00', status: 'Completed' },
];

const Payments = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
        <p className="text-gray-600 mt-1">Manage your wallet and view transaction history.</p>
      </header>

      {/* Wallet Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Current Wallet Balance</p>
          <p className="text-3xl font-bold text-gray-800">$15,250.00</p>
        </div>
        <button className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-green-700">
          <PlusCircle size={20} />
          <span>Add Funds</span>
        </button>
      </div>
      
      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">Transaction History</h3>
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
            <tbody className="divide-y">
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{tx.desc}</td>
                  <td className={`px-6 py-4 font-semibold ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>{tx.amount}</td>
                  <td className="px-6 py-4"><span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{tx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;