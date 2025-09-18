import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Banknote,
  ShieldCheck,
  MessageSquare,
  X,
  User,
  DollarSign,
  Image as ImageIcon,
  HardDriveUpload,
  CalendarDays,
  FileText,
} from "lucide-react";

// --- DATA (Using INR) ---
const initialContracts = [
  {
    id: 1,
    crop: "Organic Wheat",
    farmer: "Raj Patel",
    totalValue: 125000,
    escrowAmount: 125000,
    amountPaid: 25000,
    delivery: "2025-11-20",
    milestones: [
      { name: "Contract Accepted & Escrow Funded", amount: 25000, done: true, paid: true },
      { name: "Farming in Progress (Mid-Growth)", amount: 37500, done: false, paid: false },
      { name: "Harvesting Complete", amount: 37500, done: false, paid: false },
      { name: "Final Delivery Accepted", amount: 25000, done: false, paid: false },
    ],
    updates: [
      { date: "2025-09-01", text: "Escrow funded and contract is active. Sowing complete.", imageUrl: null },
    ],
  },
  {
    id: 2,
    crop: "Long-Staple Cotton",
    farmer: "Sunita Reddy",
    totalValue: 350000,
    escrowAmount: 350000,
    amountPaid: 0,
    delivery: "2025-12-15",
    milestones: [
      { name: "Contract Accepted & Escrow Funded", amount: 70000, done: false, paid: false },
      { name: "Pest Control Report Submitted", amount: 100000, done: false, paid: false },
      { name: "Harvest & Quality Test", amount: 100000, done: false, paid: false },
      { name: "Delivery & Acceptance", amount: 80000, done: false, paid: false },
    ],
    updates: [],
  },
  {
    id: 3,
    crop: "Basmati Rice",
    farmer: "Vikram Singh",
    totalValue: 80000,
    escrowAmount: 80000,
    amountPaid: 40000,
    delivery: "2025-10-30",
    milestones: [
      { name: "Escrow Funded", amount: 20000, done: true, paid: true },
      { name: "Sowing Complete", amount: 20000, done: true, paid: true },
      { name: "Mid-growth Report", amount: 40000, done: true, paid: false }, // Ready for payment
    ],
    updates: [
      { date: "2025-09-10", text: "Mid-growth report submitted. Crop is looking excellent.", imageUrl: "https://images.unsplash.com/photo-1536184221064-9d5e4d2d88b8?auto=format&fit=crop&q=80" },
      { date: "2025-08-20", text: "Sowing is complete.", imageUrl: null },
      { date: "2025-08-15", text: "Contract active.", imageUrl: null },
    ],
  },
];

// --- HELPER COMPONENTS (Using INR) ---

const ProgressBar = ({ value, max, colorClass, label }) => (
  <div>
    <div className="flex justify-between items-baseline">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <p className="text-xs text-gray-500">
        ₹{value.toLocaleString('en-IN')} / ₹{max.toLocaleString('en-IN')}
      </p>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
      <div
        className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

const ImageModal = ({ src, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors">
      <X size={24} />
    </button>
    <img
      src={src}
      alt="Enlarged update"
      className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const EscrowSummary = ({ contract }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
      <ShieldCheck size={20} className="mr-2 text-green-600" />
      Escrow Summary
    </h3>
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">Total Contract Value</p>
        <p className="text-3xl font-bold text-gray-900">
          ₹{contract.totalValue.toLocaleString('en-IN')}
        </p>
      </div>
      <ProgressBar
        value={contract.escrowAmount}
        max={contract.totalValue}
        colorClass="bg-yellow-400"
        label="Funds Locked in Escrow"
      />
      <ProgressBar
        value={contract.amountPaid}
        max={contract.totalValue}
        colorClass="bg-green-500"
        label="Paid to Farmer"
      />
    </div>
  </div>
);

const VerticalMilestoneTracker = ({ milestones, onReleasePayment }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800">Milestone Progress</h3>
    <div className="mt-6">
      <ul className="relative space-y-8">
        {/* The vertical line */}
        <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
        
        {milestones.map((m, idx) => {
          const isDone = m.done;
          const isPaid = m.paid;
          const isReadyForPayment = isDone && !isPaid;

          let circleClass = "bg-gray-300"; // Pending
          if (isDone) circleClass = "bg-green-500"; // Done

          return (
            <li key={idx} className="flex items-start space-x-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${circleClass} ${
                  isReadyForPayment ? "animate-pulse" : "" // Pulse if ready to pay
                }`}
              >
                {isDone && <CheckCircle size={16} className="text-white" />}
              </div>
              <div className="flex-1 -mt-1">
                <p
                  className={`font-medium ${
                    isDone ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {m.name}
                </p>
                <p
                  className={`text-sm ${
                    isPaid ? "text-green-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  ₹{m.amount.toLocaleString('en-IN')} {m.paid && "(Paid)"}
                </p>
                {isReadyForPayment && (
                  <button
                    onClick={() => onReleasePayment(idx)}
                    className="mt-2 bg-blue-500 text-white text-xs font-bold py-1.5 px-4 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    Release Payment
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
const OngoingContracts = () => {
  const [wallets, setWallets] = useState({ buyer: 415250, farmer: 75000 });
  const [contracts, setContracts] = useState(initialContracts);
  const [selectedContract, setSelectedContract] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  // const [transactions, setTransactions] = useState([]); // Removed transactions

  const handleReleasePayment = (milestoneIndex) => {
    setContracts((prevContracts) => {
      return prevContracts.map((c) => {
        if (c.id === selectedContract.id) {
          const updatedMilestones = [...c.milestones];
          const milestone = updatedMilestones[milestoneIndex];

          if (milestone.done && !milestone.paid) {
            const newAmountPaid = c.amountPaid + milestone.amount;
            const newEscrowAmount = c.escrowAmount - milestone.amount;
            updatedMilestones[milestoneIndex] = { ...milestone, paid: true };

            const updatedContract = {
              ...c,
              amountPaid: newAmountPaid,
              escrowAmount: newEscrowAmount,
              milestones: updatedMilestones,
            };

            setSelectedContract(updatedContract); // Update the detail view

            // Update the farmer's wallet balance
            setWallets((prevWallets) => ({
              ...prevWallets,
              farmer: prevWallets.farmer + milestone.amount,
            }));
            
            // Removed transaction logic
            // setTransactions(...)

            return updatedContract;
          }
        }
        return c;
      });
    });
  };

  // useEffect to simulate automatic progress AND add updates
  useEffect(() => {
    const timeouts = [];
    contracts.forEach((contract) => {
      let delay = 5000; // Initial delay
      contract.milestones.forEach((milestone, index) => {
        if (!milestone.done) {
          const timeoutId = setTimeout(() => {
            setContracts((prev) =>
              prev.map((c) => {
                if (c.id === contract.id) {
                  const newMilestones = [...c.milestones];
                  newMilestones[index].done = true;
                  
                  const newUpdate = {
                      date: new Date().toISOString().split('T')[0],
                      text: `Farmer update: Milestone "${milestone.name}" has been completed and is ready for your review.`,
                      imageUrl: null 
                  };
                  
                  const newUpdates = [...c.updates, newUpdate];

                  return { ...c, milestones: newMilestones, updates: newUpdates };
                }
                return c;
              })
            );
          }, delay);
          timeouts.push(timeoutId);
          delay += 7000; // Stagger subsequent milestones
        }
      });
    });

    // Cleanup timeouts on component unmount
    return () => timeouts.forEach(clearTimeout);
  }, []); // Empty dependency array means this runs only once on mount

  // Get the most up-to-date contract data for the detail view
  const currentContract = contracts.find((c) => c.id === selectedContract?.id);

  return (
    <div className="space-y-6 bg-gray-50 p-6 md:p-8 min-h-screen">
      {modalImage && (
        <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
      )}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Ongoing Contracts</h1>
        <p className="text-gray-600 mt-1">
          Track progress and manage payments for your active agreements.
        </p>
      </header>

      {/* Wallet Display Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Your (Buyer) Wallet</p>
            <p className="font-bold text-xl text-gray-800">
              ₹{wallets.buyer.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
          <div className="p-3 bg-green-100 text-green-700 rounded-full mr-4">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Farmer's Wallet Balance</p>
            <p className="font-bold text-xl text-gray-800">
              ₹{wallets.farmer.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Contract List View */}
      {!currentContract && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Active Agreements</h2>
          {contracts.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedContract(c)} // Use the local function
              className="p-5 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-green-500 transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-green-700">
                    {c.crop}
                  </h3>
                  <p className="text-sm text-gray-500">with {c.farmer}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-semibold text-lg text-gray-800">
                    ₹{c.totalValue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center justify-end">
                    <CalendarDays size={14} className="mr-1.5" /> Due: {c.delivery}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar
                  value={c.amountPaid}
                  max={c.totalValue}
                  colorClass="bg-green-500"
                  label="Payment Progress"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contract Detail View */}
      {currentContract && (
        <div>
          <button
            onClick={() => setSelectedContract(null)}
            className="flex items-center text-green-700 font-semibold hover:underline mb-4"
          >
            <ArrowLeft size={18} className="mr-1" /> Back to All Contracts
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900">
                  {currentContract.crop}
                </h2>
                <p className="text-lg text-gray-600">
                  with {currentContract.farmer}
                </p>
              </div>

              {/* Farmer Updates Section (Timeline) */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold flex items-center text-gray-800">
                  <MessageSquare size={18} className="mr-2 text-green-600" />
                  Farmer Updates
                </h3>
                <div className="mt-4 relative space-y-6">
                    {/* Timeline line */}
                    <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-0.5 bg-gray-200 z-0"></div>
                    
                    {currentContract.updates.length === 0 && (
                        <p className="text-sm text-gray-500">No updates from the farmer yet.</p>
                    )}

                    {currentContract.updates.sort((a,b) => new Date(b.date) - new Date(a.date)).map((update, idx) => ( // Show newest first
                        <div key={idx} className="relative flex items-start space-x-4 z-10">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <HardDriveUpload size={14} className="text-white"/>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-md border flex-1">
                                <p className="text-xs font-semibold text-gray-500">
                                {new Date(update.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p className="text-gray-700 mt-1">{update.text}</p>
                                {update.imageUrl && (
                                <div
                                    onClick={() => setModalImage(update.imageUrl)}
                                    className="mt-3 rounded-lg w-full h-64 bg-cover bg-center cursor-pointer group relative"
                                    style={{ backgroundImage: `url(${update.imageUrl})` }}
                                >
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ImageIcon size={32} className="text-white"/>
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <EscrowSummary contract={currentContract} />
              <VerticalMilestoneTracker
                milestones={currentContract.milestones}
                onReleasePayment={handleReleasePayment}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OngoingContracts;