import React, { useState } from 'react';
import { Loader2, X, CheckCircle, Calendar, MapPin, ArrowRight, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from './apiConfig';

// --- Reusable UI Components ---

const ShipmentStatusTracker = ({ status }) => {
    const statuses = ["Booked", "In Transit", "Out for Delivery", "Delivered"];
    const currentStatusIndex = statuses.indexOf(status);

    return (
        <div className="w-full my-4">
            <div className="flex justify-between">
                {statuses.map((s, index) => (
                    <div key={s} className="flex-1 text-center">
                        <div className={`mx-auto w-4 h-4 rounded-full ${index <= currentStatusIndex ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <p className={`mt-2 text-xs font-medium ${index <= currentStatusIndex ? 'text-green-600' : 'text-gray-400'}`}>{s}</p>
                    </div>
                ))}
            </div>
            <div className="bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}></div>
            </div>
        </div>
    );
};

const InfoPill = ({ icon, text }) => (
    <div className="flex items-center text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
        {icon}
        <span className="ml-2">{text}</span>
    </div>
);

const BookingModal = ({ contract, milestone, onClose, onBookingSuccess, token }) => {
    const [quote, setQuote] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [vehicleType, setVehicleType] = useState('Tata Ace');

    const handleGetQuote = async () => {
        setIsLoading(true);
        setError('');
        try {
            // FIX: The API call now correctly uses the milestone ID
            const response = await fetch(`${API_BASE_URL}/api/logistics/milestone/${milestone.id}/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    pickup_address: contract.listing.location,
                    dropoff_address: "Buyer Warehouse (Placeholder)",
                    vehicle_type: vehicleType,
                }),
            });
            if (!response.ok) throw new Error("Failed to get quote from the server.");
            const data = await response.json();
            setQuote(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookShipment = async () => {
        setIsLoading(true);
        setError('');
        if (!quote) {
            setError("Please get a quote before booking.");
            setIsLoading(false);
            return;
        }

        try {
            const bookingPayload = {
                quote_id: quote.quote_id,
                estimated_cost: quote.estimated_cost,
                logistics_provider: quote.logistics_provider,
            };

            // FIX: The API call now correctly uses the milestone ID
            const response = await fetch(`${API_BASE_URL}/api/logistics/milestone/${milestone.id}/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(bookingPayload)
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to book the shipment.");
            }

            const newShipment = await response.json();
            onBookingSuccess(newShipment);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Book Transport for: {milestone.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="font-semibold">{contract.listing.crop_type}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                            <MapPin size={14} className="mr-2" /> {contract.listing.location}
                            <ArrowRight size={14} className="mx-2" /> Buyer's Warehouse
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">Select Vehicle Type</label>
                        <select id="vehicle" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                            <option>Tata Ace</option>
                            <option>8ft Pickup</option>
                            <option>Truck</option>
                        </select>
                    </div>
                    {quote && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                            <p className="text-sm text-green-700">Estimated Cost:</p>
                            <p className="text-2xl font-bold text-green-800">₹{parseFloat(quote.estimated_cost).toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-500 mt-1">Provider: {quote.logistics_provider}</p>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </div>
                <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    {!quote ? (
                        <button onClick={handleGetQuote} disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                            {isLoading ? <Loader2 className="animate-spin" /> : "Get Quote"}
                        </button>
                    ) : (
                        <button onClick={handleBookShipment} disabled={isLoading} className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                           {isLoading ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default function FarmerLogisticsView({ contracts, setContracts, token }) {
    const [modalData, setModalData] = useState(null); // Will hold { contract, milestone }
    const [trackingId, setTrackingId] = useState(null);

    const handleTrackStatus = async (shipmentId) => {
        setTrackingId(shipmentId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/logistics/shipment/${shipmentId}/track`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch latest shipment status.");
            const data = await response.json();
            setContracts(prev => prev.map(c => {
                const newMilestones = c.milestones.map(m => {
                    if (m.shipment && m.shipment.id === shipmentId) {
                        return { ...m, shipment: { ...m.shipment, status: data.status } };
                    }
                    return m;
                });
                return { ...c, milestones: newMilestones };
            }));
        } catch (error) {
            alert(error.message);
        } finally {
            setTrackingId(null);
        }
    };

    const handleBookingSuccess = (newShipment) => {
        setContracts(prev => prev.map(c => {
            if (c.id === newShipment.contract_id) {
                const newMilestones = c.milestones.map(m => {
                    if (m.id === newShipment.milestone_id) {
                        return { ...m, shipment: newShipment };
                    }
                    return m;
                });
                return { ...c, milestones: newMilestones };
            }
            return c;
        }));
    };

    return (
        <div>
            {modalData && <BookingModal {...modalData} onClose={() => setModalData(null)} onBookingSuccess={handleBookingSuccess} token={token} />}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Contracts - Logistics</h2>
            <div className="space-y-4">
                {contracts.length > 0 ? contracts.map(contract => (
                    <div key={contract.id} className="bg-white p-5 rounded-lg shadow-sm border">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{contract.listing.crop_type}</h3>
                                <p className="text-sm text-gray-500">Contract #{contract.id} with {contract.buyer.full_name}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t space-y-3">
                            {contract.milestones.map(milestone => {
                                const isDeliveryMilestone = milestone.name.toLowerCase().includes('harvest') || milestone.name.toLowerCase().includes('delivery');
                                return (
                                    <div key={milestone.id} className="flex justify-between items-center">
                                        <p className="font-medium text-gray-700">{milestone.name}</p>
                                        {milestone.shipment ? (
                                            <div className="flex items-center gap-2">
                                                <InfoPill icon={<CheckCircle size={16} className="text-green-600"/>} text="Booked" />
                                                <button onClick={() => handleTrackStatus(milestone.shipment.id)} disabled={trackingId === milestone.shipment.id} className="p-2 text-gray-500 hover:text-blue-600">
                                                    {trackingId === milestone.shipment.id ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16} />}
                                                </button>
                                            </div>
                                        ) : isDeliveryMilestone ? (
                                            <button onClick={() => setModalData({ contract, milestone })} className="px-4 py-2 text-sm bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                                                Book Transport
                                            </button>
                                        ) : (
                                            <InfoPill icon={<Calendar size={16} />} text="Not a delivery milestone" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500 py-8">You have no ongoing contracts.</p>}
            </div>
        </div>
    );
};