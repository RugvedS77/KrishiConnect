import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard'; // Assuming this is your Dashboard page
import Sidebar from './components/Sidebar'; // Import the Sidebar
import './App.css';

// TODO: Import your other page components
import ErrorPage from './pages/ErrorPage';
import CreateListingPage from './pages/CreateListingPage';
import BuyerProposalsPage from './pages/BuyerProposalsPage';
import OngoingContractsPage from './pages/OngoingContractsPage';
import CompletedContractsPage from './pages/CompletedContractsPage';
// import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import FarmerListingsPage from './pages/FarmerListingsPage';

/**
 * This is your main layout component.
 * It includes the Sidebar and an Outlet.
 * The Outlet renders the active child route.
 */
function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {/* Child pages will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  
  const router = createBrowserRouter([
    {
      path: '/',
      element: <MainLayout />, // Use MainLayout as the wrapper for all pages
      errorElement: <ErrorPage/>,
      children: [
        {
          index: true, // This makes <Home /> the default page at '/'
          element: <Dashboard />,
        },
        // TODO: Add routes for all your sidebar links
        {
          path: 'create-listing',
          element: <CreateListingPage />,
        },
        {
          path: 'buyer-proposals',
          element: <Outlet />,  // acts as a wrapper
          children: [
            {
              index: true,  // default page = Farmer listings
              element: <FarmerListingsPage />
            },
            {
              path: 'all-proposals',
              element: <BuyerProposalsPage />
            }
          ]
        },
        {
          path: 'ongoing-contracts',
          element: <OngoingContractsPage />,
        },
        {
          path: 'completed-contracts',
          element: <CompletedContractsPage />,
        },
        // {
        //   path: 'notifications',
        //   element: <NotificationsPage />,
        // },
        {
          path: 'profile',
          element: <ProfilePage />,
        },
        {
          path: 'support',
          element: <SupportPage />,
        },
      ]
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;