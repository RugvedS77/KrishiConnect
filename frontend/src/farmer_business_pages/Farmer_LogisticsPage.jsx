import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Loader2, AlertTriangle, PackageSearch } from 'lucide-react';
import FarmerLogisticsView from '../farmer_business_components/Logistics/FarmerView';
import { useAuthStore } from '../authStore';
import { API_BASE_URL } from '../api/apiConfig';  

export default function FarmLogisticsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = useAuthStore((state) => state.token);

    const fetchContracts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/contracts/ongoing`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to fetch ongoing contracts.");
            }
            const data = await response.json();
            setContracts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm">
                    <Loader2 className="animate-spin text-green-600" size={48} />
                    <p className="mt-4 text-lg font-medium text-gray-600">Loading your contracts...</p>
                    <p className="text-gray-500">Please wait a moment.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-xl shadow-md" role="alert">
                    <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-3" />
                        <div>
                            <p className="font-bold">Something went wrong</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchContracts}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (contracts.length === 0) {
            return (
                <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-200">
                    <PackageSearch className="mx-auto h-16 w-16 text-gray-400" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-800">No Ongoing Contracts Found</h2>
                    <p className="mt-2 text-gray-500">
                        When a business accepts your bid, the contract will appear here to manage its logistics.
                    </p>
                </div>
            );
        }

        // Main view for active contracts
        return <FarmerLogisticsView contracts={contracts} setContracts={setContracts} token={token} />;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
                {/* --- Header --- */}
                <header className="pb-6 mb-8 ">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                            <Truck className="h-8 w-8 text-green-700" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                Logistics & Transport
                            </h1>
                            <p className="text-lg text-gray-600 mt-1">
                                Book and manage shipments for your accepted contracts.
                            </p>
                        </div>
                    </div>
                </header>

                {/* --- Main Content --- */}
                <main>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
