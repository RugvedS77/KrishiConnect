import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ContractList from '../farmer_business_components/OngoingContracts/ContractList.jsx';
import EmptyState from '../farmer_business_components/OngoingContracts/EmptyState.jsx';
import { useAuthStore } from '../authStore';
import { Loader2, XCircle, Printer, CheckCircle } from 'lucide-react'; 
import { API_BASE_URL } from "../api/apiConfig";
import './print.css';


export default function OngoingContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingContractId, setSubmittingContractId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const token = useAuthStore((state) => state.token);
  const location = useLocation(); 

  const newlyAcceptedContractId = location.state?.newlyAcceptedContractId;

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      // Clear the state from location to prevent message from showing on refresh
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const fetchOngoingContracts = useCallback(async () => {
    if (!token) return;

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
  }, [fetchOngoingContracts]);

  const handleSubmitUpdate = async (contractId, updateText) => {
    const contract = contracts.find(c => c.id === contractId); //
    if (!contract) return;

    const milestoneToUpdate = contract.fullMilestones.find(m =>
      !m.is_complete && !m.payment_released
    ); //

    if (!milestoneToUpdate) {
      alert("All milestones for this contract are already completed or in progress.");
      return;
    }

    if (!updateText || updateText.trim() === "") {
      alert("Please provide an update message.");
      return;
    }

    // --- CHANGE 1: Use the correct state setter and pass the contractId ---
    setSubmittingContractId(contractId);
    setError(null);

    try {
      const updatePayload = {
        update_text: updateText,
        image_url: null,
      };

      const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneToUpdate.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      }); //

      if (!response.ok) {
        const errData = await response.json();
        const errorMessage = errData.detail || "Not Found"; 
        throw new Error(errorMessage);
      } //

      alert("Milestone updated successfully! The buyer has been notified.");
      await fetchOngoingContracts();

    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`); 
    } finally {
      // --- CHANGE 2: Reset the state to null when submission is complete ---
      setSubmittingContractId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-600" size={48} />
          <p className="ml-4 text-gray-600">Loading ongoing contracts...</p>
        </div>
      );
    }

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

    // --- CHANGE 3: Pass the correct prop to the child component ---
    return (
      <ContractList
        contracts={contracts}
        onSubmitUpdate={handleSubmitUpdate}
        submittingContractId={submittingContractId}
        newlyAcceptedContractId={newlyAcceptedContractId}
      />
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Ongoing Contracts
        </h1>
        <button
          onClick={handlePrint}
          className="no-print flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <Printer size={18} />
          <span>Print</span>
        </button>
      </div>

      {successMessage && (
        <div className="no-print mb-4 flex items-start bg-green-50 text-green-800 p-4 rounded-lg shadow-sm border border-green-200">
          <CheckCircle size={24} className="mr-3 flex-shrink-0" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {error && contracts.length > 0 && (
        <div className="no-print mb-4 flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          <XCircle size={24} className="mr-3 flex-shrink-0" />
          <div>
            <p className="font-semibold">An Error Occurred</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {renderContent()}

    </div>
  );
}