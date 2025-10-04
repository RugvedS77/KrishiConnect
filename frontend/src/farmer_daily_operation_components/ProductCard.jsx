export default function ProductCard({ product }) {
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition transform hover:-translate-y-1 border border-green-100"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-44 object-cover group-hover:scale-105 transition"
        loading="lazy"
      />
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-green-900 line-clamp-2">{product.name}</h3>
        <span className={`inline-block mt-2 text-white text-xs font-semibold px-3 py-1 rounded-full ${product.sourceColor}`}>
          {product.source}
        </span>
        {product.price && <p className="mt-2 text-green-800 font-bold">₹ {product.price}</p>}
        <div className="mt-2 flex justify-center items-center text-yellow-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-yellow-400" : "fill-gray-300"}`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.377 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.376-2.454a1 1 0 00-1.176 0l-3.376 2.454c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.288-3.967z" />
            </svg>
          ))}
          <span className="ml-2 text-sm text-gray-600">{product.rating} ({product.reviews} reviews)</span>
        </div>
        <p className="mt-1 text-sm text-gray-600">Click to view price & details</p>
      </div>
    </a>
  );
}
