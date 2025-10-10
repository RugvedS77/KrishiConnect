import React, { useState, useEffect } from 'react';
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import SolutionTabs from '../farmer_daily_operation_components/DiseasePage/SolutionTabs';
import diseaseData from '../assets/disease_chemicals_data.json';
import { API_BASE_URL } from "../api/apiConfig";

// Configuration object for all supported crops
const CROP_CONFIG = {
  cotton: {
    name: 'Cotton',
    emoji: '🌱',
    apiEndpoint: `${API_BASE_URL}/api/services/cotton-predict`,
    commonDiseases: [
      "Bacterial Blight", "Powdery Mildew", "Fusarium Wilt", "Target Spot", 
      "Verticillium Wilt", "Curl Virus", "Cotton Boll Rot"
    ],
  },
  tomato: {
    name: 'Tomato',
    emoji: '🍅',
    apiEndpoint: `${API_BASE_URL}/api/services/tomato-predict`,
    commonDiseases: [
      "Bacterial spot", "Early blight", "Late blight", "Leaf Mold",
      "Septoria leaf spot", "Spider mites", "Target Spot", "Yellow Leaf Curl Virus", "Mosaic virus"
    ],
  }
};

// Dynamic scrolling ticker component
const DiseaseTicker = ({ diseases }) => {
  const extendedDiseases = [...diseases, ...diseases];
  return (
    <div className="ticker-wrap">
      <div className="ticker-move">
        {extendedDiseases.map((disease, index) => (
          <div key={index} className="ticker-item">
            <span className="mr-2">🦠</span>
            {disease}
          </div>
        ))}
      </div>
    </div>
  );
};

// ProcessStepper component
const ProcessStepper = ({ stage }) => {
    const steps = [
        { id: 'upload', title: 'Upload Image', emoji: '📸' },
        { id: 'analyze', title: 'AI Analysis', emoji: '🧠' },
        { id: 'result', title: 'Get Solution', emoji: '💡' }
    ];
    const stageIndex = steps.findIndex(step => step.id === stage);
    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = index === stageIndex;
                    const isCompleted = index < stageIndex;
                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-300 ${isActive ? 'bg-green-500 shadow-lg shadow-green-200' : isCompleted ? 'bg-green-500' : 'bg-slate-200'}`}>{isCompleted ? '✔️' : step.emoji}</div>
                                <p className={`mt-3 font-bold ${isActive || isCompleted ? 'text-green-600' : 'text-slate-500'}`}>{step.title}</p>
                            </div>
                            {index < steps.length - 1 && (<div className={`flex-1 h-1 mx-4 rounded ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`}></div>)}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

// InfoCard component (kept here for Symptoms & Prevention cards)
const InfoCard = ({ icon, title, color, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-200/80`}>
        {React.cloneElement(icon, { className: `w-7 h-7 ${color}` })}
        <h3 className={`text-lg font-bold ${color}`}>{title}</h3>
        </div>
        <div className="p-6 text-slate-700 leading-relaxed text-base">{children}</div>
    </div>
);


const IdentifyDisease = () => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") { setDragActive(true); } else if (e.type === "dragleave") { setDragActive(false); } };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { handleFileChange(e.dataTransfer.files[0]); } };
  const handleFileChange = (selectedFile) => { if (selectedFile && selectedFile.type.startsWith('image/')) { setFile(selectedFile); setError(''); setResult(null); } else { setError('Please select a valid image file.'); } };
  
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setPreviewUrl(null);
    setSelectedCrop(null);
  };

  const handleUpload = async () => {
    if (!file || !selectedCrop) {
      setError('Please select a crop and upload an image.');
      return;
    }
    setIsUploading(true);
    setError('');

    const resizeImage = (file) => new Promise((resolve, reject) => { const img = new window.Image(); const reader = new FileReader(); reader.onload = (e) => { img.onload = () => { const canvas = document.createElement('canvas'); canvas.width = 224; canvas.height = 224; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, 224, 224); canvas.toBlob((blob) => { if (blob) { resolve(new File([blob], file.name, { type: blob.type })); } else { reject(new Error('Image resizing failed.')); } }, file.type || 'image/jpeg'); }; img.onerror = reject; img.src = e.target.result; }; reader.onerror = reject; reader.readAsDataURL(file); });

    try {
      const resizedFile = await resizeImage(file);
      const formData = new FormData();
      formData.append('file', resizedFile);
      
      const endpoint = CROP_CONFIG[selectedCrop].apiEndpoint;
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      
      if (!response.ok) { throw new Error('Prediction failed. Our team has been notified.'); }
      
      const data = await response.json();
      
      const diseaseInfo = diseaseData[selectedCrop]?.[data.disease] || { Symptoms: 'No specific symptoms information available', Preventive_measures: 'Consult your local agri expert for prevention options.', Chemicals: [], links: [], Organic: [] };
      
      setResult({ 
        crop: selectedCrop, 
        disease: data.disease, 
        confidence: (data.confidence * 100), 
        symptoms: diseaseInfo.Symptoms, 
        prevention: diseaseInfo.Preventive_measures, 
        chemicals: diseaseInfo.Chemicals, 
        organic: diseaseInfo.Organic || [], 
        links: diseaseInfo.links || [] 
      });
    } catch (err) {
      setError(err.message || 'Failed to get prediction. Please try again.');
      setResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  let currentStage = 'upload';
  if (isUploading) { currentStage = 'analyze'; } else if (result) { currentStage = 'result'; }

  const renderCropSelection = () => (
    <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Select Your Crop</h2>
        <p className="text-slate-500 mb-6">Choose the type of plant you want to analyze.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(CROP_CONFIG).map(([key, { name, emoji }]) => (
                <button
                    key={key}
                    onClick={() => setSelectedCrop(key)}
                    className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50/80 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                    <span className="text-6xl mb-4">{emoji}</span>
                    <span className="text-2xl font-bold text-slate-800">{name}</span>
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50/30 font-sans text-slate-800">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <header className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent pb-2">🌱🔬 AI Plant Disease Diagnosis</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">Get instant, actionable solutions in just three simple steps.</p>
        </header>

        {selectedCrop && <ProcessStepper stage={currentStage} />}

        {!selectedCrop ? renderCropSelection() : currentStage !== 'result' ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-2">
                <DiseaseTicker diseases={CROP_CONFIG[selectedCrop].commonDiseases} />
            </div>

            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`relative p-6 border-2 border-dashed rounded-3xl transition-all duration-300 ${dragActive ? 'border-green-500 bg-green-50/80' : 'border-slate-300 bg-white'}`}>
              <input type="file" id="file-upload" className="absolute w-0 h-0 opacity-0" onChange={(e) => handleFileChange(e.target.files[0])} accept="image/*"/>
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer text-center">
                <ArrowUpTrayIcon className="w-12 h-12 text-slate-400 mb-3"/>
                <h2 className="text-xl font-semibold text-slate-700">Drag & Drop Your Image Here</h2>
                <p className="text-slate-500 mt-1">or <span className="text-green-600 font-semibold">click to browse</span></p>
              </label>
            </div>
            
            {file && !isUploading && (<div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><img src={previewUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover" /><span className="font-medium text-slate-700 truncate">{file.name}</span></div><button onClick={() => setFile(null)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"><XCircleIcon className="w-6 h-6"/></button></div>)}
            {error && (<div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-xl flex items-center gap-3 text-red-800"><ExclamationTriangleIcon className="w-6 h-6"/><p className="font-medium">{error}</p></div>)}

            <div className="text-center mt-6">
                <button onClick={handleUpload} disabled={!file || isUploading} className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 rounded-full font-bold text-lg text-white bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-green-300/80">
                  {isUploading ? (<><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Analyzing...</span></>) : (<><DocumentMagnifyingGlassIcon className="w-7 h-7"/><span>Analyze {CROP_CONFIG[selectedCrop].name}</span></>)}
                </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2 lg:sticky lg:top-8 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200/80"><h2 className="text-xl font-bold text-slate-800 mb-4">Your Uploaded {CROP_CONFIG[result.crop].name} Leaf</h2><img src={previewUrl} alt="Uploaded crop" className="w-full h-auto rounded-2xl object-cover" /></div>
              <button onClick={handleReset} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full font-bold text-lg text-white bg-gradient-to-r from-slate-700 to-slate-800 transition-all hover:shadow-lg"><ArrowPathIcon className="w-6 h-6"/>Analyze Another</button>
            </div>
            
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-gradient-to-br from-green-50 via-white to-white p-6 rounded-3xl shadow-lg border-2 border-green-200">
                    <div className="flex items-start justify-between"><div><p className="font-semibold text-green-800">Diagnosis Result</p><p className="text-4xl font-bold text-slate-800 mt-1">{result.disease}</p></div><span className="flex items-center gap-2 font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full"><CheckCircleIcon className="w-6 h-6" />Success</span></div>
                    <div className="mt-6"><p className="text-sm font-medium text-slate-600 mb-2">Confidence Level: <span className="font-bold text-green-700">{result.confidence.toFixed(2)}%</span></p><div className="w-full bg-slate-200 rounded-full h-3"><div className="bg-gradient-to-r from-lime-400 to-green-600 h-3 rounded-full" style={{ width: `${result.confidence}%` }}/></div></div>
                </div>

                <InfoCard title="Symptoms" color="text-sky-600" icon={<DocumentMagnifyingGlassIcon />}><p>{result.symptoms}</p></InfoCard>
                <InfoCard title="Prevention Measures" color="text-green-600" icon={<ShieldCheckIcon />}><p>{result.prevention}</p></InfoCard>
                
                <SolutionTabs 
                  result={result}
                  userLocation={{ latitude: 18.5204, longitude: 73.8567 }}
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentifyDisease;