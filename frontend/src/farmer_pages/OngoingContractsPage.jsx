// import React, { useState, useEffect, useCallback } from 'react';
// import ContractList from '../farmer_components/OngoingContracts/ContractList.jsx';
// import EmptyState from '../farmer_components/OngoingContracts/EmptyState.jsx';
// import { useAuthStore } from '../authStore';
// import { Loader2, XCircle } from 'lucide-react'; 
// // Removed Modal-specific icons like X, Camera

// // --- Modal Component Has Been REMOVED ---

// export default function OngoingContractsPage() {
//   const [contracts, setContracts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false); // <-- ADDED for global submit loading
//   const token = useAuthStore((state) => state.token);

//   // Modal state is no longer needed
//   // const [updatingMilestone, setUpdatingMilestone] = useState(null); // <-- REMOVED

//   const fetchOngoingContracts = useCallback(async () => {
//     if (!token) return; 
    
//     // Only show full-page loader on the very first load
//     if (contracts.length === 0) setLoading(true); 
//     setError(null);

//     try {
//       const response = await fetch("http://localhost:8000/api/contracts/ongoing", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.detail || "Failed to fetch ongoing contracts.");
//       }
//       const data = await response.json();
      
//       const formattedContracts = data.map(item => {
//         const mappedMilestones = item.milestones.map(m => ({
//           id: m.id,
//           name: m.name,
//           status: m.payment_released ? 'completed' : (m.is_complete ? 'in_progress' : 'pending')
//         }));
        
//         const nextMilestone = mappedMilestones.find(m => m.status === 'pending');
//         const inProgressMilestone = mappedMilestones.find(m => m.status === 'in_progress');

//         return {
//           id: item.id,
//           buyerName: item.buyer.full_name,
//           cropType: item.listing.crop_type,
//           price: `₹${parseFloat(item.total_value).toLocaleString('en-IN')} Total`,
//           timeline: `Est. Harvest: ${new Date(item.listing.harvest_date).toLocaleDateString('en-IN')}`,
//           milestones: mappedMilestones, 
//           fullMilestones: item.milestones, 
//           buyerRequirements: 'Submit milestone evidence for buyer approval.', 
//           currentMilestoneToUpdate: nextMilestone ? nextMilestone.name : (inProgressMilestone ? inProgressMilestone.name : 'Awaiting Final Approval'),
//         };
//       });
//       setContracts(formattedContracts);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, contracts.length]); 

//   useEffect(() => {
//     fetchOngoingContracts();
//   }, [fetchOngoingContracts]); // fetchOngoingContracts is stable due to useCallback


//   // --- UPDATED SUBMIT HANDLER ---
//   // This function now contains all the API logic and is called directly by your
//   // ContractList component, which must pass the 'updateText' up.
//   const handleSubmitUpdate = async (contractId, updateText) => {
//     // 1. Find the contract and the specific milestone to update
//     const contract = contracts.find(c => c.id === contractId);
//     if (!contract) return;
    
//     const milestoneToUpdate = contract.fullMilestones.find(m => 
//       !m.is_complete && !m.payment_released // Finds the first 'pending' milestone
//     );
    
//     if (!milestoneToUpdate) {
//       alert("All milestones for this contract are already completed or in progress.");
//       return;
//     }
    
//     if (!updateText || updateText.trim() === "") {
//         alert("Please provide an update message.");
//         return;
//     }

//     // 2. Set loading state
//     setIsSubmitting(true);
//     setError(null);

//     try {
//       // 3. Prepare payload (image is optional and now null)
//       const updatePayload = {
//         update_text: updateText,
//         image_url: null, // Set to null as requested
//       };

//       // 4. Call the backend PATCH route
//       const response = await fetch(`http://localhost:8000/api/milestones/${milestoneToUpdate.id}/complete`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(updatePayload)
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.detail || "Failed to submit update.");
//       }

//       // 5. Success! Show alert and refresh all contract data
//       alert("Milestone updated successfully! The buyer has been notified.");
//       fetchOngoingContracts(); // Re-fetch data to show the new "in_progress" status

//     } catch (err) {
//       setError(err.message);
//       alert(`Error: ${err.message}`); // Show error in a popup
//     } finally {
//       setIsSubmitting(false); // Release loading state
//     }
//   };

//   // --- Render Function ---
//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="animate-spin text-green-600" size={48} />
//           <p className="ml-4 text-gray-600">Loading ongoing contracts...</p>
//         </div>
//       );
//     }

//     // This error is only for the *initial page load*
//     if (error && contracts.length === 0) {
//        return (
//         <div className="flex justify-center items-center h-64 bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
//           <XCircle size={24} className="mr-3" /> 
//           <div>
//             <p className="font-semibold">Error Loading Contracts</p>
//             <p className="text-sm">{error}</p>
//           </div>
//         </div>
//       );
//     }

//     if (contracts.length === 0) {
//       return <EmptyState />;
//     }

//     return (
//       // Pass the isSubmitting prop down to ContractList.
//       // Your ContractList component can use this to disable its button/textarea.
//       <ContractList 
//         contracts={contracts} 
//         onSubmitUpdate={handleSubmitUpdate}
//         isSubmitting={isSubmitting} 
//       />
//     );
//   }

//   return (
//     <div className="p-6 md:p-8">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">
//         Ongoing Contracts
//       </h1>
      
//       {/* Any submit error (not load error) can be displayed here */}
//       {error && contracts.length > 0 && (
//          <div className="mb-4 flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
//           <XCircle size={24} className="mr-3 flex-shrink-0" /> 
//           <div>
//             <p className="font-semibold">An Error Occurred</p>
//             <p className="text-sm">{error}</p>
//           </div>
//         </div>
//       )}

//       {renderContent()}

//       {/* --- The Modal has been REMOVED --- */}
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../authStore';
import { Loader2, X, AlertCircle, CheckCircle, Truck } from 'lucide-react';
import { supabase } from '../supabaseClient';

/**
 * This file contains the complete logic for the Farmer's Ongoing Contracts page.
 * It now includes the correct data fetching, and the UI logic for milestone updates and logistics redirection.
*/

// --- Reusable UI Components ---

const MilestoneStep = ({ name, status }) => {
    const isCompleted = status === 'completed';
    const isInProgress = status === 'in_progress';
    return (
        <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${isCompleted ? 'bg-green-600' : (isInProgress ? 'border-2 border-blue-500 bg-blue-100' : 'border-2 border-gray-300 bg-white')}`}>
                {isCompleted && <CheckCircle size={18} className="text-white" />}
            </div>
            <p className={`font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>{name}</p>
        </div>
    );
};

const UpdateMilestoneModal = ({ milestone, onClose, onUpdateSuccess, token }) => {
    const navigate = useNavigate();
    const [updateText, setUpdateText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isDeliveryMilestone = milestone.name.toLowerCase().includes('harvest') || milestone.name.toLowerCase().includes('delivery');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            let imageUrl = null;
            if (imageFile) {
                const fileName = `${Date.now()}-${imageFile.name}`;
                const { error: uploadError } = await supabase.storage.from("CropImages").upload(`MilestoneProof/${fileName}`, imageFile);
                if (uploadError) throw new Error(uploadError.message);
                const { data: urlData } = supabase.storage.from("CropImages").getPublicUrl(`MilestoneProof/${fileName}`);
                imageUrl = urlData.publicUrl;
            }

            const updatePayload = { update_text: updateText, image_url: imageUrl };
            
            const response = await fetch(`http://localhost:8000/api/milestones/${milestone.id}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to submit update.");
            }
            onUpdateSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Update: {milestone.name}</h2>
                    <button type="button" onClick={onClose}><X size={24} /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Update Message</label>
                        <textarea rows={3} value={updateText} onChange={(e) => setUpdateText(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., 'Harvesting is complete.'" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Proof Image (Optional)</label>
                        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className="mt-1 w-full text-sm" accept="image/*" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <footer className="flex justify-between items-center p-4 bg-gray-50 rounded-b-lg">
                    {isDeliveryMilestone ? (
                        <button 
                            type="button" 
                            onClick={() => navigate('/farmer/logistics')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                        >
                            <Truck size={16} /> Book Transport
                        </button>
                    ) : (
                        <div /> 
                    )}
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white font-medium rounded-md disabled:bg-gray-400">
                        {isSubmitting ? <Loader2 className="animate-spin"/> : "Submit Update"}
                    </button>
                </footer>
            </form>
        </div>
    );
};

const ContractCard = ({ contract, onUpdateMilestone }) => {
    const nextMilestoneToUpdate = contract.fullMilestones.find(m => !m.is_complete);

    return (
        <div className="bg-white rounded-lg shadow-sm border p-5 space-y-4 flex flex-col">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">{contract.cropType}</h3>
                    <p className="text-sm text-gray-500">with {contract.buyerName}</p>
                </div>
                <p className="font-semibold text-gray-800">{contract.price}</p>
            </div>
            <div className="flex-grow">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Milestones</h4>
                <div className="space-y-3">
                    {contract.milestones.map(m => <MilestoneStep key={m.id} {...m} />)}
                </div>
            </div>
            <div className="flex justify-end border-t pt-4 mt-4">
                 <button 
                    onClick={() => onUpdateMilestone(nextMilestoneToUpdate)} 
                    disabled={!nextMilestoneToUpdate}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    {nextMilestoneToUpdate ? 'Submit Update' : 'Completed'}
                </button>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function OngoingContractsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingMilestone, setUpdatingMilestone] = useState(null);
    const token = useAuthStore((state) => state.token);

    // FIX: The logic for fetching and formatting contract data is restored here.
    const fetchOngoingContracts = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/contracts/ongoing", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch ongoing contracts.");
            const data = await response.json();
            
            const formattedContracts = data.map(item => ({
                id: item.id,
                buyerName: item.buyer.full_name,
                cropType: item.listing.crop_type,
                price: `₹${parseFloat(item.total_value).toLocaleString('en-IN')} Total`,
                milestones: item.milestones.map(m => ({
                    id: m.id,
                    name: m.name,
                    status: m.payment_released ? 'completed' : (m.is_complete ? 'in_progress' : 'pending')
                })),
                fullMilestones: item.milestones,
            }));
            setContracts(formattedContracts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOngoingContracts();
    }, [fetchOngoingContracts]);
    
    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-green-600" size={48} /></div>;
    if (error) return <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Ongoing Contracts</h1>
            {contracts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contracts.map(contract => (
                        <ContractCard key={contract.id} contract={contract} onUpdateMilestone={setUpdatingMilestone} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg border">
                    <p className="text-gray-600">You have no ongoing contracts at the moment.</p>
                </div>
            )}

            {updatingMilestone && (
                <UpdateMilestoneModal 
                    milestone={updatingMilestone}
                    onClose={() => setUpdatingMilestone(null)}
                    onUpdateSuccess={fetchOngoingContracts}
                    token={token}
                />
            )}
        </div>
    );
}