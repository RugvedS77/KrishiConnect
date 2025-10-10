import React, { useState } from 'react';
import { Loader2, X, AlertCircle, Check } from 'lucide-react';
import SignatureUploader from '../../buyer_components/SignatureUploader'; // Re-using the uploader
import { API_BASE_URL } from '../../api/apiConfig';
import { useAuthStore } from '../../authStore';

const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
            <header className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Confirm & Accept Contract</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                    <X size={24} />
                </button>
            </header>
            {children}
        </div>
    </div>
);

export default function AcceptContractModal({ proposal, onClose, onSuccess }) {
    const [signatureFile, setSignatureFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token);

    const handleConfirm = async () => {
        if (!signatureFile) {
            setError("Please provide your signature to accept the contract.");
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            // Step 1: Upload the signature file
            const formData = new FormData();
            formData.append("file", signatureFile);
            
            const signatureResponse = await fetch(`${API_BASE_URL}/api/signatures/upload?role=farmer`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!signatureResponse.ok) {
                const err = await signatureResponse.json();
                throw new Error(err.detail || "Signature upload failed.");
            }
            const signatureData = await signatureResponse.json();
            const signatureUrl = signatureData.url;

            // Step 2: Accept the contract with the new URL
            const acceptResponse = await fetch(`${API_BASE_URL}/api/contracts/${proposal.id}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ farmer_signature_url: signatureUrl }),
            });

            if (!acceptResponse.ok) {
                const err = await acceptResponse.json();
                throw new Error(err.detail || "Failed to accept the contract.");
            }
            
            alert("Proposal accepted successfully!");
            onSuccess(); // This will trigger the parent component to refresh
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="p-6 space-y-4">
                <p className="text-gray-600">You are about to enter a binding contract with <strong className="text-gray-900">{proposal.buyerName}</strong> for your listing: <strong className="text-gray-900">{proposal.cropType}</strong>.</p>

                <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between"><span className="text-gray-500">Price Offered:</span> <strong className="text-gray-900">{proposal.priceOffered}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-500">Quantity:</span> <strong className="text-gray-900">{proposal.quantityRequested}</strong></div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Add Your Signature</label>
                    <p className="text-xs text-gray-500">Please provide your digital signature (image) to finalize this contract.</p>
                    <SignatureUploader onSave={setSignatureFile} />
                </div>

                {error && (
                    <div className="flex items-start space-x-2 bg-red-50 text-red-700 p-3 rounded-md">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
            </div>

            <footer className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-lg">
                <button onClick={onClose} disabled={isSubmitting} className="px-5 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-md border border-transparent bg-green-600 text-sm font-medium text-white shadow-sm hover:bg-green-700 flex items-center justify-center min-w-[150px] disabled:bg-green-300"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirm & Accept'}
                </button>
            </footer>
        </Modal>
    );
}