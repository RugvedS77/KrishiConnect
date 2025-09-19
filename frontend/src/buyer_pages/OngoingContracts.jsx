import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Banknote,
  ShieldCheck,
  MessageSquare,
  X,
  User,
  DollarSign,
  Image as ImageIcon,
  HardDriveUpload,
  CalendarDays,
  FileText,
  Loader2,
  AlertCircle,
  // --- Brain icon removed ---
} from "lucide-react";
import { useAuthStore } from "../authStore"; // Import auth store

// --- HELPER COMPONENTS (Unchanged) ---

const ProgressBar = ({ value, max, colorClass, label }) => (
  <div>
    <div className="flex justify-between items-baseline">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <p className="text-xs text-gray-500">
        ₹{parseFloat(value).toLocaleString("en-IN")} / ₹{parseFloat(max).toLocaleString("en-IN")}
      </p>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
      <div
        className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

const ImageModal = ({ src, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors">
      <X size={24} />
    </button>
    <img
      src={src}
      alt="Enlarged update"
      className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const EscrowSummary = ({ contract }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
      <ShieldCheck size={20} className="mr-2 text-green-600" />
      Escrow Summary
    </h3>
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">Total Contract Value</p>
        <p className="text-3xl font-bold text-gray-900">
          ₹{parseFloat(contract.totalValue).toLocaleString("en-IN")}
        </p>
      </div>
      <ProgressBar
        value={contract.escrowAmount}
        max={contract.totalValue}
        colorClass="bg-yellow-400"
        label="Funds Locked in Escrow"
      />
      <ProgressBar
        value={contract.amountPaid}
        max={contract.totalValue}
        colorClass="bg-green-500"
        label="Paid to Farmer"
      />
    </div>
  </div>
);

const VerticalMilestoneTracker = ({ milestones, onReleasePayment, submittingMilestoneId }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800">Milestone Progress</h3>
    <div className="mt-6">
      <ul className="relative space-y-8">
        <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
        
        {milestones.map((m) => {
          const isDone = m.done; 
          const isPaid = m.paid; 
          const isReadyForPayment = isDone && !isPaid;
          const isLoading = submittingMilestoneId === m.id;
          let circleClass = "bg-gray-300";
          if (isDone) circleClass = "bg-green-500"; 

          return (
            <li key={m.id} className="flex items-start space-x-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${circleClass} ${
                  isReadyForPayment && !isLoading ? "animate-pulse" : ""
                }`}
              >
                {isDone && <CheckCircle size={16} className="text-white" />}
              </div>
              <div className="flex-1 -mt-1">
                <p className={`font-medium ${isDone ? "text-gray-800" : "text-gray-500"}`}>
                  {m.name}
                </p>
                <p className={`text-sm ${isPaid ? "text-green-600 font-semibold" : "text-gray-500"}`}>
                  ₹{parseFloat(m.amount).toLocaleString("en-IN")} {isPaid && "(Paid)"}
                </p>
                {isReadyForPayment && (
                  <button
                    onClick={() => onReleasePayment(m.id)}
                    disabled={isLoading}
                    className="mt-2 bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-300 flex items-center justify-center w-[140px]"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Release Payment'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
const OngoingContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState(null);
  const token = useAuthStore((state) => state.token);

  const fetchOngoingContracts = useCallback(async () => {
    if (contracts.length === 0) setLoading(true);
    setError(null);
    if (!token) {
      setLoading(false);
      setError("Please log in to view contracts.");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/contracts/ongoing", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to fetch contracts");
      }
      
      const data = await response.json(); 

      const formattedContracts = data.map(item => ({
        id: item.id,
        crop: item.listing.crop_type,
        farmer: item.farmer.full_name,
        totalValue: parseFloat(item.total_value),
        escrowAmount: parseFloat(item.escrow_amount),
        amountPaid: parseFloat(item.amount_paid),
        delivery: new Date(item.listing.harvest_date).toLocaleDateString('en-IN'),
        milestones: item.milestones.map(m => ({
          id: m.id,
          name: m.name,
          amount: parseFloat(m.amount),
          done: m.is_complete,
          paid: m.payment_released,
          update_text: m.update_text,
          image_url: m.image_url,
          ai_notes: m.ai_notes, 
          created_at: m.created_at
        })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      }));
      
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

  const handleReleasePayment = async (milestoneId) => {
    setSubmittingMilestoneId(milestoneId);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/milestones/${milestoneId}/release-payment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Payment release failed");
      }
      
      alert("Payment released successfully!");
      await fetchOngoingContracts(); 
      setSelectedContract(null); 

    } catch (err) {
      setError(err.message); 
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingMilestoneId(null);
    }
  };

  const currentContract = contracts.find((c) => c.id === selectedContract?.id);

  return (
    <div className="space-y-6 bg-gray-50 p-6 md:p-8 min-h-screen">
      {modalImage && (
        <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
      )}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Ongoing Contracts</h1>
        <p className="text-gray-600 mt-1">
          Track progress and manage payments for your active agreements.
        </p>
      </header>

      {loading && (
         <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-600" size={48} />
          <p className="ml-4 text-gray-600">Loading your contracts...</p>
        </div>
      )}

      {error && (
         <div className="flex items-start h-24 bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" /> 
          <div>
            <p className="font-semibold">Error Loading Contracts</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        !currentContract ? (
          // --- CONTRACT LIST VIEW ---
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Active Agreements</h2>
            {contracts.length === 0 && (
              <p className="text-gray-500">You have no ongoing contracts.</p>
            )}
            {contracts.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedContract(c)}
                className="p-5 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-green-500 transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-green-700">{c.crop}</h3>
                    <p className="text-sm text-gray-500">with {c.farmer}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-lg text-gray-800">
                      ₹{c.totalValue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center justify-end">
                      <CalendarDays size={14} className="mr-1.5" /> Due: {c.delivery}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar
                    value={c.amountPaid}
                    max={c.totalValue}
                    colorClass="bg-green-500"
                    label="Payment Progress"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // --- CONTRACT DETAIL VIEW ---
          <div>
            <button
              onClick={() => setSelectedContract(null)}
              className="flex items-center text-green-700 font-semibold hover:underline mb-4"
            >
              <ArrowLeft size={18} className="mr-1" /> Back to All Contracts
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-3xl font-bold text-gray-900">{currentContract.crop}</h2>
                  <p className="text-lg text-gray-600">with {currentContract.farmer}</p>
                </div>

                {/* Farmer Updates Timeline (built from milestones) */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold flex items-center text-gray-800">
                    <MessageSquare size={18} className="mr-2 text-green-600" />
                    Farmer Updates & Milestones
                  </h3>
                  <div className="mt-4 relative space-y-6">
                    <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-0.5 bg-gray-200 z-0"></div>
                    
                    {currentContract.milestones.filter(m => m.update_text || m.image_url).length === 0 && (
                      <p className="text-sm text-gray-500">No updates from the farmer yet.</p>
                    )}

                    {currentContract.milestones.map((milestone, idx) => (
                      (milestone.update_text || milestone.image_url) && (
                        <div key={idx} className="relative flex items-start space-x-4 z-10">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <HardDriveUpload size={14} className="text-white"/>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-md border flex-1">
                            <p className="text-xs font-semibold text-gray-500">
                              {new Date(milestone.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-base font-semibold text-gray-700 mt-2">{milestone.name}</p>
                            <p className="text-gray-700 mt-1">{milestone.update_text}</p>
                            {milestone.image_url && (
                              <div
                                onClick={() => setModalImage(milestone.image_url)}
                                className="mt-3 rounded-lg w-full h-64 bg-cover bg-center cursor-pointer group relative"
                                style={{ backgroundImage: `url(${milestone.image_url})` }}
                              >
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ImageIcon size={32} className="text-white"/>
                                </div>
                              </div>
                            )}

                            {/* --- AI NOTES BLOCK REMOVED --- */}
                            
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <EscrowSummary contract={currentContract} />
                <VerticalMilestoneTracker
                  milestones={currentContract.milestones}
                  onReleasePayment={handleReleasePayment}
                  submittingMilestoneId={submittingMilestoneId}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default OngoingContracts;