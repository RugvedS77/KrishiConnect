import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Wallet, Globe, ShieldCheck, Banknote, BadgeCheck, FileStack, Eye, Leaf } from 'lucide-react';

// --- Reusable Components ---

// Navbar Component
const Navbar = () => (
  <header className="absolute top-0 left-0 right-0 z-50 p-6 bg-transparent">
    <div className="container mx-auto flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <Leaf className="h-8 w-8 text-white" />
        <span className="text-2xl font-bold text-white">KrishiConnect</span>
      </Link>
      
      {/* Login Buttons */}
      <nav className="space-x-4">
        <Link 
          to="/login-farmer" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 text-sm shadow-md"
        >
          Farmer Login
        </Link>
        <Link 
          to="/login-buyer" 
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 text-sm shadow-md"
        >
          Buyer Login
        </Link>
      </nav>
    </div>
  </header>
);

// Feature Card
const FeatureCard = ({ icon, title, text }) => (
  <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
    <div className="flex justify-center items-center mb-5 w-16 h-16 mx-auto bg-green-100 rounded-full">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 text-base">{text}</p>
  </div>
);

// Benefit Point
const BenefitPoint = ({ icon, title, text }) => (
   <div className="flex items-start group">
     <div className="flex-shrink-0 mr-5 mt-1 w-14 h-14 flex items-center justify-center bg-green-100 rounded-full text-green-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-200">
       {icon}
     </div>
     <div>
       <h4 className="text-xl font-semibold text-gray-900">{title}</h4>
       <p className="text-gray-700 mt-1">{text}</p>
     </div>
 </div>
);

// Section Heading
const SectionHeader = ({ title, subtitle }) => (
  <div className="text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{title}</h2>
    <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">{subtitle}</p>
  </div>
);

// --- Main Landing Page Component ---

const LandingPage = () => {
  return (
    <div className="bg-gray-50 antialiased">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=2070')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">
            Connecting Harvests to Markets
          </h1>
          <p className="mt-6 text-xl md:text-2xl max-w-4xl mx-auto text-gray-200 drop-shadow-md">
            The trusted digital platform for farmers and buyers to create transparent, fair, and profitable contracts.
          </p>
        </div>
      </section>

      {/* --- PLATFORM FEATURES SECTION --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader 
            title="Our Platform Features"
            subtitle="A simple, three-step process to bridge the gap between farm and future."
          />
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search size={32} className="text-green-700" />} 
              title="1. List & Discover" 
              text="Farmers list their upcoming harvest with details. Buyers discover and filter verified opportunities." 
            />
            <FeatureCard 
              icon={<FileText size={32} className="text-green-700" />} 
              title="2. Propose & Agree" 
              text="Buyers propose simple, clear digital contracts. Farmers review, negotiate, and accept online." 
            />
            <FeatureCard 
              icon={<Wallet size={32} className="text-green-700" />} 
              title="3. Track & Transact" 
              text="Monitor crop progress with updates from the farm. Manage secure, timely payments through our platform." 
            />
          </div>
        </div>
      </section>

      {/* --- FOR FARMERS SECTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">Empowering Our Farmers</h2>
            <div className="space-y-8">
              <BenefitPoint 
                icon={<Globe size={28} />} 
                title="Access a Wider Market" 
                text="Connect with hundreds of verified buyers and contractors beyond your local area." 
              />
              <BenefitPoint 
                icon={<ShieldCheck size={28} />} 
                title="Fair & Transparent Contracts" 
                text="Use simple digital templates to lock in prices and protect yourself from market volatility." 
              />
              <BenefitPoint 
                icon={<Banknote size={28} />} 
                title="Secure & Timely Payments" 
                text="Our digital escrow system ensures you get paid on time, every time." 
              />
            </div>
            <div className="pt-4">
              <Link 
                to="/login-farmer" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 text-lg shadow-lg"
              >
                Start Listing Your Crops
              </Link>
            </div>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1620138546344-7b2c3dc1a476?auto=format&fit=crop&q=80&w=1925" alt="Farmer using a tablet" className="rounded-xl shadow-2xl" />
          </div>
        </div>
      </section>

       {/* --- FOR BUYERS SECTION --- */}
       <section className="py-24 bg-white">
         <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
           <div className="md:order-last space-y-8">
             <h2 className="text-4xl font-bold text-gray-900 leading-tight">Your Trusted Source for Quality Produce</h2>
             <div className="space-y-8">
               <BenefitPoint 
                 icon={<BadgeCheck size={28} />} 
                 title="Verified Farm Listings" 
                 text="Discover high-quality produce with detailed information on farming practices, soil, and more." 
               />
               <BenefitPoint 
                 icon={<FileStack size={28} />} 
                 title="Streamlined Procurement" 
                 text="Propose, manage, and track all your contracts from a single, easy-to-use dashboard." 
               />
               <BenefitPoint 
                 icon={<Eye size={28} />} 
                 title="Real-time Crop Monitoring" 
                 text="Get updates from the farm to track progress from sowing to harvest for better planning." 
               />
             </div>
             <div className="pt-4">
               <Link 
                 to="/login-buyer" 
                 className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 text-lg shadow-lg"
               >
                 Start Sourcing Produce
               </Link>
             </div>
           </div>
           <div>
             <img src="https://images.unsplash.com/photo-1576021182212-79888b37e8c0?auto=format&fit=crop&q=80&w=2070" alt="Fresh produce in crates" className="rounded-xl shadow-2xl" />
           </div>
         </div>
       </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Leaf className="h-7 w-7 text-green-400" />
            <span className="text-2xl font-bold">KrishiConnect</span>
          </div>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            Connecting the roots of agriculture with the branches of technology.
          </p>
          <p className="text-gray-500">&copy; 2025 KrishiConnect. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;