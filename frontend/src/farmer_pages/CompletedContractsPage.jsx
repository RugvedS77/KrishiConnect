import React, { useState } from 'react';

// --- Dummy Data for Completed Contracts ---
const dummyCompletedContracts = [
  {
    id: 'C-082',
    cropType: 'Wheat (Durum)',
    buyerName: 'Local Mill Co.',
    quantity: '5 tons',
    finalPayment: '$9,500',
    deliveryDate: '2025-05-20',
    pdfUrl: '/contracts/C-082.pdf', // Dummy link for the PDF
  },
  {
    id: 'C-075',
    cropType: 'Cotton (Short Staple)',
    buyerName: 'Global Agro Traders',
    quantity: '15 tons',
    finalPayment: '$18,200',
    deliveryDate: '2025-04-12',
    pdfUrl: '/contracts/C-075.pdf',
  },
  {
    id: 'C-061',
    cropType: 'Rice (Basmati)',
    buyerName: 'GreenLeaf Organics',
    quantity: '8 tons',
    finalPayment: '$22,000',
    deliveryDate: '2025-02-10',
    pdfUrl: '/contracts/C-061.pdf',
  },
];

export default function CompletedContractsPage() {
  const [completed, setCompleted] = useState(dummyCompletedContracts);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Completed Contracts (History)
      </h1>

      {completed.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <i className="fas fa-history text-4xl text-gray-400 mb-3"></i>
          <h3 className="text-xl font-semibold text-gray-800">No History</h3>
          <p className="text-gray-500">
            Fulfilled contracts will appear here.
          </p>
        </div>
      ) : (
        // --- Table Wrapper ---
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* This wrapper ensures the table is responsive on mobile */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              
              {/* Table Head */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Crop
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Buyer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Final Payment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Delivery Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {completed.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {contract.cropType}
                      </p>
                      <p className="text-sm text-gray-500">ID: {contract.id}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {contract.buyerName}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {contract.quantity}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-green-600">
                        {contract.finalPayment}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {contract.deliveryDate}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Download PDF Button */}
                      <a
                        href={contract.pdfUrl}
                        download
                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                      >
                        <i className="fas fa-file-pdf mr-1.5"></i>
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