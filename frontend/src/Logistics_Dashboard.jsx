import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Package, MapPin, ArrowRight, Loader2, X, CheckCircle, Calendar, IndianRupee } from 'lucide-react';
import { API_BASE_URL } from './apiConfig';

// --- MOCK DATA & API SIMULATION ---
// In your real app, this data would come from your API calls.
// We keep it here to ensure the component is runnable and demonstrates all states.
const MOCK_ONGOING_CONTRACTS = [
    {
        id: 1,
        listing: { crop_type: "Organic Wheat", location: "Nashik, Maharashtra" },
        buyer: { full_name: "Global Foods Inc." },
        shipment: null, // No shipment booked yet
        milestones: [{ name: "Harvest Complete", is_complete: true }],
    },
    {
        id: 2,
        listing: { crop_type: "Basmati Rice", location: "Karnal, Haryana" },
        buyer: { full_name: "Premium Grains Co." },
        shipment: {
            id: 101,
            booking_id: "KCB_12345",
            status: "In Transit",
            tracking_url: "https://krishiconnect.example.com/track/KCB_12345"
        },
        milestones: [{ name: "Harvest Complete", is_complete: true }],
    },
     {
        id: 3,
        listing: { crop_type: "Cotton Bales", location: "Amravati, Maharashtra" },
        buyer: { full_name: "Textile Exports Ltd." },
        shipment: null, // Not ready for shipment yet
        milestones: [{ name: "Sowing Complete", is_complete: true }],
    },
];

// --- HELPER & UI COMPONENTS ---

const InfoPill = ({ icon, text, className }) => (
    <div className={`flex items-center text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full ${className}`}>
        {icon}
        <span className="ml-2">{text}</span>
    </div>
);

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
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}></div>
            </div>
        </div>
    );
};

const BookingModal = ({ contract, onClose, onBookingSuccess, token }) => {
    const [quote, setQuote] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [vehicleType, setVehicleType] = useState('Tata Ace');

    const handleGetQuote = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/logistics/contract/${contract.id}/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    pickup_address: contract.listing.location,
                    dropoff_address: "Buyer Warehouse (Placeholder)",
                    vehicle_type: vehicleType,
                }),
            });
            if (!response.ok) throw new Error("Failed to get quote.");
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
        try {
            const response = await fetch(`${API_BASE_URL}/api/logistics/contract/${contract.id}/book`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to book shipment.");
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
                    <h2 className="text-xl font-bold text-gray-800">Book Transport</h2>
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

// --- ROLE-SPECIFIC COMPONENTS ---

const FarmerView = ({ contracts, setContracts, token }) => {
    const [selectedContract, setSelectedContract] = useState(null);

    const isReadyForShipment = (contract) => {
        // In a real app, this logic would be more robust. 
        // We check if a "Harvest Complete" milestone is done and no shipment is booked.
        return !contract.shipment && contract.milestones.some(m => m.name.toLowerCase().includes('harvest') && m.is_complete);
    };
    
    const handleBookingSuccess = (newShipment) => {
        setContracts(prev => prev.map(c => c.id === newShipment.contract_id ? { ...c, shipment: newShipment } : c));
    };

    return (
        <div>
            {selectedContract && <BookingModal contract={selectedContract} onClose={() => setSelectedContract(null)} onBookingSuccess={handleBookingSuccess} token={token} />}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Contracts - Logistics</h2>
            <div className="space-y-4">
                {contracts.map(contract => (
                    <div key={contract.id} className="bg-white p-5 rounded-lg shadow-sm border">
                        <div className="flex flex-col md:flex-row justify-between md:items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{contract.listing.crop_type}</h3>
                                <p className="text-sm text-gray-500">Contract #{contract.id} with {contract.buyer.full_name}</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                {contract.shipment ? (
                                    <InfoPill icon={<CheckCircle size={16} className="text-green-600"/>} text="Shipment Booked" />
                                ) : isReadyForShipment(contract) ? (
                                    <button onClick={() => setSelectedContract(contract)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                                        Book Transport
                                    </button>
                                ) : (
                                    <InfoPill icon={<Calendar size={16} />} text="Awaiting Harvest Milestone" />
                                )}
                            </div>
                        </div>
                        {contract.shipment && (
                            <div className="mt-4 pt-4 border-t">
                                <ShipmentStatusTracker status={contract.shipment.status} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const BuyerView = ({ contracts, token }) => {
    const [shipments, setShipments] = useState([]);
    
    useEffect(() => {
        const contractsWithShipments = contracts.filter(c => c.shipment);
        setShipments(contractsWithShipments);
    }, [contracts]);
    
    const handleTrack = async (shipmentId) => {
        // In a real app, you would update the specific shipment's state
        alert(`Simulating tracking for shipment #${shipmentId}. In a real app, this would fetch the latest status.`);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Incoming Shipments</h2>
            <div className="space-y-4">
                {shipments.length > 0 ? shipments.map(({id, listing, shipment}) => (
                    <div key={id} className="bg-white p-5 rounded-lg shadow-sm border">
                        <div className="flex flex-col md:flex-row justify-between md:items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{listing.crop_type}</h3>
                                <p className="text-sm text-gray-500">From: {listing.location}</p>
                                <p className="text-xs text-gray-400 mt-1">Booking ID: {shipment.booking_id}</p>
                            </div>
                             <div className="mt-4 md:mt-0">
                                <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                                    Track Shipment
                                </a>
                            </div>
                        </div>
                         <div className="mt-4 pt-4 border-t">
                            <ShipmentStatusTracker status={shipment.status} />
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-8">No active shipments found.</p>
                )}
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
export default function LogisticsDashboard() {
    const [userRole, setUserRole] = useState('farmer'); // 'farmer' or 'buyer'
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = "your_auth_token_here"; // Replace with your actual auth logic

    const fetchContracts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Replace with your actual API call to fetch ongoing contracts
            // const response = await fetch('${API_BASE_URL}/api/contracts/ongoing', { headers: { Authorization: `Bearer ${token}` } });
            // if (!response.ok) throw new Error("Failed to fetch contracts.");
            // const data = await response.json();
            // setContracts(data);
            
            // For now, we use mock data
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setContracts(MOCK_ONGOING_CONTRACTS);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const renderContent = () => {
        if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>;
        if (error) return <p className="text-center text-red-600">{error}</p>;
        
        return userRole === 'farmer' ? 
            <FarmerView contracts={contracts} setContracts={setContracts} token={token} /> : 
            <BuyerView contracts={contracts} token={token} />;
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                         <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Truck className="mr-3 text-green-600"/>
                            Logistics & Transport
                        </h1>
                        <div className="flex items-center gap-2 p-2 bg-white border rounded-lg">
                            <button onClick={() => setUserRole('farmer')} className={`px-3 py-1 text-sm rounded-md ${userRole === 'farmer' ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}>Farmer View</button>
                            <button onClick={() => setUserRole('buyer')} className={`px-3 py-1 text-sm rounded-md ${userRole === 'buyer' ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}>Buyer View</button>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2">Manage and track shipments for your KrishiConnect contracts.</p>
                </header>
                {renderContent()}
            </div>
        </div>
    );
}
