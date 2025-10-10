import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../authStore";
import { Loader2, Inbox, ArrowLeft, X, AlertCircle, Sparkles } from "lucide-react";
import NegotiationChatModal from "../farmer_business_components/NegotiationChatModal";
import ProposalCard from "../farmer_business_components/BuyerProposalPage/ProposalCard"; // <-- Import new card
import { API_BASE_URL } from "../api/apiConfig";

// API helpers can stay here or be moved to their own api file
const fetchProposalsForListing = async (listingId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/contracts/listing/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch proposals.");
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
};

const AIRecommendation = ({ analysis, isLoading, error }) => {
    // This component can stay here or be moved to its own file
    if (isLoading) return <div className="p-4 bg-blue-50 border rounded-lg flex items-center"><Loader2 className="animate-spin text-blue-600 mr-3" /> <p>Sahayak is analyzing...</p></div>;
    if (error) return <div className="p-4 bg-red-50 border rounded-lg flex items-center"><AlertCircle className="text-red-600 mr-3" /> <p>{error}</p></div>;
    if (!analysis) return null;
    return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
                <Sparkles size={24} className="text-green-600 mr-3 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-green-800">AI Recommendation</h3>
                    <p className="text-gray-700 mt-1">{analysis.reason}</p>
                    {analysis.best_proposal_id && <p className="text-xs text-gray-500 mt-2">Proposal #{analysis.best_proposal_id} is highlighted below.</p>}
                </div>
            </div>
        </div>
    );
};

export default function BuyerProposalsPage() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [submittingId, setSubmittingId] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const [negotiatingProposal, setNegotiatingProposal] = useState(null);

    const { listingId } = useParams();
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

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

    const handleReject = async (id) => {
        setSubmittingId(id);
        try {
            await rejectProposalApi(id, token);
            loadProposals(); // Reload the list
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setSubmittingId(null);
        }
    };

    const handleAnalyzeProposals = async () => {
        setIsAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/croplists/${listingId}/analyze-proposals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to get AI analysis.");
            }
            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            setAnalysisError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderContent = () => {
        if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" size={48} /></div>;
        if (pageError) return <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center"><X size={24} className="mr-2" /> {pageError}</div>;
        if (proposals.length === 0) return (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <Inbox size={48} className="text-gray-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">No Pending Proposals</h3>
                <p className="text-gray-500">There are no new proposals for this listing.</p>
            </div>
        );

        return (
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Need help choosing?</h3>
                            <p className="text-sm text-gray-500">Let Sahayak analyze these proposals for you.</p>
                        </div>
                        <button onClick={handleAnalyzeProposals} disabled={isAnalyzing} className="px-5 py-2 rounded-md bg-blue-600 text-sm font-medium text-white shadow-sm hover:bg-blue-700 flex items-center disabled:bg-blue-300">
                            {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={16} className="mr-2" />Analyze</>}
                        </button>
                    </div>
                    <AIRecommendation analysis={analysis} isLoading={isAnalyzing} error={analysisError} />
                </div>
                {proposals.map((proposal) => (
                    <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        analysis={analysis}
                        submittingId={submittingId}
                        onReject={handleReject}
                        onNegotiate={setNegotiatingProposal}
                        onActionSuccess={loadProposals}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8">
            <button onClick={() => navigate("/farmer/listings")} className="mb-6 flex items-center text-green-600 hover:text-green-800 font-medium">
                <ArrowLeft size={18} className="mr-1.5" /> Back to My Listings
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Proposals for Listing #{listingId}</h1>
            {renderContent()}
            {negotiatingProposal && (
                <NegotiationChatModal
                    proposal={negotiatingProposal}
                    onClose={() => setNegotiatingProposal(null)}
                    onOfferUpdated={loadProposals}
                />
            )}
        </div>
    );
}