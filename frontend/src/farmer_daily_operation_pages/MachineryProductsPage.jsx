import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from '../farmer_daily_operation_components/ProductCard'; // Assuming this component exists
import { Search } from 'lucide-react';

export default function MachineryProductsPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Set initial loading to false
  const [error, setError] = useState(null);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Updated color scheme for search sources to match the blue theme
  const searchSources = [
    { name: "Amazon", baseUrl: "https://www.amazon.in/s?k=", color: "bg-slate-800 hover:bg-slate-900" },
    { name: "Agri-Route", baseUrl: "https://www.agri-route.com/search?q=", color: "bg-blue-700 hover:bg-blue-800" },
    { name: "Flipkart", baseUrl: "https://www.flipkart.com/search?q=", color: "bg-sky-600 hover:bg-sky-700" },
  ];

  const handleSearch = (baseUrl) => {
    if (!query) return;
    window.open(`${baseUrl}${encodeURIComponent(query)}`, "_blank");
  };

  const loadProducts = async () => {
    // Only load if a search has been initiated by the user
    if (!searchInitiated) {
        setProducts([]); // Ensure no products are shown initially
        return;
    }

    setLoading(true);
    setError(null);
    setProducts([]);

    // Use a default search term if the query is empty but a search was triggered
    const searchQuery = query || "modern farming equipment";

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
        sourceColor: "bg-slate-800",
        rating: parseFloat(p.product_star_rating) || 0,
        reviews: p.product_num_ratings || 0,
        price: p.product_price || "N/A",
      }));

      // Filter out products without an image or title
      amazonProducts = amazonProducts.filter(p => p.image && p.name);

      // Sort by rating and take the top 10 for a richer display
      amazonProducts.sort((a, b) => b.rating - a.rating);
      setProducts(amazonProducts.slice(0, 5));

    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to fetch products. The API may be unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search when the user presses Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        setSearchInitiated(true);
        loadProducts();
    }
  }

  // Trigger search when query changes after the initial search
  useEffect(() => {
    if (searchInitiated) {
        const handler = setTimeout(() => {
            loadProducts();
        }, 500); // Debounce API calls
        return () => clearTimeout(handler);
    }
  }, [query, searchInitiated]);

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-blue-50 min-h-screen font-sans antialiased text-slate-800">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="py-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-2">🚜 KrishiConnect</h1>
          <p className="text-lg sm:text-xl text-blue-700 font-medium">Your one-stop hub for farm machinery & tools</p>
        </header>

        {/* Search Section */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 mb-10 sticky top-4 z-10 backdrop-blur-sm bg-white-80">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search for tractors, tillers, sprayers..."
                    className="w-full p-4 pl-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {searchSources.map((src) => (
                <button
                  key={src.name}
                  className={`${src.color} text-white px-4 py-2.5 rounded-xl font-semibold transition-transform hover:scale-105`}
                  onClick={() => handleSearch(src.baseUrl)}
                >
                  {src.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-blue-900">Top Rated Machinery</h2>
          {loading && (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-blue-700 font-semibold">Loading products...</p>
            </div>
          )}
          {error && <p className="text-center text-red-600 font-medium bg-red-50 p-6 rounded-lg">{error}</p>}
          
          {/* Grid with products */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {products.map((product, index) => (
                <ProductCard key={`${product.link}-${index}`} product={product} />
              ))}
            </div>
          )}

          {/* Initial state before search */}
          {!loading && !error && !searchInitiated && (
             <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-blue-100">
                <h3 className="text-2xl font-bold text-slate-700">Ready to find your gear?</h3>
                <p className="text-slate-500 mt-2">Enter a search term above and press Enter to see top-rated products.</p>
             </div>
          )}
          
          {/* Empty state after a search returns no results */}
          {!loading && !error && products.length === 0 && searchInitiated && (
             <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-blue-100">
                <h3 className="text-2xl font-bold text-slate-700">No Products Found</h3>
                <p className="text-slate-500 mt-2">Your search for "{query}" did not return any results. Please try a different term.</p>
             </div>
          )}
        </section>

        {/* Disclaimer */}
        <div className="mt-12 text-center border-t border-blue-200 pt-8">
          <p className="text-slate-600 text-sm">All product data and prices are sourced directly from third-party sites.</p>
        </div>

      </div>
    </div>
  );
}

