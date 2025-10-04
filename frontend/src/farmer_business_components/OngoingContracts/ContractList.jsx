import React from 'react';
import ContractCard from './ContractCard';

// --- 1. ACCEPT isSubmitting PROP ---
export default function ContractList({ contracts, onSubmitUpdate, isSubmitting }) {
  return (
    <div className="space-y-8">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onSubmitUpdate={onSubmitUpdate}
          isSubmitting={isSubmitting} // <-- 2. PASS PROP DOWN
        />
      ))}
    </div>
  );
}