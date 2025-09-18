
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import './App.css';

// ------------------- Farmer Imports -------------------
import FarmerSidebar from './farmer_components/Sidebar';
import FarmerDashboard from './farmer_pages/FarmerDashboard';
import FarmerErrorPage from './farmer_pages/ErrorPage';
import CreateListingPage from './farmer_pages/CreateListingPage';
import BuyerProposalsPage from './farmer_pages/BuyerProposalsPage';
import OngoingContractsPage from './farmer_pages/OngoingContractsPage';
import CompletedContractsPage from './farmer_pages/CompletedContractsPage';
import ProfilePage from './farmer_pages/ProfilePage';
import SupportPage from './farmer_pages/SupportPage';
import FarmerListingsPage from './farmer_pages/FarmerListingsPage';
import FarmerSignupPage from './pages/FarmerSignupPage';

// ------------------- Buyer Imports -------------------
import BuyerLayout from './buyer_components/Layout';
import BuyerSignupPage from './pages/BuyerSignupPage';
import BuyerDashboard from './buyer_pages/BuyerDashboard';
import BrowseListings from './buyer_pages/BrowseListings';
import OngoingContracts from './buyer_pages/OngoingContracts';
import Payments from './buyer_pages/Payments';
import BuyerProfile from './buyer_pages/Profile';
import ContractTemplatesPage from './buyer_pages/ContractTemplatesPage';

// ------------------- Common Pages -------------------
import LandingPage from './pages/LandingPage';
import FarmerLoginPage from './pages/FarmerLoginPage';
import BuyerLoginPage from './pages/BuyerLoginPage';

/**
 * Farmer Layout (with Sidebar + Outlet)
 */
function FarmerLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <FarmerSidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

/**
 * --- Protected Route Wrappers ---
 */
function FarmerProtectedRoute({ children }) {
  const isFarmerLoggedIn = localStorage.getItem('farmerAuth') === 'true';
  return isFarmerLoggedIn ? children : <Navigate to="/login-farmer" replace />;
}

function BuyerProtectedRoute({ children }) {
  const isBuyerLoggedIn = localStorage.getItem('buyerAuth') === 'true';
  return isBuyerLoggedIn ? children : <Navigate to="/login-buyer" replace />;
}

function App() {
  const router = createBrowserRouter([
    // ---------- Public Routes ----------
    {
      path: '/',
      element: <LandingPage />,
      errorElement: <FarmerErrorPage />,
    },
    {
      path: '/login-farmer',
      element: <FarmerLoginPage />,
    },
    {
      path: '/login-buyer',
      element: <BuyerLoginPage />,
    },
    {
      path: '/signup-farmer',
      element: <FarmerSignupPage />,
    },
    {
      path: '/signup-buyer',
      element: <BuyerSignupPage />,
    },
    // ---------- Farmer Routes (Protected) ----------
    {
      path: '/farmer',
      element: (
        <FarmerProtectedRoute>
          <FarmerLayout />
        </FarmerProtectedRoute>
      ),
      errorElement: <FarmerErrorPage />,
      children: [
        // { index: true, element: <Navigate to="dashboard" replace /> },
        // { path: 'dashboard', element: <FarmerDashboard /> },
        { index: true, element: <FarmerDashboard /> },
        { path: 'create-listing', element: <CreateListingPage /> },
        {
          path: 'buyer-proposals',
          element: <Outlet />,
          children: [
            { index: true, element: <FarmerListingsPage /> },
            { path: 'all-proposals', element: <BuyerProposalsPage /> },
          ],
        },
        { path: 'ongoing-contracts', element: <OngoingContractsPage /> },
        { path: 'completed-contracts', element: <CompletedContractsPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'support', element: <SupportPage /> },
      ],
    },

    // ---------- Buyer Routes (Protected) ----------
    {
      path: '/buyer',
      element: (
        <BuyerProtectedRoute>
          <BuyerLayout />
        </BuyerProtectedRoute>
      ),
      children: [
        // { index: true, element: <Navigate to="dashboard" replace /> },
        // { path: 'dashboard', element: <BuyerDashboard /> },
        { index: true, element: <BuyerDashboard /> },
        { path: 'browse', element: <BrowseListings /> },
        { path: 'contracts', element: <OngoingContracts /> },
        { path: 'payments', element: <Payments /> },
        { path: 'profile', element: <BuyerProfile /> },
        { path: 'propose/:cropId', element: <ContractTemplatesPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;



