import React from 'react';
import ProposalCard from './ProposalCard';

export default function ProposalList({ proposals, onAccept, onReject }) {
  return (
    <div className="space-y-6">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
