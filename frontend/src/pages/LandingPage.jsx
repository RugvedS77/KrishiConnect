import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Wallet, Globe, ShieldCheck, Banknote, BadgeCheck, FileStack, Eye } from 'lucide-react';

// Reusable component for feature cards
const FeatureCard = ({ icon, title, text }) => (
    <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-center items-center mb-4 w-16 h-16 mx-auto bg-green-100 rounded-full">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{text}</p>
    </div>
);

// Reusable component for benefit points
const BenefitPoint = ({ icon, title, text }) => (
     <div className="flex items-start">
        <div className="flex-shrink-0 mr-4 mt-1 w-12 h-12 flex items-center justify-center bg-green-100 rounded-full text-green-600">
            {icon}
        </div>
        <div>
            <h4 className="text-lg font-semibold">{title}</h4>
            <p className="text-gray-600">{text}</p>
        </div>
    </div>
);


const LandingPage = () => {
    return (
        <div className="bg-gray-50">
            {/* --- HERO SECTION --- */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-white">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=2070')" }}></div>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Connecting Harvests to Markets, Seamlessly.</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-200">A trusted digital platform for farmers and buyers to create transparent, fair, and profitable contracts.</p>
                    
                    {/* --- DUAL CALL TO ACTION --- */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* For Buyers Card */}
                        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20 text-left">
                            <h2 className="text-2xl font-semibold">For Buyers & Contractors</h2>
                            <p className="mt-2 text-gray-300">Find verified produce, monitor crop progress, and manage contracts with ease.</p>
                            <Link to="/login-buyer" className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                Login as Buyer
                            </Link>
                        </div>
                        {/* For Farmers Card */}
                         <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20 text-left">
                            <h2 className="text-2xl font-semibold">For Farmers</h2>
                            <p className="mt-2 text-gray-300">Access a wider market, secure fair prices, and get timely payments for your hard work.</p>
                            <Link to="/login-farmer" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                Login as Farmer
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS SECTION --- */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
                    <p className="text-gray-600 mt-2 mb-12 max-w-2xl mx-auto">A simple, three-step process to bridge the gap between farm and future.</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard icon={<Search size={28} className="text-green-600" />} title="1. List & Discover" text="Farmers list their upcoming harvest with details. Buyers discover and filter opportunities." />
                        <FeatureCard icon={<FileText size={28} className="text-green-600" />} title="2. Propose & Agree" text="Buyers propose simple, clear digital contracts. Farmers review, negotiate, and accept online." />
                        <FeatureCard icon={<Wallet size={28} className="text-green-600" />} title="3. Track & Transact" text="Monitor crop progress with updates from the farm. Manage secure payments through our platform." />
                    </div>
                </div>
            </section>

            {/* --- FOR FARMERS SECTION --- */}
            <section className="py-20">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800">Empowering Our Farmers</h2>
                        <div className="space-y-6">
                           <BenefitPoint icon={<Globe size={24} />} title="Access to a Wider Market" text="Connect with hundreds of verified buyers and contractors beyond your local area." />
                           <BenefitPoint icon={<ShieldCheck size={24} />} title="Fair & Transparent Contracts" text="Use simple digital templates to lock in prices and protect yourself from market changes." />
                           <BenefitPoint icon={<Banknote size={24} />} title="Secure & Timely Payments" text="Our digital escrow system ensures you get paid on time, every time." />
                        </div>
                    </div>
                    <div>
                        <img src="https://images.unsplash.com/photo-1620138546344-7b2c3dc1a476?auto=format&fit=crop&q=80&w=1925" alt="Farmer using a tablet" className="rounded-lg shadow-xl" />
                    </div>
                </div>
            </section>

             {/* --- FOR BUYERS SECTION --- */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                     <div className="md:order-last">
                        <h2 className="text-3xl font-bold text-gray-800">Your Trusted Source for Quality Produce</h2>
                        <div className="space-y-6 mt-6">
                           <BenefitPoint icon={<BadgeCheck size={24} />} title="Verified Farm Listings" text="Discover high-quality produce with detailed information on farming practices, soil, and more." />
                           <BenefitPoint icon={<FileStack size={24} />} title="Streamlined Procurement" text="Propose, manage, and track all your contracts from a single, easy-to-use dashboard." />
                           <BenefitPoint icon={<Eye size={24} />} title="Real-time Crop Monitoring" text="Get updates from the farm to track progress from sowing to harvest for better planning." />
                        </div>
                    </div>
                    <div>
                        <img src="https://images.unsplash.com/photo-1576021182212-79888b37e8c0?auto=format&fit=crop&q=80&w=2070" alt="Fresh produce in crates" className="rounded-lg shadow-xl" />
                    </div>
                </div>
            </section>

             {/* --- FOOTER --- */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; 2025 Agri-Connector. All Rights Reserved.</p>
                    <p className="text-sm text-gray-400 mt-1">Connecting the roots of agriculture with the branches of technology.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;