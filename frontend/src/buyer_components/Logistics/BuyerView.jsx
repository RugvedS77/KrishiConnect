import React, { useState } from 'react';
import { Truck, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../api/apiConfig';
/**
 * This file has been corrected to ensure the UI updates when tracking status is refreshed.
 * KEY CHANGES:
 * 1. Removed the internal `shipments` state and `useEffect` to simplify data flow.
 * 2. The component now filters the `contracts` prop directly in the JSX for reliability.
 * 3. Corrected the function signature to properly receive the `setContracts` prop.
*/

// --- Reusable UI Component ---
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

// --- Main Buyer View Component ---
// FIX: Added 'setContracts' to the props list
export default function BuyerView({ contracts, setContracts, token }) {
    const [trackingId, setTrackingId] = useState(null);

    const handleTrackStatus = async (shipmentId) => {
        setTrackingId(shipmentId);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/logistics/shipment/${shipmentId}/track`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch latest shipment status.");
            }

            const data = await response.json();
            console.log("this is the data got: ", data);

            // Update the correct shipment inside the correct milestone
            setContracts(prevContracts =>
                prevContracts.map(c => {
                    return {
                        ...c,
                        milestones: c.milestones.map(m => {
                            if (m.shipment && m.shipment.id === shipmentId) {
                                return {
                                    ...m,
                                    shipment: {
                                        ...m.shipment,
                                        status: data.status
                                    }
                                };
                            }
                            return m;
                        })
                    };
                })
            );
        } catch (error) {
            alert(error.message);
        } finally {
            setTrackingId(null);
        }
    };


    // FIX: Filter contracts directly in the render logic instead of using a separate state
    const contractsWithShipments = contracts.filter(c =>
        c.milestones.some(m => m.shipment)
    );
    console.log("All contracts:", contracts);
    console.log("Filtered contracts with shipments:", contractsWithShipments);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Incoming Shipments</h2>
            <div className="space-y-4">
                {contractsWithShipments.length > 0 ? contractsWithShipments.map(({ id, listing, milestones, farmer }) => (
                    <div key={id} className="bg-white p-5 rounded-lg shadow-sm border">
                        <h3 className="font-bold text-lg text-gray-800">{listing.crop_type}</h3>
                        <p className="text-sm text-gray-500">From Farmer: {farmer.full_name}</p>

                        {/* Loop over milestones to show shipments */}
                        {milestones.map((m, idx) =>
                            m.shipment && (
                                <div key={m.shipment.id || idx} className="mt-4 border-t pt-4">
                                    <p className="text-xs text-gray-400 mb-2">
                                        Booking ID: {m.shipment.booking_id}
                                    </p>

                                    <div className="flex justify-between items-center mb-2">
                                        <a
                                            href={m.shipment.tracking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                                        >
                                            Track Shipment
                                        </a>
                                        <button
                                            onClick={() => handleTrackStatus(m.shipment.id)}
                                            disabled={trackingId === m.shipment.id}
                                            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            {trackingId === m.shipment.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <RefreshCw size={16} />
                                            )}
                                        </button>
                                    </div>

                                    <ShipmentStatusTracker status={m.shipment.status} />
                                </div>
                            )
                        )}
                    </div>
                )) : (
                    <div className="text-center text-gray-500 py-8 bg-white rounded-lg border">
                        <p>No active shipments found for your ongoing contracts.</p>
                    </div>
                )}

            </div>
        </div>
    );
};