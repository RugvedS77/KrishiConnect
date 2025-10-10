import React, { useState, useEffect, useCallback } from 'react';
import ContractList from '../farmer_business_components/OngoingContracts/ContractList.jsx';
import EmptyState from '../farmer_business_components/OngoingContracts/EmptyState.jsx';
import { useAuthStore } from '../authStore';
import { Loader2, XCircle } from 'lucide-react'; 
// Removed Modal-specific icons like X, Camera

// --- Modal Component Has Been REMOVED ---

export default function OngoingContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- ADDED for global submit loading
  const token = useAuthStore((state) => state.token);

  // Modal state is no longer needed
  // const [updatingMilestone, setUpdatingMilestone] = useState(null); // <-- REMOVED

  const fetchOngoingContracts = useCallback(async () => {
    if (!token) return; 
    
    // Only show full-page loader on the very first load
    if (contracts.length === 0) setLoading(true); 
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/contracts/ongoing", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to fetch ongoing contracts.");
      }
      const data = await response.json();
      
      const formattedContracts = data.map(item => {
        const mappedMilestones = item.milestones.map(m => ({
          id: m.id,
          name: m.name,
          status: m.payment_released ? 'completed' : (m.is_complete ? 'in_progress' : 'pending')
        }));
        
        const nextMilestone = mappedMilestones.find(m => m.status === 'pending');
        const inProgressMilestone = mappedMilestones.find(m => m.status === 'in_progress');

        return {
          id: item.id,
          buyerName: item.buyer.full_name,
          cropType: item.listing.crop_type,
          price: `₹${parseFloat(item.total_value).toLocaleString('en-IN')} Total`,
          timeline: `Est. Harvest: ${new Date(item.listing.harvest_date).toLocaleDateString('en-IN')}`,
          milestones: mappedMilestones, 
          fullMilestones: item.milestones, 
          buyerRequirements: 'Submit milestone evidence for buyer approval.', 
          currentMilestoneToUpdate: nextMilestone ? nextMilestone.name : (inProgressMilestone ? inProgressMilestone.name : 'Awaiting Final Approval'),
        };
      });
      setContracts(formattedContracts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, contracts.length]); 

  useEffect(() => {
    fetchOngoingContracts();
  }, [fetchOngoingContracts]); // fetchOngoingContracts is stable due to useCallback


  // --- UPDATED SUBMIT HANDLER ---
  // This function now contains all the API logic and is called directly by your
  // ContractList component, which must pass the 'updateText' up.
  const handleSubmitUpdate = async (contractId, updateText) => {
    // 1. Find the contract and the specific milestone to update
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;
    
    const milestoneToUpdate = contract.fullMilestones.find(m => 
      !m.is_complete && !m.payment_released // Finds the first 'pending' milestone
    );
    
    if (!milestoneToUpdate) {
      alert("All milestones for this contract are already completed or in progress.");
      return;
    }
    
    if (!updateText || updateText.trim() === "") {
        alert("Please provide an update message.");
        return;
    }

    // 2. Set loading state
    setIsSubmitting(true);
    setError(null);

    try {
      // 3. Prepare payload (image is optional and now null)
      const updatePayload = {
        update_text: updateText,
        image_url: null, // Set to null as requested
      };

      // 4. Call the backend PATCH route
      const response = await fetch(`http://localhost:8000/api/milestones/${milestoneToUpdate.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to submit update.");
      }

      // 5. Success! Show alert and refresh all contract data
      alert("Milestone updated successfully! The buyer has been notified.");
      fetchOngoingContracts(); // Re-fetch data to show the new "in_progress" status

    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`); // Show error in a popup
    } finally {
      setIsSubmitting(false); // Release loading state
    }
  };

  // --- Render Function ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-600" size={48} />
          <p className="ml-4 text-gray-600">Loading ongoing contracts...</p>
        </div>
      );
    }

    // This error is only for the *initial page load*
    if (error && contracts.length === 0) {
       return (
        <div className="flex justify-center items-center h-64 bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          <XCircle size={24} className="mr-3" /> 
          <div>
            <p className="font-semibold">Error Loading Contracts</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (contracts.length === 0) {
      return <EmptyState />;
    }

    return (
      // Pass the isSubmitting prop down to ContractList.
      // Your ContractList component can use this to disable its button/textarea.
      <ContractList 
        contracts={contracts} 
        onSubmitUpdate={handleSubmitUpdate}
        isSubmitting={isSubmitting} 
      />
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Ongoing Contracts
      </h1>
      
      {/* Any submit error (not load error) can be displayed here */}
      {error && contracts.length > 0 && (
         <div className="mb-4 flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          <XCircle size={24} className="mr-3 flex-shrink-0" /> 
          <div>
            <p className="font-semibold">An Error Occurred</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {renderContent()}

      {/* --- The Modal has been REMOVED --- */}
    </div>
  );
}