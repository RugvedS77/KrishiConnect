import React, { useState } from 'react';
import ContractList from '../components/OngoingContracts/ContractList';
import EmptyState from '../components/OngoingContracts/EmptyState.jsx'

// --- Dummy Data ---
const dummyContracts = [
  {
    id: 'C-101',
    buyerName: 'Global Agro Traders',
    cropType: 'Cotton (Long Staple)',
    price: '$21,000 Total',
    timeline: 'Est. Harvest: Nov 15, 2025',
    milestones: [
      { id: 1, name: 'Contract Accepted', status: 'completed' },
      { id: 2, name: 'Sowing', status: 'completed' },
      { id: 3, name: 'Growing', status: 'in_progress' },
      { id: 4, name: 'Harvesting', status: 'pending' },
      { id: 5, name: 'Ready for Delivery', status: 'pending' },
    ],
    buyerRequirements:
      'Upload pesticide usage record by Oct 30th. Must be organic-certified pesticides.',
    currentMilestoneToUpdate: 'Growing',
  },
  {
    id: 'C-102',
    buyerName: 'Local Mill Co.',
    cropType: 'Wheat (Durum)',
    price: '$9,500 Total',
    timeline: 'Est. Harvest: Oct 30, 2025',
    milestones: [
      { id: 1, name: 'Contract Accepted', status: 'completed' },
      { id: 2, name: 'Sowing', status: 'in_progress' },
      { id: 3, name: 'Growing', status: 'pending' },
      { id: 4, name: 'Harvesting', status: 'pending' },
      { id: 5, name: 'Ready for Delivery', status: 'pending' },
    ],
    buyerRequirements: 'Send soil health report before harvesting.',
    currentMilestoneToUpdate: 'Sowing',
  },
];

export default function OngoingContractsPage() {
  const [contracts, setContracts] = useState(dummyContracts);

  const handleSubmitUpdate = (contractId) => {
    alert(`Submitting update for contract ${contractId}...`);
    // TODO: Add file/text submission logic
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Ongoing Contracts
      </h1>

      {contracts.length === 0 ? (
        <EmptyState />
      ) : (
        <ContractList contracts={contracts} onSubmitUpdate={handleSubmitUpdate} />
      )}
    </div>
  );
}
