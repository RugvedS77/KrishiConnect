import { Download, Star, User } from 'lucide-react';

const completedContracts = [
  { id: 101, crop: 'Soybeans', farmer: 'Priya Sharma', date: '2025-08-20' },
  { id: 98, crop: 'Corn', farmer: 'Amit Singh', date: '2025-07-15' },
];

const Profile = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="bg-green-100 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">My Profile</h1>
          <p className="text-green-700 mt-1">
            Manage your details and keep track of your farming contracts 🌾
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
            Edit Profile
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Buyer Information */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center">
              <User className="text-green-700" size={40} />
            </div>
            <h3 className="text-xl font-semibold mt-3 text-gray-800">Mayuresh Marade</h3>
            <p className="text-sm text-gray-500">Wholesaler</p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Contact Email</p>
              <p className="font-medium">john.doe@example.com</p>
            </div>
            <div>
              <p className="text-gray-500">Phone Number</p>
              <p className="font-medium">+1 (123) 456-7890</p>
            </div>
            <div>
              <p className="text-gray-500">Business Type</p>
              <p className="font-medium">Wholesaler</p>
            </div>
          </div>
        </div>

        {/* Contract History */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
            🌱 Completed Contracts
          </h3>

          <div className="mt-4 space-y-4">
            {completedContracts.map((contract, index) => (
              <div
                key={contract.id}
                className="p-5 border rounded-lg shadow-sm bg-green-50 flex justify-between items-center hover:bg-green-100 transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {contract.crop} with {contract.farmer}
                  </p>
                  <p className="text-sm text-gray-600">
                    ✅ Completed on: {contract.date}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-3 py-1.5 text-green-700 border border-green-600 rounded-lg hover:bg-green-200 flex items-center gap-1">
                    <Download size={16} />
                    PDF
                  </button>
                  <button className="px-3 py-1.5 text-yellow-700 border border-yellow-600 rounded-lg hover:bg-yellow-200 flex items-center gap-1">
                    <Star size={16} />
                    Rate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
