import React, { useState, useEffect, useRef } from 'react';

// --- Mock Data ---
// In a real application, you would fetch this data from your backend API.
const mockConsultations = [
  {
    id: 1,
    category: 'Leaf Problems (Spots, Yellowing)',
    question: 'My tomato plants have yellow spots on the leaves. What could be the issue?',
    status: 'Answered',
    answer: 'This looks like early blight, a common fungal disease. I recommend using a copper-based fungicide, ensuring good air circulation around the plants, and removing affected leaves immediately to prevent it from spreading.',
    expert: { name: 'Dr. Priya Sharma', title: 'Agronomist' },
    imageUrl: 'https://placehold.co/600x400/F5F5F5/333333?text=Tomato+Leaf',
  },
  {
    id: 2,
    category: 'Insect Identification & Control',
    question: 'There are small white insects on my brinjal plants. How can I get rid of them?',
    status: 'Answered',
    answer: 'Those are likely whiteflies. You can start by spraying a neem oil solution. If the infestation is heavy, consider using an appropriate insecticidal soap or introducing natural predators like ladybugs.',
    expert: { name: 'Dr. Ramesh Kumar', title: 'Entomologist' },
    imageUrl: null,
  },
  {
    id: 3,
    category: 'Soil Health',
    question: 'What is the best way to improve soil fertility for the next season?',
    status: 'Submitted',
    answer: null,
    expert: null,
    imageUrl: 'https://placehold.co/600x400/F5F5F5/333333?text=Soil+Sample',
  },
];

// --- Sub-components for the Page ---

/**
 * Renders a colored status badge.
 */
function StatusBadge({ status }) {
  const styles = {
    Answered: 'bg-green-100 text-green-800',
    Submitted: 'bg-blue-100 text-blue-800',
    Closed: 'bg-slate-100 text-slate-800',
  };
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.Closed}`}>{status}</span>;
}

/**
 * Voice Assistant Component using Web Speech API
 */
function VoiceAssistantBooking() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle, listening, success, error
  const recognitionRef = useRef(null);

  const isSpeechRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setStatus('listening');
    recognition.onresult = (event) => {
      const finalTranscript = event.results[0][0].transcript;
      setTranscript(finalTranscript);
      processTranscript(finalTranscript);
    };
    recognition.onerror = () => {
      setStatus('error');
      setTranscript('Sorry, something went wrong. Please try again.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => recognitionRef.current.stop();
  }, [isSpeechRecognitionSupported]);
  
  const processTranscript = (text) => {
    const command = text.toLowerCase();
    const keywords = ['leaf', 'insect', 'soil', 'fertilizer', 'market'];
    const foundKeyword = keywords.find(kw => command.includes(kw));
    
    if ((command.includes('book') || command.includes('expert')) && foundKeyword) {
      setStatus('success');
      setTranscript(`Booking confirmed for an expert in '${foundKeyword}'.`);
    } else {
      setStatus('error');
      setTranscript(`Sorry, I couldn't understand the topic. Please try again.`);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setStatus('idle');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };
  
  if (!isSpeechRecognitionSupported) return null;

  const renderStatusMessage = () => {
    if (status === 'listening') return <p className="text-center text-blue-600 animate-pulse font-medium">Listening...</p>;
    return <p className="text-center text-slate-600 text-sm h-10 flex items-center justify-center">{transcript || 'Example: "Book an expert for leaf problems."'}</p>;
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-lg ${status === 'success' ? 'bg-green-50 border-green-200' : status === 'error' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-bold text-slate-800">Voice Assistant Booking</h3>
        <p className="text-sm text-slate-500 mb-4">Click the mic and speak your query.</p>
        
        <button 
          onClick={handleMicClick}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400`}
        >
          {isListening && <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-9 h-9 relative z-10">
            <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v1h6v-1h-2v-2.07z" />
          </svg>
        </button>

        <div className="mt-4 h-10">
          {renderStatusMessage()}
        </div>
      </div>
    </div>
  );
}


/**
 * The form for submitting a new question.
 */
function NewQuestionForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Question submitted successfully! (This is a placeholder)');
  };

  const questionPlaceholder = `Please be as detailed as possible:\n1. Crop Name & Age\n2. Problem Duration (e.g., since 3 days)\n3. Affected Part (e.g., leaves, stem, fruit)\n4. Recent treatments or fertilizers used\n\nDescribe your issue...`;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-1">Submit a Detailed Query</h3>
      <p className="text-sm text-slate-500 mb-6">The more detail you provide, the better the expert's response.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">
            Category / विषय
          </label>
          <select id="category" name="category" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" defaultValue="">
            <option value="" disabled>-- Select a Category --</option>
            <option value="leaf_problems">Leaf Problems (Spots, Yellowing)</option>
            <option value="insect_control">Insect Identification & Control</option>
            <option value="soil_improvement">Soil Testing & Improvement</option>
            <option value="fertilizer_recommendations">Fertilizer Recommendations</option>
            <option value="market_rates">Market Rates & Trends</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description / विवरण
          </label>
          <textarea id="question" name="question" rows={7} className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder={questionPlaceholder}></textarea>
        </div>
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-1.5">
            Upload Photo/Video
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div className="flex text-sm text-slate-600"><label htmlFor="file-upload-input" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"><span>Upload a file</span><input id="file-upload-input" name="file-upload" type="file" className="sr-only" /></label><p className="pl-1">or drag and drop</p></div>
              <p className="text-xs text-slate-500">PNG, JPG, MP4 up to 10MB</p>
            </div>
          </div>
        </div>
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">Submit Question</button>
      </form>
    </div>
  );
}

/**
 * The screen to view history of consultations.
 */
function MyConsultations() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800 px-1 mb-6">Consultation History</h3>
      {mockConsultations.map((item) => (
        <details key={item.id} className="bg-white shadow-lg rounded-xl border border-slate-200 transition-all duration-300 open:ring-2 open:ring-blue-200 open:bg-blue-50/20">
          <summary className="cursor-pointer p-5 flex justify-between items-center list-none">
            <div className="flex-1">
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">{item.category}</p>
              <p className="text-base font-semibold text-slate-800 mt-1 truncate pr-4">{item.question}</p>
            </div>
            <div className="flex items-center space-x-4">
              <StatusBadge status={item.status} />
              <svg className="w-5 h-5 text-slate-500 transform transition-transform duration-300 details-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </summary>
          <div className="px-5 pb-5 pt-3 border-t border-slate-200">
            {item.imageUrl && (
              <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">Your Attachment:</h4>
                  <img src={item.imageUrl} alt="User submission" className="rounded-lg max-w-xs border-2 border-slate-200" />
              </div>
            )}
            {item.status === 'Answered' ? (
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-800">Expert's Response:</h4>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{item.answer}</p>
                <div className="mt-4 text-xs text-slate-500 text-right font-medium">- {item.expert.name}, <span className="italic">{item.expert.title}</span></div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 italic">An expert will review your question soon. You will be notified once they respond.</p>
            )}
          </div>
        </details>
      ))}
      <style>{`
        details summary::-webkit-details-marker { display: none; }
        details[open] > summary .details-arrow { transform: rotate(180deg); }
      `}</style>
    </div>
  );
}

// --- Main Page Component ---
export default function AskExpertPage() {
  const [activeTab, setActiveTab] = useState('form');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 py-10 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800">Expert Consultation</h1>
        <p className="text-lg text-slate-600 mt-2">
          Your direct line to agricultural specialists
        </p>
      </div>

      {/* Redesigned Tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-white shadow-md rounded-full p-1.5 flex space-x-1 border border-slate-200">
          {['form', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-2 px-5 font-semibold text-sm rounded-full transition-colors duration-300 focus:outline-none ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-blue-100'
              }`}
            >
              {tab === 'form' ? 'Ask a New Question' : 'My Consultations'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'form' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          <div className="lg:col-span-1">
            <VoiceAssistantBooking />
          </div>
          <div className="lg:col-span-2">
            <NewQuestionForm />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <MyConsultations />
        </div>
      )}
    </div>
  );
}
