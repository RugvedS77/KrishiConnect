import { useAuthStore } from './authStore.js';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import './App.css';

// --- Main Farmer Layout ---
import FarmerLayout from './farmer_business_components/FarmerLayout.jsx';

// ------------------- Farmer Business (Marketplace) Pages -------------------
import MarketplaceDashboard from './farmer_business_pages/MarketplaceDashboard.jsx'; 
import FarmerErrorPage from './farmer_business_pages/ErrorPage.jsx';
import CreateListingPage from './farmer_business_pages/CreateListingPage.jsx';
import BuyerProposalsPage from './farmer_business_pages/BuyerProposalsPage.jsx';
import OngoingContractsPage from './farmer_business_pages/OngoingContractsPage.jsx';
import CompletedContractsPage from './farmer_business_pages/CompletedContractsPage.jsx';
import ProfilePage from './farmer_business_pages/ProfilePage.jsx';
import SupportPage from './farmer_business_pages/SupportPage.jsx';
import FarmerListingsPage from './farmer_business_pages/FarmerListingsPage.jsx';
import FarmLogisticsPage from './farmer_business_pages/Farmer_LogisticsPage.jsx';

// ------------------- Farmer Daily Operation (Farm OS) Pages -------------------
import FarmOSDashboard from './farmer_daily_operation_pages/FarmOSDashboard.jsx';
import FarmAdvisoryPage from './farmer_daily_operation_pages/FarmAdvisoryPage.jsx';
import MachineryProductsPage from './farmer_daily_operation_pages/MachineryProductsPage.jsx';
import CommunityHubPage from './farmer_daily_operation_pages/CommunityHubPage.jsx';

// ------------------- Buyer Imports -------------------
import BuyerLayout from './buyer_components/Layout.jsx';
import BuyerSignupPage from './pages/BuyerSignupPage.jsx';
import BuyerDashboard from './buyer_pages/BuyerDashboard.jsx';
import BrowseListings from './buyer_pages/BrowseListings.jsx';
import OngoingContracts from './buyer_pages/OngoingContracts.jsx';
import Payments from './buyer_pages/Payments.jsx';
import BuyLogisticsPage from "./buyer_pages/Buyer_LogisticsPage.jsx"
import BuyerProfile from './buyer_pages/Profile.jsx';
import ContractTemplatesPage from './buyer_pages/ContractTemplatesPage.jsx';

// ------------------- Common Pages -------------------
import LandingPage from './pages/LandingPage.jsx';
import FarmerLoginPage from './pages/FarmerLoginPage.jsx';
import BuyerLoginPage from './pages/BuyerLoginPage.jsx';
import FarmerSignupPage from './pages/FarmerSignupPage.jsx';

/**
 * --- Protected Route Wrappers ---
 */
function FarmerProtectedRoute({ children }) {
  const isFarmerLoggedIn = useAuthStore((state) => state.farmerAuth);
  return isFarmerLoggedIn ? children : <Navigate to="/login-farmer" replace />;
}

function BuyerProtectedRoute({ children }) {
  const isBuyerLoggedIn = useAuthStore((state) => state.buyerAuth);
  return isBuyerLoggedIn ? children : <Navigate to="/login-buyer" replace />;
}

const router = createBrowserRouter([
  // ---------- Public Routes ----------
  { path: '/', element: <LandingPage />, errorElement: <FarmerErrorPage /> },
  { path: '/login-farmer', element: <FarmerLoginPage /> },
  { path: '/login-buyer', element: <BuyerLoginPage /> },
  { path: '/signup-farmer', element: <FarmerSignupPage /> },
  { path: '/signup-buyer', element: <BuyerSignupPage /> },
  
  // ---------- Farmer Routes (Both Marketplace and Farm OS) ----------
  {
    path: '/farmer',
    element: (
      <FarmerProtectedRoute>
        <FarmerLayout />
      </FarmerProtectedRoute>
    ),
    errorElement: <FarmerErrorPage />,
    children: [
      // NEW: Default route now redirects to the Farm OS dashboard
      { index: true, element: <Navigate to="/farmer/os/dashboard" replace /> },

      // Marketplace routes are now nested to avoid conflicts
      { path: 'marketplace', element: <Outlet />, children: [
        { path: 'dashboard', element: <MarketplaceDashboard /> },
        { path: 'create-listing', element: <CreateListingPage /> },
        { path: 'buyer-proposals', element: <Outlet />, children: [
            { index: true, element: <FarmerListingsPage /> },
            { path: 'proposals/:listingId', element: <BuyerProposalsPage /> },
        ]},
        { path: 'ongoing-contracts', element: <OngoingContractsPage /> },
        { path: 'completed-contracts', element: <CompletedContractsPage /> },
        { path: 'logistics', element: <FarmLogisticsPage/>},
        { path: 'profile', element: <ProfilePage /> },
        { path: 'support', element: <SupportPage /> },
      ]},
      
      // Farm OS routes
      { path: 'os', element: <Outlet />, children: [
            { path: 'dashboard', element: <FarmOSDashboard /> },
            { path: 'advisory', element: <FarmAdvisoryPage /> },
            { path: 'resources', element: <MachineryProductsPage /> },
            { path: 'community-hub', element: <CommunityHubPage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'support', element: <SupportPage /> },
      ]},
    ],
  },

  // ---------- Buyer Routes ----------
  {
    path: '/buyer',
    element: (<BuyerProtectedRoute><BuyerLayout /></BuyerProtectedRoute>),
    children: [
      { index: true, element: <BuyerDashboard /> },
      { path: 'browse', element: <BrowseListings /> },
      { path: 'contracts', element: <OngoingContracts /> },
      { path: 'payments', element: <Payments /> },
      { path: 'logistics', element: <BuyLogisticsPage/>},
      { path: 'profile', element: <BuyerProfile /> },
      { path: 'propose/:cropId', element: <ContractTemplatesPage /> },
    ],
  },
]);

function App() {
  const { checkAuth, loading } = useAuthStore((state) => ({
    checkAuth: state.checkAuth,
    loading: state.loading,
  }));

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div>Loading Application...</div></div>;
  }

  return <RouterProvider router={router} />;
}

export default App;

