// src/buyer_pages/Buyer_LogisticsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Loader2 } from 'lucide-react';
import BuyerView from '../buyer_components/Logistics/BuyerView';
// In a real app, you would import your auth store
import { useAuthStore } from '../authStore';
import { API_BASE_URL } from "../api/apiConfig";

export default function BuyLogisticsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = useAuthStore((state) => state.token);

    const fetchContracts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // This endpoint fetches all ongoing contracts for the logged-in user (buyer or farmer)
            const response = await fetch(`${API_BASE_URL}/api/contracts/ongoing`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (!response.ok) throw new Error("Failed to fetch ongoing contracts.");
            const data = await response.json();
            console.log("Fetched data",data)
            setContracts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    return (
        <div className="p-6 md:p-8">
            <header className="mb-8">
                 <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Truck className="mr-3 text-green-600"/>
                    Shipment Tracking
                </h1>
                <p className="text-gray-600 mt-2">Track the status of your incoming shipments from farmers.</p>
            </header>
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>
            ) : error ? (
                <p className="text-center text-red-600">{error}</p>
            ) : (
                <BuyerView contracts={contracts}
                setContracts={setContracts}
                 token={token} />
            )}
        </div>
    );
}