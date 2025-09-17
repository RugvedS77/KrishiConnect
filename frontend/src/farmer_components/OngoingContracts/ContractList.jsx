import React from 'react';
import ContractCard from './ContractCard';

export default function ContractList({ contracts, onSubmitUpdate }) {
  return (
    <div className="space-y-8">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onSubmitUpdate={onSubmitUpdate}
        />
      ))}
    </div>
  );
}
