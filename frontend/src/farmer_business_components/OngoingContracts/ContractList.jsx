import React from 'react';
import ContractCard from './ContractCard';

// 1. Accept 'newlyAcceptedContractId' as a prop
export default function ContractList({ contracts, onSubmitUpdate, isSubmitting, newlyAcceptedContractId }) {
  return (
    <div className="space-y-8">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onSubmitUpdate={onSubmitUpdate}
          isSubmitting={isSubmitting}
          // 2. Pass a new 'isNew' prop down to the card
          // This is true only if the contract's ID matches the new one
          isNew={contract.id === newlyAcceptedContractId}
        />
      ))}
    </div>
  );
}