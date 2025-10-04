import React from 'react';

// --- Mock Data ---
// In a real application, you would fetch this data from your backend API.
const mockConsultations = [
  {
    id: 1,
    category: 'Leaf Problems (Spots, Yellowing)',
    question: 'My tomato plants have yellow spots on the leaves. What could be the issue?',
    status: 'Answered',
    answer: 'This looks like early blight. It is a common fungal disease. I recommend using a copper-based fungicide and ensuring good air circulation around the plants.',
    expert: { name: 'Dr. Priya Sharma', title: 'Agronomist' },
    imageUrl: 'https://placehold.co/600x400/F5F5F5/333333?text=Tomato+Leaf', // Example image
  },
  {
    id: 2,
    category: 'Insect Identification & Control',
    question: 'There are small white insects on my brinjal plants. How can I get rid of them?',
    status: 'Answered',
    answer: 'Those are likely whiteflies. You can start by spraying a neem oil solution. If the infestation is heavy, consider using an appropriate insecticide.',
    expert: { name: 'Dr. Ramesh Kumar', title: 'Entomologist' },
    imageUrl: null, // No image was uploaded for this one
  },
  {
    id: 3,
    category: 'Soil Health',
    question: 'What is the best way to improve soil fertility for the next season?',
    status: 'Submitted',
    answer: null,
    expert: null,
    imageUrl: 'https://placehold.co/600x400/F5F5F5/333333?text=Soil+Sample', // Example image
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
    Closed: 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || styles.Closed}`}>{status}</span>;
}


/**
 * Voice Assistant Component using Web Speech API
 */
function VoiceAssistantBooking() {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle, listening, success, error
  const recognitionRef = React.useRef(null);

  const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  React.useEffect(() => {
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
    recognition.onerror = () => setStatus('error');
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
    if (status === 'listening') return <p className="text-center text-blue-600 animate-pulse">Listening...</p>;
    return <p className="text-center text-gray-600 text-sm">{transcript || 'Example: "Book an expert for leaf problems."'}</p>;
  };

  return (
    <div className={`p-6 rounded-xl border mb-8 text-center transition-all duration-300 shadow-sm ${status === 'success' ? 'bg-green-50 border-green-200' : status === 'error' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className="flex flex-col items-center">
        <h3 className="text-md font-semibold text-gray-900">Voice Assistant Booking</h3>
        <p className="text-sm text-gray-500 mb-4">Click the mic to speak.</p>
        
        <button 
          onClick={handleMicClick}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500' : 'bg-green-600 hover:bg-green-700'} text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          {isListening && <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            className="w-10 h-10 relative z-10"
          >
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v1h6v-1h-2v-2.07z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="mt-4 h-6 flex items-center justify-center">
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

  const questionPlaceholder = `1. Crop Name\n2. Problem Duration (e.g., since 3 days)\n3. Affected Part (e.g., leaves, stem)\n4. Previous Treatments\n\nDescribe your issue in detail...`;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Submit a Detailed Query</h3>
      <p className="text-sm text-gray-500 mb-6">Provide as much detail as possible for a better response.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category / विषय
            </label>
            <select id="category" name="category" className="block w-full text-sm border-2 border-green-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" defaultValue="">
              <option value="" disabled>-- Select a Category --</option>
              <option value="leaf_problems">Leaf Problems (Spots, Yellowing)</option>
              <option value="insect_control">Insect Identification & Control</option>
              <option value="soil_improvement">Soil Testing & Improvement</option>
              <option value="fertilizer_recommendations">Fertilizer Recommendations</option>
              <option value="market_rates">Market Rates & Trends</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
              Description / विवरण
            </label>
            <textarea id="question" name="question" rows={7} className="block w-full text-sm border-2 border-green-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder={questionPlaceholder}></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Photo/Video
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="flex text-sm text-gray-600"><label htmlFor="file-upload-input" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"><span>Upload a file</span><input id="file-upload-input" name="file-upload" type="file" className="sr-only" /></label><p className="pl-1">or drag and drop</p></div>
                <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 10MB</p>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Submit Question</button>
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
      <h3 className="text-lg font-semibold text-gray-900 px-1">Consultation History</h3>
      {mockConsultations.map((item) => (
        <details key={item.id} className="bg-white shadow-sm rounded-xl border border-gray-200 transition-all duration-300 [&[open]]:ring-2 [&[open]]:ring-green-200">
          <summary className="cursor-pointer p-4 flex justify-between items-center list-none">
            <div className="flex-1">
              <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">{item.category}</p>
              <p className="text-sm font-medium text-gray-800 mt-1 truncate pr-4">{item.question}</p>
            </div>
            <div className="flex items-center space-x-3">
              <StatusBadge status={item.status} />
              <svg className="w-5 h-5 text-gray-500 transform transition-transform details-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-gray-200">
            {item.imageUrl && (
              <div className="mb-4"><h4 className="text-xs font-semibold text-gray-600 mb-2">Attachment:</h4><img src={item.imageUrl} alt="User submission" className="rounded-lg max-w-xs border" /></div>
            )}
            {item.status === 'Answered' ? (
              <div>
                <h4 className="text-xs font-semibold text-gray-600">Expert's Response:</h4>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{item.answer}</p>
                <div className="mt-3 text-xs text-gray-500 text-right">- {item.expert.name}, <span className="italic">{item.expert.title}</span></div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">An expert will review your question soon.</p>
            )}
          </div>
        </details>
      ))}
      <style>{`
        details summary::-webkit-details-marker { display: none; }
        details[open] .details-arrow { transform: rotate(180deg); }
      `}</style>
    </div>
  );
}


// --- Main Page Component ---
function AskExpertPage() {
  const [activeTab, setActiveTab] = React.useState('form');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-10 px-4">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">🌾 Expert Consultation</h1>
        <p className="text-md text-gray-600 mt-2">
          Your direct line to agricultural specialists
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white shadow-md rounded-full flex space-x-6 px-6 py-2">
          {['form', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-2 px-3 font-medium text-sm transition ${
                activeTab === tab
                  ? 'text-green-700'
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              {tab === 'form' ? 'Ask a New Question' : 'My Consultations'}
              {activeTab === tab && (
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-green-600 rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'form' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <VoiceAssistantBooking />
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

export default AskExpertPage;