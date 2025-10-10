import React, { useState } from 'react';
import { Mail, Phone, BookOpen, ChevronDown, LifeBuoy } from 'lucide-react';

// --- Dummy Data for FAQs ---
const faqs = [
  {
    q: 'How do I create a new crop listing?',
    a: 'Navigate to the "Create Listing" page from your dashboard or sidebar. Fill in all the required fields like crop type, quantity, and harvest date, then click "Create Listing".',
  },
  {
    q: 'What happens when I accept a buyer\'s proposal?',
    a: 'Once you accept a buyer\'s proposal, a new contract is automatically created. You can find this new contract on your "Ongoing Contracts" page, ready for you to start tracking milestones.',
  },
  {
    q: 'How do I update a milestone for an ongoing contract?',
    a: 'Go to the "Ongoing Contracts" page and find the relevant contract. In the "Upload Update" section for that contract, you can add text or upload photos. This will notify the buyer of your progress.',
  },
  {
    q: 'How and when do I get paid?',
    a: 'Payments are handled through our secure escrow system. The buyer funds the escrow when the contract is accepted. Milestones (like "Harvesting") trigger partial payments, and the final payment is released upon successful delivery and buyer confirmation.',
  },
  {
    q: 'What should I do if a buyer disputes a milestone?',
    a: 'First, try to communicate with the buyer directly using the platform\'s messaging (feature coming soon). If you cannot resolve the issue, please "Submit a Ticket" to our support team, and a mediator will assist you.',
  },
];

// --- Main Page Component ---
export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-slate-50/50 min-h-screen p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="flex-shrink-0 bg-white p-3 rounded-full border border-slate-200 shadow-sm">
                <LifeBuoy className="h-8 w-8 text-slate-600"/>
            </div>
            <div>
                 <h1 className="text-3xl font-bold text-slate-900">
                    Support & Help Center
                 </h1>
                 <p className="text-slate-500 mt-1">
                    Find answers to your questions or get in touch with our team.
                 </p>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Contact & Guides --- */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Contact Support Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Contact Support
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              Can't find your answer? Get in touch with our team.
            </p>
            <div className="space-y-4 mb-6">
              <a href="mailto:support@agriconnect.com" className="flex items-center text-slate-700 hover:text-blue-600 transition-colors">
                <Mail className="w-5 h-5 text-slate-400 mr-3" />
                <span className="font-medium">support@agriconnect.com</span>
              </a>
              <a href="tel:+912212345678" className="flex items-center text-slate-700 hover:text-blue-600 transition-colors">
                <Phone className="w-5 h-5 text-slate-400 mr-3" />
                <span className="font-medium">+91-22-12345678</span>
              </a>
            </div>
            <button className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
              Submit a Ticket
            </button>
          </div>

          {/* Helpful Guides Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Helpful Guides
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-blue-600 hover:underline font-medium flex items-center">
                  <BookOpen size={16} className="mr-2 text-slate-500" />
                  How to create an effective listing
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline font-medium flex items-center">
                  <BookOpen size={16} className="mr-2 text-slate-500" />
                  Understanding payment escrow
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline font-medium flex items-center">
                  <BookOpen size={16} className="mr-2 text-slate-500" />
                  How to handle contract disputes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* --- Right Column: FAQs --- */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="divide-y divide-slate-200">
            {faqs.map((item, index) => (
              <div key={index}>
                {/* FAQ Question (Button) */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full py-4 text-left"
                >
                  <span className="text-base font-medium text-slate-900">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                {/* FAQ Answer (Collapsible) */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openFaq === index ? 'max-h-screen' : 'max-h-0'
                    }`}
                >
                    <div className="pb-4 pt-1 text-sm text-slate-600 leading-relaxed">
                      {item.a}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}

