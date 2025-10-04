import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from '../farmer_daily_operation_components/ProductCard'

export default function MachineryProductsPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchSources = [
    { name: "Amazon", baseUrl: "https://www.amazon.in/s?k=", color: "bg-gray-600 hover:bg-gray-700" },
    { name: "Agri-Route", baseUrl: "https://www.agri-route.com/search?q=", color: "bg-green-600 hover:bg-green-700" },
    { name: "Flipkart", baseUrl: "https://www.flipkart.com/search?q=", color: "bg-blue-600 hover:bg-blue-700" },
  ];

  const handleSearch = (baseUrl) => {
    if (!query) return;
    window.open(`${baseUrl}${encodeURIComponent(query)}`, "_blank");
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    setProducts([]);

    const searchQuery = query || "farming machine";

    try {
      const amazonURL = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&country=IN&language=en_IN`;
      const amazonOptions = {
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
          "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com",
        },
      };

      const amazonRes = await axios.get(amazonURL, amazonOptions);
      console.log("Amazon API response:", amazonRes.data);

      let amazonProducts = (amazonRes.data?.data?.products || []).map((p) => ({
        name: p.product_title,
        link: p.product_url,
        image: p.product_photo,
        source: "Amazon",
        sourceColor: "bg-gray-600",
        rating: parseFloat(p.product_star_rating) || 0,
        reviews: p.product_num_ratings || 0,
        price: p.product_price || null,
      }));

      // Sort by rating (descending) and pick top 5
      amazonProducts.sort((a, b) => b.rating - a.rating);
      amazonProducts = amazonProducts.slice(0, 1);

      setProducts(amazonProducts);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [query]);

  return (
    <div className="bg-gradient-to-b from-green-50 via-white to-green-50 min-h-screen font-sans antialiased text-gray-800">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="py-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 mb-2">🚜 KrishiConnect</h1>
          <p className="text-xl text-green-700 font-medium">Your one-stop shop for farm machinery & tools</p>
        </header>

        {/* Search */}
        <section className="bg-white p-6 rounded-2xl shadow-md border border-green-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search for farm machinery..."
              className="flex-1 p-4 rounded-xl border border-green-300 focus:outline-none focus:ring-4 focus:ring-green-100"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {searchSources.map((src) => (
                <button
                  key={src.name}
                  className={`${src.color} text-white px-4 py-3 rounded-xl font-medium transition`}
                  onClick={() => handleSearch(src.baseUrl)}
                >
                  {src.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section>
          <h2 className="text-2xl font-bold mb-5 text-green-800">Top Rated Farm Machinery</h2>
          {loading && (
            <div className="text-center py-10">
              <div className="w-16 h-16 border-4 border-green-500 border-dashed rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-green-700">Loading products...</p>
            </div>
          )}
          {error && <p className="text-center text-red-500 py-10">{error}</p>}
          {!loading && !error && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No products found.</p>
          )}
        </section>

        {/* Help / Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 text-sm">All products and prices come from their respective sites.</p>
          <div className="mt-3">
            <a
              href="https://wa.me/+919422430031"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-600 text-white px-5 py-3 rounded-full shadow hover:bg-green-700 transition"
            >
              <i className="fab fa-whatsapp mr-2"></i>
              Need Help Choosing?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
