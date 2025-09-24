import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Loader2 } from 'lucide-react';
import FarmerLogisticsView from '../farmer_components/Logistics/FarmerView';
// In a real app, you would import your auth store to get the token
import { useAuthStore } from '../authStore';

export default function FarmLogisticsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = useAuthStore((state) => state.token);

    const fetchContracts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:8000/api/contracts/ongoing', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (!response.ok) throw new Error("Failed to fetch ongoing contracts.");
            const data = await response.json();
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
                    Logistics & Transport
                </h1>
                <p className="text-gray-600 mt-2">Book and manage shipments for your accepted contracts.</p>
            </header>
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>
            ) : error ? (
                <p className="text-center text-red-600">{error}</p>
            ) : (
                <FarmerLogisticsView contracts={contracts} setContracts={setContracts} token={token} />
            )}
        </div>
    );
}