import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  X,
  ImageIcon,
  HardDriveUpload,
  CalendarDays,
  Loader2,
  AlertCircle,
  FileText,
  MessageCircle,
  ThumbsDown,
  Send,
  Handshake,
} from "lucide-react";

// --- MOCK AUTH STORE ---
// This is a placeholder. In a real application, you would import your actual auth store.
const useAuthStore = (selector) => {
    const state = {
        token: 'mock-jwt-token-for-development',
        user: { id: 'mock-user-id-123', fullName: 'Mock User' },
    };
    return selector(state);
};

// --- NEGOTIATION CHAT MODAL COMPONENT (Integrated) ---
const fetchNegotiationHistory = async (contractId, token) => {
    console.log(`Fetching history for ${contractId} with token ${token}`);
    return Promise.resolve([
        { sender_id: 'other-user', message: `Hello! I'm interested in this listing.`, created_at: new Date().toISOString() },
        { sender_id: 'mock-user-id-123', message: 'Great! What is your offer?', created_at: new Date().toISOString() },
    ]);
};

function NegotiationChatModal({ proposal, onClose, onOfferUpdated }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [error, setError] = useState(null);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offerPrice, setOfferPrice] = useState(proposal.rawPrice || '');
    const [offerQuantity, setOfferQuantity] = useState(proposal.rawQuantity || '');
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!user?.id || !proposal?.id) return;
        const connect = async () => {
            try {
                const history = await fetchNegotiationHistory(proposal.id, token);
                setMessages(history);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingHistory(false);
            }
        };
        connect();
    }, [user, proposal.id, token]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const optimisticMessage = {
            sender_id: user.id,
            message: newMessage,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
    };
    
    const handleUpdateOffer = (e) => {
        e.preventDefault();
        setIsSubmittingOffer(true);
        setTimeout(() => {
            alert("Offer updated! (This is a simulation)");
            setIsSubmittingOffer(false);
            setShowOfferForm(false);
            onOfferUpdated();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] md:h-[70vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Negotiating with {proposal.buyerName}</h2>
                        <p className="text-sm text-gray-500">For listing: {proposal.cropType}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </header>
                <div className="p-4 flex-grow overflow-y-auto bg-gray-50 space-y-4">
                    {loadingHistory && <div className="text-center"><Loader2 className="animate-spin inline-block" /></div>}
                    {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>}
                    {!loadingHistory && messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <footer className="p-4 border-t bg-white flex-shrink-0 space-y-3">
                    {showOfferForm && (
                        <form onSubmit={handleUpdateOffer} className="p-4 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-600">New Price (per unit)</label>
                                <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600">New Quantity</label>
                                <input type="number" value={offerQuantity} onChange={e => setOfferQuantity(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
                            </div>
                            <button type="submit" disabled={isSubmittingOffer} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center">
                                {isSubmittingOffer ? <Loader2 className="animate-spin" /> : "Send New Offer"}
                            </button>
                        </form>
                    )}
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setShowOfferForm(!showOfferForm)} className="p-2 border rounded-md hover:bg-gray-100" title="Update Offer"><Handshake size={20} className="text-gray-600" /></button>
                        <form onSubmit={handleSendMessage} className="flex-grow flex items-center">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500" />
                            <button type="submit" className="p-3 bg-green-600 text-white rounded-r-md hover:bg-green-700"><Send size={20} /></button>
                        </form>
                    </div>
                </footer>
            </div>
        </div>
    );
}

// --- HELPER COMPONENTS ---
const ProgressBar = ({ value, max, colorClass, label }) => (
  <div>
    <div className="flex justify-between items-baseline">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <p className="text-xs text-gray-500">
        ₹{parseFloat(value).toLocaleString("en-IN")} / ₹{parseFloat(max).toLocaleString("en-IN")}
      </p>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
      <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const ImageModal = ({ src, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
    <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors"><X size={24} /></button>
    <img src={src} alt="Enlarged update" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}/>
  </div>
);

const EscrowSummary = ({ contract }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold flex items-center mb-4 text-gray-800"><ShieldCheck size={20} className="mr-2 text-green-600" />Escrow Summary</h3>
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">Total Contract Value</p>
        <p className="text-3xl font-bold text-gray-900">₹{parseFloat(contract.totalValue).toLocaleString("en-IN")}</p>
      </div>
      <ProgressBar value={contract.escrowAmount} max={contract.totalValue} colorClass="bg-yellow-400" label="Funds Locked in Escrow"/>
      <ProgressBar value={contract.amountPaid} max={contract.totalValue} colorClass="bg-green-500" label="Paid to Farmer"/>
    </div>
  </div>
);

const VerticalMilestoneTracker = ({ milestones, onReleasePayment, submittingMilestoneId }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800">Milestone Progress</h3>
    <div className="mt-6">
      <ul className="relative space-y-8">
        <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
        {milestones.map((m) => {
          const isDone = m.done;
          const isPaid = m.paid;
          const isReadyForPayment = isDone && !isPaid;
          const isLoading = submittingMilestoneId === m.id;
          return (
            <li key={m.id} className="flex items-start space-x-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${isDone ? 'bg-green-500' : 'bg-gray-300'} ${isReadyForPayment && !isLoading ? "animate-pulse" : ""}`}>
                {isDone && <CheckCircle size={16} className="text-white" />}
              </div>
              <div className="flex-1 -mt-1">
                <p className={`font-medium ${isDone ? "text-gray-800" : "text-gray-500"}`}>{m.name}</p>
                <p className={`text-sm ${isPaid ? "text-green-600 font-semibold" : "text-gray-500"}`}>₹{parseFloat(m.amount).toLocaleString("en-IN")} {isPaid && "(Paid)"}</p>
                {isReadyForPayment && (
                  <button onClick={() => onReleasePayment(m.id)} disabled={isLoading} className="mt-2 bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-300 flex items-center justify-center w-[140px]">
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Release Payment'}
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
    const [activeTab, setActiveTab] = useState("ongoing");
    const [ongoing, setOngoing] = useState([]);
    const [negotiating, setNegotiating] = useState([]);
    const [rejected, setRejected] = useState([]);
    const [loading, setLoading] = useState({ ongoing: true, negotiating: true, rejected: true });
    const [error, setError] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [modalImage, setModalImage] = useState(null);
    const [submittingMilestoneId, setSubmittingMilestoneId] = useState(null);
    const [selectedNegotiation, setSelectedNegotiation] = useState(null);
    const token = useAuthStore((state) => state.token);

    const fetchData = useCallback(async (endpoint, formatter, setter, key) => {
        // Mock data fetching, replace with your actual API calls
        if (!token) {
            setError("Please log in to view contracts.");
            setLoading(prev => ({ ...prev, [key]: false }));
            return;
        }
        try {
            // Simulate API call delay
            await new Promise(res => setTimeout(res, 800));
            // This is where you would normally fetch data:
            // const response = await fetch(`http://localhost:8000/api/contracts/${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
            // if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
            // const data = await response.json();
            // setter(formatter(data));
        } catch (err) {
            console.error(`Error fetching ${key}:`, err);
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    }, [token]);

    const fetchAllData = useCallback(() => {
        fetchData('ongoing', (data) => data, setOngoing, 'ongoing');
        
        // Using mock data for all sections for this example
        setOngoing([
            { id: 'on-1', crop: 'Organic Wheat', farmer: 'Ram Singh', totalValue: 500000, escrowAmount: 500000, amountPaid: 100000, delivery: '30/10/2025', milestones: [ {id: 'm1', name: 'Seeding Complete', amount: 100000, done: true, paid: true, created_at: new Date().toISOString() }, { id: 'm2', name: 'Mid-growth Report', amount: 150000, done: false, paid: false, update_text: 'Crops are healthy.', image_url: 'https://placehold.co/600x400/a3e6b7/333?text=Wheat+Field', created_at: new Date().toISOString() } ] }
        ]);
        setNegotiating([
            { id: 'neg-1', listing: { crop_type: 'Wheat' }, buyer: { full_name: 'Global Grains Co.' }, rawPrice: 500, rawQuantity: 1000 },
            { id: 'neg-2', listing: { crop_type: 'Tomatoes' }, buyer: { full_name: 'Fresh Veggies Inc.' }, rawPrice: 80, rawQuantity: 500 },
        ]);
        setRejected([
             { id: 'rej-1', listing: { crop_type: 'Barley' }, buyer: { full_name: 'Brew Masters' }, reason: 'Price too high' },
        ]);

    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleReleasePayment = async (milestoneId) => {
      setSubmittingMilestoneId(milestoneId);
      setError(null);
      try {
          console.log(`Simulating payment release for milestone ${milestoneId}`);
          await new Promise(res => setTimeout(res, 1000));
          alert("Payment released successfully!");
          fetchAllData(); 
          setSelectedContract(null);
      } catch (err) {
          setError(err.message);
          alert(`Error: ${err.message}`);
      } finally {
          setSubmittingMilestoneId(null);
      }
    };

    const currentContract = ongoing.find((c) => c.id === selectedContract?.id);
    
    const tabs = [
        { key: 'ongoing', title: 'Ongoing Contracts', icon: <FileText size={18} />, data: ongoing, color: 'green' },
        { key: 'negotiating', title: 'In Negotiation', icon: <MessageCircle size={18} />, data: negotiating, color: 'blue' },
        { key: 'rejected', title: 'Rejected', icon: <ThumbsDown size={18} />, data: rejected, color: 'red' }
    ];

    const renderContent = () => {
        const currentLoading = loading[activeTab];
        if (currentLoading) {
            return <div className="flex justify-center items-center p-16"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
        }

        switch(activeTab) {
            case 'ongoing':
                return !currentContract ? (
                     <div className="space-y-3">
                        {ongoing.length === 0 && <p className="text-gray-500 text-center py-8">No active contracts.</p>}
                        {ongoing.map((c) => (
                          <div key={c.id} onClick={() => setSelectedContract(c)} className="p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:ring-2 hover:ring-green-500 transition-all duration-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg text-green-700">{c.crop}</h3>
                                <p className="text-sm text-gray-500">with {c.farmer}</p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="font-semibold text-lg text-gray-800">₹{c.totalValue.toLocaleString('en-IN')}</p>
                                <p className="text-sm text-gray-500 flex items-center justify-end"><CalendarDays size={14} className="mr-1.5" /> Due: {c.delivery}</p>
                              </div>
                            </div>
                            <div className="mt-4"><ProgressBar value={c.amountPaid} max={c.totalValue} colorClass="bg-green-500" label="Payment Progress" /></div>
                          </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <button onClick={() => setSelectedContract(null)} className="flex items-center text-green-700 font-semibold hover:underline mb-4">
                            <ArrowLeft size={18} className="mr-1" /> Back to Ongoing Contracts
                        </button>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm"><h2 className="text-3xl font-bold text-gray-900">{currentContract.crop}</h2><p className="text-lg text-gray-600">with {currentContract.farmer}</p></div>
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold flex items-center text-gray-800"><MessageSquare size={18} className="mr-2 text-green-600" />Farmer Updates</h3>
                                    <div className="mt-4 relative space-y-6">
                                        <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-0.5 bg-gray-200 z-0"></div>
                                        {currentContract.milestones.filter(m => m.update_text || m.image_url).map((milestone, idx) => (
                                            <div key={idx} className="relative flex items-start space-x-4 z-10">
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><HardDriveUpload size={14} className="text-white"/></div>
                                                <div className="p-4 bg-gray-50 rounded-md border flex-1">
                                                    <p className="text-xs font-semibold text-gray-500">{new Date(milestone.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    <p className="text-base font-semibold text-gray-700 mt-2">{milestone.name}</p>
                                                    <p className="text-gray-700 mt-1">{milestone.update_text}</p>
                                                    {milestone.image_url && (
                                                        <div onClick={() => setModalImage(milestone.image_url)} className="mt-3 rounded-lg w-full h-64 bg-cover bg-center cursor-pointer group relative" style={{ backgroundImage: `url(${milestone.image_url})` }}>
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon size={32} className="text-white"/></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6"><EscrowSummary contract={currentContract} /><VerticalMilestoneTracker milestones={currentContract.milestones} onReleasePayment={handleReleasePayment} submittingMilestoneId={submittingMilestoneId} /></div>
                        </div>
                    </div>
                );
            case 'negotiating':
                return (
                    <div className="space-y-3">
                        {negotiating.length === 0 && <p className="text-gray-500 text-center py-8">No contracts in negotiation.</p>}
                        {negotiating.map((neg) => (
                            <div key={neg.id} className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center">
                                <div><h3 className="font-bold text-lg text-blue-700">{neg.listing.crop_type}</h3><p className="text-sm text-gray-500">with {neg.buyer.full_name}</p></div>
                                <button onClick={() => setSelectedNegotiation(neg)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Open Chat</button>
                            </div>
                        ))}
                    </div>
                );
            case 'rejected':
                return (
                    <div className="space-y-3">
                         {rejected.length === 0 && <p className="text-gray-500 text-center py-8">No rejected contracts.</p>}
                         {rejected.map((rej) => (
                            <div key={rej.id} className="p-4 bg-white rounded-lg shadow-sm opacity-80">
                                <h3 className="font-bold text-lg text-red-700">{rej.listing.crop_type}</h3>
                                <p className="text-sm text-gray-500">with {rej.buyer.full_name}</p>
                                 {rej.reason && <p className="text-sm text-gray-600 mt-2 italic">Reason: "{rej.reason}"</p>}
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    }

  return (
    <div className="space-y-6 bg-gray-50 p-4 md:p-8 min-h-screen">
      {modalImage && <ImageModal src={modalImage} onClose={() => setModalImage(null)} />}
      {selectedNegotiation && <NegotiationChatModal proposal={{...selectedNegotiation}} onClose={() => setSelectedNegotiation(null)} onOfferUpdated={fetchAllData} />}
      
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Your Contracts</h1>
        <p className="text-gray-600 mt-1">Manage all your agricultural agreements in one place.</p>
      </header>

      {error && (
         <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" />
          <div><p className="font-semibold">An Error Occurred</p><p className="text-sm">{error}</p></div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {tabs.map(tab => (
              <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSelectedContract(null); }}
                  className={`flex-1 flex items-center justify-center p-3 rounded-md text-sm font-semibold transition-all duration-200 border-2 ${
                      activeTab === tab.key
                          ? `bg-${tab.color}-600 text-white border-${tab.color}-600 shadow-lg`
                          : `text-gray-600 hover:bg-gray-100 border-transparent`
                  }`}
              >
                  {tab.icon}
                  <span className="ml-2">{tab.title}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs transition-colors ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {loading[tab.key] ? '...' : tab.data.length}
                  </span>
              </button>
          ))}
      </div>

      {/* Content Area */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm min-h-[400px]">
          {renderContent()}
      </div>
    </div>
  );
};

export default OngoingContracts;

