import React, { useState } from 'react';

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
  // State to manage which FAQ is currently open
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    // If the clicked FAQ is already open, close it. Otherwise, open it.
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Support & Help Center
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Contact & Guides --- */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Contact Support Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Support
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Can't find your answer? Get in touch with our team.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <i className="fas fa-envelope text-green-500 w-5 mr-3"></i>
                <span className="text-gray-700">support@agricontract.com</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone text-green-500 w-5 mr-3"></i>
                <span className="text-gray-700">+91-22-12345678</span>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Submit a Ticket
            </button>
          </div>

          {/* Helpful Guides Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Helpful Guides
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-green-600 hover:underline flex items-center">
                  <i className="fas fa-book-open mr-2 text-sm"></i>
                  How to create an effective listing
                </a>
              </li>
              <li>
                <a href="#" className="text-green-600 hover:underline flex items-center">
                  <i className="fas fa-book-open mr-2 text-sm"></i>
                  Understanding payment escrow
                </a>
              </li>
              <li>
                <a href="#" className="text-green-600 hover:underline flex items-center">
                  <i className="fas fa-book-open mr-2 text-sm"></i>
                  How to handle contract disputes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* --- Right Column: FAQs --- */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="divide-y divide-gray-200">
            {faqs.map((item, index) => (
              <div key={index}>
                {/* FAQ Question (Button) */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full py-4 text-left"
                >
                  <span className="text-base font-medium text-gray-900">
                    {item.q}
                  </span>
                  <i
                    className={`fas ${
                      openFaq === index ? 'fa-chevron-up' : 'fa-chevron-down'
                    } text-gray-500 transition-transform duration-200`}
                  ></i>
                </button>
                
                {/* FAQ Answer (Collapsible) */}
                {openFaq === index && (
                  <div className="pb-4 text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}