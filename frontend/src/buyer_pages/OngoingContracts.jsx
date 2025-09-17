import React, { useState } from "react";
import { ChevronRight, ArrowLeft, CheckCircle, Circle } from "lucide-react";

const contracts = [
  {
    id: 1,
    crop: "Organic Wheat",
    farmer: "Raj Patel",
    price: "$125,000",
    delivery: "2025-11-20",
    status: "Farming in Progress",
    milestones: [
      { name: "Contract Accepted", done: true },
      { name: "Farming in Progress", done: true },
      { name: "Harvesting", done: false },
      { name: "Ready for Delivery", done: false },
      { name: "Delivered", done: false },
    ],
  },
  {
    id: 2,
    crop: "Basmati Rice",
    farmer: "Anita Kaur",
    price: "$960,000",
    delivery: "2025-12-10",
    status: "Harvesting",
    milestones: [
      { name: "Contract Accepted", done: true },
      { name: "Farming in Progress", done: true },
      { name: "Harvesting", done: true },
      { name: "Ready for Delivery", done: false },
      { name: "Delivered", done: false },
    ],
  },
];

// Horizontal milestone progress bar
const MilestoneTracker = ({ milestones }) => {
  return (
    <div className="relative flex items-center justify-between w-full mt-6">
      {milestones.map((m, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center">
          {/* Dot */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
              m.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {m.done ? (
              <CheckCircle size={18} className="text-white" />
            ) : (
              <Circle size={18} />
            )}
          </div>
          {/* Label */}
          <p
            className={`mt-2 text-sm text-center ${
              m.done ? "text-green-700 font-medium" : "text-gray-500"
            }`}
          >
            {m.name}
          </p>
          {/* Line connector (skip last dot) */}
          {idx < milestones.length - 1 && (
            <div
              className={`absolute top-4 left-[calc(10%+${idx * 20}%)] h-1 w-[20%] ${
                milestones[idx].done ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

const OngoingContracts = () => {
  const [selectedContract, setSelectedContract] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-green-800">Ongoing Contracts</h1>
        <p className="text-gray-600 mt-1">
          Track the progress of your active agreements.
        </p>
      </header>

      {/* Contract List View */}
      {!selectedContract && (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedContract(c)}
              className="p-5 bg-white rounded-xl shadow-md border cursor-pointer hover:bg-green-50 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg text-gray-800">{c.crop}</h3>
                <p className="text-sm text-gray-500">with {c.farmer}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">{c.price}</p>
                <p className="text-sm text-gray-500">Due: {c.delivery}</p>
              </div>
              <ChevronRight className="text-gray-400" />
            </div>
          ))}
        </div>
      )}

      {/* Contract Detail View */}
      {selectedContract && (
        <div className="bg-white p-6 rounded-xl shadow-md border">
          {/* Back Button */}
          <button
            onClick={() => setSelectedContract(null)}
            className="flex items-center text-green-700 hover:underline mb-4"
          >
            <ArrowLeft size={18} className="mr-1" /> Back to Contracts
          </button>

          <h2 className="text-2xl font-bold text-gray-800">
            {selectedContract.crop}
          </h2>
          <p className="text-gray-600">with {selectedContract.farmer}</p>

          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold">{selectedContract.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery Date</p>
              <p className="font-semibold">{selectedContract.delivery}</p>
            </div>
          </div>

          {/* Milestone Section */}
          <h3 className="text-lg font-semibold mt-6">Milestone Progress</h3>
          <MilestoneTracker milestones={selectedContract.milestones} />

          {/* Farmer Updates */}
          <h3 className="text-lg font-semibold mt-8">Farmer Updates</h3>
          <div className="text-sm p-4 bg-green-50 rounded-md border mt-2">
            <p className="font-semibold">
              {selectedContract.farmer} (2 days ago):
            </p>
            <p className="text-gray-700">
              {selectedContract.status === "Harvesting"
                ? "Harvesting is in progress. Weather is favorable."
                : "Farming progressing smoothly. Regular irrigation ongoing."}
            </p>
          </div>

          {/* Escrow + Action */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm font-semibold">
              Escrow Status:{" "}
              <span className="text-green-600">Advance Paid</span>
            </p>
            <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Request Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OngoingContracts;
