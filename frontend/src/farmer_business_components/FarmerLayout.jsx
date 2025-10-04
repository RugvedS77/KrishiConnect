import React, { useEffect } from 'react'; // 1. Import useEffect
import { Outlet, useLocation } from 'react-router-dom'; // 2. Import useLocation
import { useInterfaceStore } from '../interfaceStore.js';

// Import the two different sidebars
import MarketplaceSidebar from '../farmer_business_components/MarketplaceSidebar.jsx';
import FarmOSSidebar from '../farmer_daily_operation_components/FarmOSSidebar.jsx';

export default function FarmerLayout() {
  // 3. Get both 'mode' and the 'setMode' function from your store
  const { mode, setMode } = useInterfaceStore((state) => ({
    mode: state.mode,
    setMode: state.setMode,
  }));
  
  const location = useLocation(); // 4. Get the current location object

  // 5. Add this useEffect hook to sync the mode with the URL path
  useEffect(() => {
    if (location.pathname.includes('/farmer/marketplace')) {
      setMode('marketplace');
    } else {
      setMode('farmOS');
    }
  }, [location.pathname, setMode]); // Re-run this effect when the path changes

  return (
    <div className="flex h-screen bg-gray-100">
      {/* This logic now works correctly because the mode is always in sync */}
      {mode === 'marketplace' ? <MarketplaceSidebar /> : <FarmOSSidebar />}
      
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}