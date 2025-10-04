import React, { useState } from 'react';
import FileUpload from '../farmer_daily_operation_components/DiseasePage/FileUpload';
import AgriShops from '../farmer_daily_operation_components/DiseasePage/AgriShops';
import RecommendProducts from '../farmer_daily_operation_components/DiseasePage/RecommendProducts'
import diseaseData from '../assets/disease_chemicals_data.json';

const IdentifyDisease = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('cotton');
  const [showCropInfo, setShowCropInfo] = useState(false);
  const [error, setError] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Only cotton crop
  const crops = [
    { id: 'cotton', name: 'Cotton', icon: '🧶' }
  ];

  const cropDiseases = {
    cotton: {
      commonDiseases: Object.keys(diseaseData.cotton),
      imageExample: "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  };

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError('');
    setShowRecommendations(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please upload an image.');
      return;
    }
    setIsUploading(true);
    setError('');

    // Resize image to 224x224 before sending
    const resizeImage = (file) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();
        reader.onload = (e) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 224;
            canvas.height = 224;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 224, 224);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: blob.type }));
              } else {
                reject(new Error('Image resizing failed.'));
              }
            }, file.type || 'image/jpeg');
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const resizedFile = await resizeImage(file);
      const formData = new FormData();
      formData.append('file', resizedFile);
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Prediction failed');
      }
      const data = await response.json();
      
      // Get disease info from the imported JSON
      const diseaseInfo = diseaseData.cotton[data.disease] || {
        Symptoms: 'No specific symptoms information available',
        Preventive_measures: 'Consult your local agri expert for prevention options.',
        Chemicals: [],
        links: [],
        Organic: []
      };

      setResult({
        crop: 'cotton',
        disease: data.disease,
        confidence: (data.confidence * 100).toFixed(2) + '%',
        symptoms: diseaseInfo.Symptoms,
        prevention: diseaseInfo.Preventive_measures,
        chemicals: diseaseInfo.Chemicals,
        organic: diseaseInfo.Organic || [],
        links: diseaseInfo.links || [] 
      });
      
      setShowRecommendations(true);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              🌱 Cotton Disease Detection
            </h1>
            <p className="text-gray-700 text-xl max-w-2xl mx-auto leading-relaxed">
              Harness the power of AI to identify cotton diseases instantly. Upload an image of affected leaves for professional diagnosis.
            </p>
          </div>

          {/* Crop Selection Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              🌾 Selected Crop
            </h2>
            
            <div className="grid grid-cols-1 gap-6 max-w-xs mx-auto">
              {crops.map((crop, index) => (
                <div 
                  key={crop.id}
                  className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-400 shadow-lg shadow-green-200/50`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 to-emerald-400/20" />
                  
                  <div className="relative flex items-center justify-center flex-col">
                    <span className="text-4xl mb-3">
                      {crop.icon}
                    </span>
                    <span className="font-semibold text-lg text-gray-800">{crop.name}</span>
                    
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Crop Info Toggle */}
            {selectedCrop && (
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowCropInfo(!showCropInfo)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>{showCropInfo ? 'Hide' : 'Show'} common cotton diseases</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 ml-2 transition-transform duration-300 ${showCropInfo ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Crop Information Panel */}
          {showCropInfo && selectedCrop && (
            <div className="mb-12">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <img 
                      src="https://images.unsplash.com/photo-1605618485739-f68895652186?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNvdHRvbnxlbnwwfHwwfHx8MA%3D%3D"
                      alt={`Healthy ${selectedCrop} plant`}
                      className="w-full h-64 rounded-2xl object-cover shadow-lg"
                    />
                  </div>
                  <div className="lg:w-2/3">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="text-3xl mr-3">{crops.find(c => c.id === selectedCrop)?.icon}</span>
                      Common Cotton Diseases
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {cropDiseases[selectedCrop].commonDiseases.map((disease, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200"
                        >
                          <span className="text-red-500 mr-3">🦠</span>
                          <span className="text-gray-700 font-medium">{disease}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <p className="text-gray-700">
                        <span className="font-bold text-blue-600">💡 Pro Tip:</span> For best results, upload clear photos of affected leaves against a plain background in good lighting conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Section */}
          <div>
            <FileUpload onFileChange={handleFileChange} />
          </div>
          
          {/* Upload Button */}
          <div className="text-center mt-8">
            <button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className={`relative px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                !file 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <div
                    className="w-6 h-6 border-4 border-white border-t-transparent rounded-full mr-3 animate-spin"
                  />
                  Analyzing Your Crop...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🔍</span>
                  Identify Disease
                </span>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 text-red-600 text-center">
              {error}
            </div>
          )}
          
          {/* Results Section */}
          {result && (
            <div className="mt-16">
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-200">
                <div className="flex items-center mb-8">
                  <span className="text-4xl mr-4">
                    🧶
                  </span>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Cotton Analysis Results
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {/* Disease Detection */}
                  <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                      <span className="text-red-500 mr-3">🦠</span>
                      Detected Disease
                    </h3>
                    <p className="text-2xl font-bold text-green-700 mb-2">{result.disease}</p>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-3">Confidence Level:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                          style={{ width: result.confidence }}
                        />
                      </div>
                      <span className="font-bold text-green-600">{result.confidence}</span>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <h4 className="text-xl font-bold text-blue-700 mb-3 flex items-center">
                      <span className="mr-3">🔍</span>
                      Symptoms
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{result.symptoms}</p>
                  </div>

                  {/* Prevention */}
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <h4 className="text-xl font-bold text-green-700 mb-3 flex items-center">
                      <span className="mr-3">🛡️</span>
                      Prevention Tips
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{result.prevention}</p>
                  </div>

                  {/* Organic Remedies */}
                  <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200">
                    <h4 className="text-xl font-bold text-yellow-700 mb-3 flex items-center">
                      <span className="mr-3">🌿</span>
                      Organic Remedies
                    </h4>
                    {result.organic && result.organic.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {result.organic.map((remedy, index) => (
                          <li key={`organic-${index}`}>{remedy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 italic">No organic treatment methods available for this disease.</p>
                    )}
                  </div>

                  {/* Chemical Treatments */}
                  {result.chemicals && result.chemicals.length > 0 && (
                    <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
                      <h4 className="text-xl font-bold text-red-700 mb-3 flex items-center">
                        <span className="mr-3">⚠️</span>
                        Chemical Treatments
                      </h4>
                      <ul className="space-y-2">
                        {result.chemicals.map((chemical, index) => (
                          <li key={`chemical-${index}`} className="text-gray-700">
                            <div className="flex flex-wrap items-baseline">
                              <span>{chemical}</span>
                              {result.links && result.links[index] && (
                                <a 
                                  href={result.links[index]} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-xs text-blue-500 hover:underline"
                                >
                                  (more info)
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional Components */}
      {showRecommendations && result && (
        <>
          <div>
            <RecommendProducts chemicals={result.chemicals} disease={result.disease} />
          </div>
          <div>
            <AgriShops userLocation={{ latitude: 18.5204, longitude: 73.8567 }} />
          </div>
        </>
      )}
    </>
  );
};

export default IdentifyDisease;