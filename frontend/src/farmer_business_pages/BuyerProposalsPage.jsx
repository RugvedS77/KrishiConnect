import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../authStore";
import {
  Loader2,
  Inbox,
  ArrowLeft,
  Check,
  X,
  Signature,
  AlertCircle,
  Sparkles, // <-- Added from AI feature
  MessagesSquare
} from "lucide-react";
import NegotiationChatModal from "../farmer_business_components/NegotiationChatModal";
import { API_BASE_URL } from "../api/apiConfig";

// --- API Helper functions (From Original File) ---

const fetchProposalsForListing = async (listingId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/contracts/listing/${listingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch proposals for this listing.");
  }
  return await response.json();
};

const acceptProposalApi = async (contractId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to accept proposal.");
  }
  return await response.json();
};

const rejectProposalApi = async (contractId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to reject proposal.");
  }
  return { id: contractId };
};

// --- NEW API Helper for updating an offer during negotiation ---
const updateOfferApi = async (contractId, offerData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/update-offer`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(offerData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to update offer.");
  }
  return await response.json();
};

// --- Signature Uploader Component (From Original File) ---
const SimpleSignatureUploader = ({ onSave }) => {
  const [filePreview, setFilePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));
      onSave(file); // Pass the file object up
    }
  };

  return (
    <div className="w-full">
      {!filePreview ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <Signature size={32} className="text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Upload Signature Image</span>
          <input type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
        </label>
      ) : (
        <div className="w-full text-center border-2 border-dashed rounded-md p-4 bg-green-50">
          <p className="text-sm font-medium text-green-800 mb-2">Signature Attached:</p>
          <img src={filePreview} alt="Signature Preview" className="max-h-28 border bg-white p-1 rounded-md mx-auto" />
        </div>
      )}
    </div>
  );
};


// --- Contract Signing Modal Component (From Original File) ---
const ContractSigningModal = ({ proposal, onClose, onConfirm, isLoading, error, setSignatureFile }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Confirm & Accept Contract</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200" disabled={isLoading}>
            <X size={24} />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <p className="text-gray-600">You are about to enter a binding contract with <strong className="text-gray-900">{proposal.buyerName}</strong> for your listing: <strong className="text-gray-900">{proposal.cropType}</strong>.</p>

          {/* Summary */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between"><span className="text-gray-500">Price Offered:</span> <strong className="text-gray-900">{proposal.priceOffered}</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">Quantity:</span> <strong className="text-gray-900">{proposal.quantityRequested}</strong></div>
          </div>

          {/* Signature Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Add Your Signature</label>
            <p className="text-xs text-gray-500">Please provide your digital signature (image) to finalize this contract.</p>
            <SimpleSignatureUploader onSave={setSignatureFile} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start space-x-2 bg-red-50 text-red-700 p-3 rounded-md">
              <AlertCircle size={20} className="flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        <footer className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-lg">
          <button onClick={onClose} disabled={isLoading} className="px-5 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-md border border-transparent bg-green-600 text-sm font-medium text-white shadow-sm hover:bg-green-700 flex items-center justify-center min-w-[150px] disabled:bg-green-300"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm & Accept'}
          </button>
        </footer>
      </div>
    </div>
  );
};

// --- NEW Component: AI Recommendation Display (From New Feature) ---
// --- NEW: Component to display the AI recommendation ---
const AIRecommendation = ({ analysis, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
        <Loader2 className="animate-spin text-blue-600 mr-3" />
        <p className="text-blue-700 font-medium">Sahayak is analyzing the proposals...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
        <AlertCircle className="text-red-600 mr-3" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }
  if (!analysis) return null;

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-start">
        <Sparkles size={24} className="text-green-600 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-green-800">AI Recommendation</h3>
          <p className="text-gray-700 mt-1">{analysis.reason}</p>

          {/* --- THIS LOGIC IS NOW CONDITIONAL --- */}
          {analysis.best_proposal_id ? (
            <p className="text-xs text-gray-500 mt-2">
              Proposal #{analysis.best_proposal_id} is highlighted below.
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              No specific proposal was highlighted.
            </p>
          )}
          {/* --- END OF CHANGE --- */}

        </div>
      </div>
    </div>
  );
};


// --- Main Component (MERGED) ---
export default function BuyerProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // --- State from Original File ---
  const [submittingId, setSubmittingId] = useState(null); // For loading spinners
  const [proposalToSign, setProposalToSign] = useState(null); // Holds proposal for modal
  const [farmerSignature, setFarmerSignature] = useState(null); // Holds signature file
  const [modalError, setModalError] = useState(null); // Error for inside the modal

  // --- NEW STATE from AI Feature ---
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  // -----------------

  // --- NEW STATE for Negotiation Chat ---
  const [negotiatingProposal, setNegotiatingProposal] = useState(null);

  const { listingId } = useParams();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  // Load proposals logic (Unchanged)
  const loadProposals = useCallback(async () => {
    if (!token || !listingId) return;
    try {
      setLoading(true);
      setPageError(null);
      const data = await fetchProposalsForListing(listingId, token);
      const pendingProposals = data.filter(p => p.status === 'pending_farmer_approval');

      const formattedProposals = pendingProposals.map(proposal => ({
        id: proposal.id,
        buyerName: proposal.buyer.full_name || proposal.buyer.email,
        buyerInfo: `User ID: ${proposal.buyer.id}`,
        cropType: proposal.listing.crop_type,
        priceOffered: `₹${parseFloat(proposal.price_per_unit_agreed).toLocaleString('en-IN')} per ${proposal.listing.unit}`,
        quantityRequested: `${proposal.quantity_proposed} ${proposal.listing.unit}`,
        deliveryDate: new Date(proposal.listing.harvest_date).toLocaleDateString('en-IN'),
        paymentTerms: proposal.payment_terms.replace(/-/g, ' ')
      }));
      setProposals(formattedProposals);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, listingId]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  // --- Handlers from Original File (Unchanged) ---

  // This just OPENS the modal
  const handleAcceptClick = (proposal) => {
    setProposalToSign(proposal); // Set the proposal to be signed
    setFarmerSignature(null);      // Clear any old signature
    setModalError(null);           // Clear any old modal errors
  };

  // This is the actual API call from the modal
  const handleConfirmAccept = async () => {
    if (!proposalToSign) return;

    if (!farmerSignature) {
      setModalError("Please provide your signature to accept the contract.");
      return;
    }

    setModalError(null);
    setSubmittingId(proposalToSign.id); // This will show spinner in the modal button

    try {
      // TODO: Upload farmerSignature to Supabase here
      // const signatureUrl = await uploadSignature(farmerSignature);
      // await addSignatureToContractApi(proposalToSign.id, signatureUrl, token);

      // Call the accept API
      await acceptProposalApi(proposalToSign.id, token);

      setProposals((prev) => prev.filter((p) => p.id !== proposalToSign.id));
      alert("Proposal accepted! This is now an ongoing contract.");
      setProposalToSign(null); // Close modal
      setFarmerSignature(null);

    } catch (err) {
      setModalError(err.message); // Show error IN THE MODAL
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  // Reject logic
  const handleReject = async (id) => {
    setSubmittingId(id); // Shows spinner on card button
    try {
      await rejectProposalApi(id, token);
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingId(null);
    }
  };

  // --- NEW Function: Call the AI Proposal Analyzer (From New Feature) ---
  const handleAnalyzeProposals = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError(null);
    try {
      // Calls the new backend route
      const response = await fetch(`${API_BASE_URL}/api/croplists/${listingId}/analyze-proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to get AI analysis.");
      }
      const data = await response.json(); // This is ProposalAnalysis schema
      setAnalysis(data);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };


  // --- Render Content Function (MERGED) ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-600" size={48} />
          <p className="ml-4 text-gray-600">Loading proposals...</p>
        </div>
      );
    }

    if (pageError) {
      return (
        <div className="flex justify-center items-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
          <X size={24} className="mr-2" /> {pageError}
        </div>
      );
    }

    if (proposals.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <Inbox size={48} className="text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-800">No Pending Proposals</h3>
          <p className="text-gray-500">There are no new proposals for this listing.</p>
        </div>
      );
    }

    // This return block now includes the AI feature
    return (
      <div className="space-y-6">
        {/* --- NEW: AI Analyzer Button and Display (From New Feature) --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Need help choosing?</h3>
              <p className="text-sm text-gray-500">Let your AI assistant, Sahayak, analyze these proposals for you.</p>
            </div>
            <button
              onClick={handleAnalyzeProposals}
              disabled={isAnalyzing}
              className="mt-2 md:mt-0 px-5 py-2 rounded-md border border-transparent bg-blue-600 text-sm font-medium text-white shadow-sm hover:bg-blue-700 flex items-center justify-center min-w-[150px] disabled:bg-blue-300"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={16} className="mr-2" />Analyze Proposals</>}
            </button>
          </div>
          <AIRecommendation analysis={analysis} isLoading={isAnalyzing} error={analysisError} />
        </div>

        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            // --- MODIFIED: Highlights the recommended proposal ---
            className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 relative ${analysis && proposal.id === analysis.best_proposal_id
                ? 'ring-2 ring-offset-2 ring-green-500'
                : 'hover:shadow-lg'
              }`}
          >
            {/* --- NEW: Adds a badge if recommended --- */}
            {analysis && proposal.id === analysis.best_proposal_id && (
              <div className="absolute top-0 right-4 bg-green-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-b-md">
                AI Recommended
              </div>
            )}

            {/* --- Rest of the card is from Original File --- */}
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-green-700">{proposal.buyerName}</h2>
              <p className="text-sm text-gray-500">{proposal.buyerInfo}</p>
            </div>

            {/* --- MODIFIED: Action Buttons --- */}
            <div className="bg-gray-50 p-4 flex justify-end space-x-2 md:space-x-4">
              <button
                type="button"
                onClick={() => setNegotiatingProposal(proposal)} // <-- Open chat modal
                disabled={submittingId === proposal.id}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
              >
                <MessagesSquare size={16} className="mr-2" />
                Negotiate
              </button>
              <button
                type="button"
                onClick={() => handleReject(proposal.id)}
              // ... existing reject button props ...
              >
                {submittingId === proposal.id ? <Loader2 className="animate-spin" size={20} /> : 'Reject'}
              </button>
              <button
                type="button"
                onClick={() => handleAcceptClick(proposal)}
              // ... existing accept button props ...
              >
                <Check size={20} className="mr-1" />
                Accept
              </button>
            </div>

            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Crop</p>
                <p className="text-lg font-medium text-gray-900">{proposal.cropType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Offered</p>
                <p className="text-lg font-medium text-gray-900">{proposal.priceOffered}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity</p>
                <p className="text-lg font-medium text-gray-900">{proposal.quantityRequested}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery By</p>
                <p className="text-lg font-medium text-gray-900">{proposal.deliveryDate}</p>
              </div>
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Terms</p>
                <p className="text-lg font-medium text-gray-900 capitalize">{proposal.paymentTerms}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => handleReject(proposal.id)}
                disabled={submittingId === proposal.id}
                className="px-5 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {submittingId === proposal.id ? <Loader2 className="animate-spin" size={20} /> : 'Reject'}
              </button>
              <button
                type="button"
                onClick={() => handleAcceptClick(proposal)}
                disabled={submittingId === proposal.id}
                className="px-5 py-2 rounded-md border border-transparent bg-green-600 text-sm font-medium text-white shadow-sm hover:bg-green-700 flex items-center justify-center min-w-[90px] disabled:bg-green-300"
              >
                <Check size={20} className="mr-1" />
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <button
        onClick={() => navigate("/farmer/buyer-proposals")}
        className="mb-6 flex items-center text-green-600 hover:text-green-800 font-medium"
      >
        <ArrowLeft size={18} className="mr-1.5" /> Back to All Listings
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Proposals for Listing #{listingId}</h1>

      {renderContent()}

      {/* --- Modal Renderer (From Original File) --- */}
      {proposalToSign && (
        <ContractSigningModal
          proposal={proposalToSign}
          onClose={() => setProposalToSign(null)}
          onConfirm={handleConfirmAccept}
          isLoading={submittingId === proposalToSign.id}
          error={modalError}
          setSignatureFile={setFarmerSignature}
        />
      )}

      {/* --- NEW: Render the Negotiation Chat Modal --- */}
      {negotiatingProposal && (
        <NegotiationChatModal
          proposal={negotiatingProposal}
          onClose={() => setNegotiatingProposal(null)}
          onOfferUpdated={loadProposals} // Reload proposals after an offer update
        />
      )}
    </div>
  );
}