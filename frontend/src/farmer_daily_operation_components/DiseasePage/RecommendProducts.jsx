import React, { useState, useEffect } from 'react';
import { FaChevronRight, FaChevronLeft, FaFlask } from 'react-icons/fa';
import diseaseData from '../../assets/disease_chemicals_data.json';
import productsData from '../../assets/output.json'; 

const RecommendProducts = ({ chemicals = [], disease = "" }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount] = useState(2); // 👈 Only show 2 products
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setProducts(productsData); 
        setLoading(false); 
    }, []);

    useEffect(() => {
        if (chemicals.length > 0 && products.length > 0) {
            findRecommendations();
        }
    }, [chemicals, products]);

    useEffect(() => {
        if (filteredProducts.length > 0) {
            setCurrentIndex(0);
        }
    }, [filteredProducts]);

    const extractChemicalBase = (chemStr) => {
        return (chemStr || '')
            .replace(/\d+\.?\d*%/, '')
            .replace(/\b(SC|WP|EC|SL|EW|WG|OD|SE)\b/gi, '')
            .trim()
            .toLowerCase();
    };

    const stringSimilarity = (a, b) => {
        if (!a || !b) return 0;
        a = a.toLowerCase();
        b = b.toLowerCase();
        const lenA = a.length;
        const lenB = b.length;
        const matrix = [];

        for (let i = 0; i <= lenA; i++) matrix[i] = [i];
        for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

        for (let i = 1; i <= lenA; i++) {
            for (let j = 1; j <= lenB; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return 1 - matrix[lenA][lenB] / Math.max(lenA, lenB);
    };

    const findRecommendations = () => {
        const cropUpper = "COTTON";
        const diseaseInfo = diseaseData[cropUpper]?.[disease] || {};
        const chemLinkMap = {};

        if (diseaseInfo.Chemicals && diseaseInfo.links) {
            diseaseInfo.Chemicals.forEach((chem, index) => {
                chemLinkMap[extractChemicalBase(chem)] = diseaseInfo.links[index];
            });
        }

        const recommendations = products.filter(product => {
            const productChemicals = (product.compound || '').split(/[,/&+]/).map(c => extractChemicalBase(c));
            const productCrops = product.crop_ids || [];

            return productCrops.includes(cropUpper) &&
                chemicals.some(inputChem => {
                    const inputBase = extractChemicalBase(inputChem);
                    return productChemicals.some(productChem => stringSimilarity(inputBase, productChem) > 0.6);
                });
        }).map(product => {
            const matchedChemicals = chemicals.filter(inputChem => {
                const inputBase = extractChemicalBase(inputChem);
                const productChems = (product.compound || '').split(/[,/&+]/).map(c => extractChemicalBase(c));
                return productChems.some(pc => stringSimilarity(inputBase, pc) > 0.6);
            });

            const matchedChemicalsWithLinks = matchedChemicals.map(chem => {
                const base = extractChemicalBase(chem);
                return {
                    name: chem,
                    link: chemLinkMap[base] || null
                };
            });

            return {
                ...product,
                matched_chemicals: matchedChemicalsWithLinks,
                similarity: Math.max(...matchedChemicals.map(chem => {
                    const inputBase = extractChemicalBase(chem);
                    const productChems = (product.compound || '').split(/[,/&+]/).map(c => extractChemicalBase(c));
                    return Math.max(...productChems.map(pc => stringSimilarity(inputBase, pc)));
                }))
            };
        }).sort((a, b) => b.similarity - a.similarity);

        setFilteredProducts(recommendations);
    };

    const showNextProducts = () => {
        const newIndex = currentIndex + visibleCount;
        if (newIndex < filteredProducts.length) setCurrentIndex(newIndex);
    };

    const showPreviousProducts = () => {
        const newIndex = Math.max(currentIndex - visibleCount, 0);
        setCurrentIndex(newIndex);
    };

    const displayedProducts = filteredProducts.slice(currentIndex, currentIndex + visibleCount);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 relative">
            <h2 className="text-2xl font-bold text-sky-700 mb-6">
                Recommended Products for {disease}
            </h2>

            {filteredProducts.length === 0 ? (
                <p className="text-gray-600">No products found matching the recommended chemicals.</p>
            ) : (
                <div className="relative">
                    {/* Left Arrow */}
                    {currentIndex > 0 && (
                        <button
                            onClick={showPreviousProducts}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-slate-200 p-2 rounded-full shadow-md hover:bg-sky-50"
                        >
                            <FaChevronLeft className="text-sky-600" />
                        </button>
                    )}

                    {/* Product Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                        {displayedProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl border border-slate-200 transition-all duration-300">
                                <div className="h-48 bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                                    {product.thumbnail_image_url ? (
                                        <img
                                            src={product.thumbnail_image_url}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-sky-400 flex flex-col items-center">
                                            <FaFlask className="text-5xl mb-2" />
                                            <span>No Image Available</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <h3 className="text-xl font-semibold text-sky-800 mb-2">{product.name}</h3>
                                    <p className="text-slate-700 text-sm mb-3">{product.company}</p>

                                    <div className="mb-3">
                                        <p className="font-medium text-sm text-slate-700">Matched Chemicals:</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {product.matched_chemicals.map((chemObj, i) => (
                                                <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                                                    {chemObj.link ? (
                                                        <a href={chemObj.link} target="_blank" rel="noopener noreferrer" className="underline text-green-800">
                                                            {chemObj.name}
                                                        </a>
                                                    ) : (
                                                        chemObj.name
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-sm text-slate-700">
                                        <p><span className="font-medium">Compound:</span> {product.compound}</p>
                                        <p><span className="font-medium">Dosage:</span> {product.description?.dosage || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    {currentIndex + visibleCount < filteredProducts.length && (
                        <button
                            onClick={showNextProducts}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-slate-200 p-2 rounded-full shadow-md hover:bg-sky-50"
                        >
                            <FaChevronRight className="text-sky-600" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecommendProducts;
