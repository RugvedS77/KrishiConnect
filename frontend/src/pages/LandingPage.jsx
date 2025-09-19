import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Wallet, Globe, ShieldCheck, Banknote, BadgeCheck, FileStack, Eye, Leaf, Star, Users, TrendingUp, Briefcase } from 'lucide-react';

// --- Reusable Components (Static) ---

const Navbar = () => (
  <header className="absolute top-0 left-0 right-0 z-50 p-6 bg-transparent">
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="flex items-center space-x-2">
        <Leaf className="h-8 w-8 text-white" />
        <span className="text-2xl font-bold text-white tracking-wider">KrishiConnector</span>
      </Link>
      <nav className="hidden md:flex space-x-2">
        <Link to="/login-farmer" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-300">
          Farmer Login
        </Link>
        <Link to="/login-buyer" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-300 shadow-lg">
          Buyer Login
        </Link>
      </nav>
    </div>
  </header>
);

const FeatureCard = ({ icon, title, text }) => (
  <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-green-500">
    <div className="flex justify-center items-center mb-5 w-16 h-16 mx-auto bg-green-100 rounded-full">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 text-base">{text}</p>
  </div>
);

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

const TestimonialCard = ({ quote, name, role, image }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
      <img src={image} alt={name} className="w-24 h-24 rounded-full mb-4 border-4 border-green-200" />
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => <Star key={i} className="text-yellow-400 fill-current" />)}
      </div>
      <p className="text-gray-600 italic mb-4">"{quote}"</p>
      <h4 className="font-bold text-gray-900">{name}</h4>
      <p className="text-sm text-green-700 font-semibold">{role}</p>
    </div>
);

const SectionHeader = ({ title, subtitle }) => {
  return(
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{title}</h2>
      <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">{subtitle}</p>
    </div>
  );
};

// --- Main Landing Page Component ---

const LandingPage = () => {
    
  // --- Effect to load the Elfsight Chatbot script ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script if the component unmounts
      const elfsightScript = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]');
      if (elfsightScript) {
          document.body.removeChild(elfsightScript);
      }
    };
  }, []); // Empty array ensures this effect runs only once

  return (
    <div className="bg-gray-50 antialiased">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen min-h-[750px] flex items-center justify-center text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=1974')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">
            Connecting Harvests to Markets
          </h1>
          <p className="mt-6 text-xl md:text-2xl max-w-4xl mx-auto text-gray-200 drop-shadow-md">
            The trusted digital platform for farmers and buyers to create transparent, fair, and profitable contracts.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                to="/login-farmer" 
                className="w-full sm:w-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-10 rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                I'm a Farmer
              </Link>
              <Link 
                to="/login-buyer" 
                className="w-full sm:w-auto inline-block bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 px-10 rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                I'm a Buyer
              </Link>
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US / STATS SECTION (NEW) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader 
            title="Why Choose KrishiConnector?"
            subtitle="We are committed to creating a fair, efficient, and profitable ecosystem for everyone involved in agriculture."
          />
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <TrendingUp className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-4xl font-bold text-gray-900">30%</h3>
              <p className="text-gray-600">Average Increase in Profits</p>
            </div>
            <div className="p-6">
              <Users className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-4xl font-bold text-gray-900">10,000+</h3>
              <p className="text-gray-600">Verified Farmers & Buyers</p>
            </div>
            <div className="p-6">
              <Briefcase className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-4xl font-bold text-gray-900">5,000+</h3>
              <p className="text-gray-600">Successful Contracts Signed</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <SectionHeader 
            title="How It Works"
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">Empowering Our Farmers</h2>
              <div className="space-y-8">
                  <BenefitPoint icon={<Globe size={28} />} title="Access a Wider Market" text="Connect with hundreds of verified buyers and contractors beyond your local area." />
                  <BenefitPoint icon={<ShieldCheck size={28} />} title="Fair & Transparent Contracts" text="Use simple digital templates to lock in prices and protect yourself from market volatility." />
                  <BenefitPoint icon={<Banknote size={28} />} title="Secure & Timely Payments" text="Our digital escrow system ensures you get paid on time, every time." />
              </div>
              <div className="pt-4">
                  <Link to="/login-farmer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1">
                      Start Listing Your Crops
                  </Link>
              </div>
            </div>
            <div>
              <div>
                <img src="https://media.istockphoto.com/id/1280272440/photo/indian-farmer-using-a-laptop-at-agriculture-field.jpg?s=612x612&w=0&k=20&c=XY7oOQ7VIETuR-X7_hij5FAKoQ4oZColnMw-1SROytk=" alt="Farmer using a tablet" className="rounded-xl shadow-2xl" />
              </div>
            </div>
        </div>
      </section>

      {/* --- FOR BUYERS SECTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="md:order-last space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">Your Trusted Source for Quality Produce</h2>
            <div className="space-y-8">
              <BenefitPoint icon={<BadgeCheck size={28} />} title="Verified Farm Listings" text="Discover high-quality produce with detailed information on farming practices, soil, and more." />
              <BenefitPoint icon={<FileStack size={28} />} title="Streamlined Procurement" text="Propose, manage, and track all your contracts from a single, easy-to-use dashboard." />
              <BenefitPoint icon={<Eye size={28} />} title="Real-time Crop Monitoring" text="Get updates from the farm to track progress from sowing to harvest for better planning." />
            </div>
            <div className="pt-4">
              <Link to="/login-buyer" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1">
                Start Sourcing Produce
              </Link>
            </div>
          </div>
          <div>
            <div>
              <img src="https://media.istockphoto.com/id/1458688223/photo/tracking-shot-happy-farmer-talking-on-mobile-phone-while-carrying-basket-of-vegetables-at.jpg?s=612x612&w=0&k=20&c=cqq9n3q4p6n74yIGCnmzBz4Jh8T9xsX1eF0X-ByWYJ8=" alt="Fresh produce in crates" className="rounded-xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>
      
      {/* --- TESTIMONIALS SECTION (NEW) --- */}
      <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
              <SectionHeader 
                  title="What Our Community Says"
                  subtitle="Hear from real farmers and buyers who have found success with KrishiConnector."
              />
              <div className="grid md:grid-cols-2 gap-8">
                  <TestimonialCard 
                      quote="This platform gave me access to buyers I never could have reached. My profits have never been better, and the contracts give me peace of mind."
                      name="Ramesh Patel"
                      role="Wheat Farmer, Punjab"
                      image="https://randomuser.me/api/portraits/men/32.jpg"
                  />
                  <TestimonialCard 
                      quote="Finding reliable, high-quality produce used to be a challenge. Now, I can source directly from verified farms and track the entire process. It's a game-changer."
                      name="Priya Singh"
                      role="Agri-Tech Buyer, Bangalore"
                      image="https://randomuser.me/api/portraits/women/44.jpg"
                  />
              </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Leaf className="h-7 w-7 text-green-400" />
            <span className="text-2xl font-bold">KrishiConnector</span>
          </div>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            Connecting the roots of agriculture with the branches of technology.
          </p>
          <p className="text-gray-500">&copy; {new Date().getFullYear()} KrishiConnector. All Rights Reserved.</p>
        </div>
      </footer>
      
      {/* This is the div the Elfsight script will use to inject the chatbot. */}
      <div className="elfsight-app-1cafdb9f-487f-438f-a7bb-cb35ec00b47f" data-elfsight-app-lazy></div>
    </div>
  );
};

export default LandingPage;