import React, { useState, useEffect } from "react";
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import SolutionTabs from "../farmer_daily_operation_components/DiseasePage/SolutionTabs";
import diseaseData from "../assets/disease_chemicals_data.json";

const CROP_CONFIG = {
  cotton: {
    name: "Cotton",
    emoji: "🌱",
    apiEndpoint: "http://localhost:8000/api/services/cotton-predict",
    commonDiseases: [
      "Bacterial Blight",
      "Powdery Mildew",
      "Fusarium Wilt",
      "Target Spot",
      "Verticillium Wilt",
      "Curl Virus",
      "Cotton Boll Rot",
    ],
  },
  tomato: {
    name: "Tomato",
    emoji: "🍅",
    apiEndpoint: "http://localhost:8000/api/services/tomato-predict",
    commonDiseases: [
      "Bacterial spot",
      "Early blight",
      "Late blight",
      "Leaf Mold",
      "Septoria leaf spot",
      "Spider mites",
      "Target Spot",
      "Yellow Leaf Curl Virus",
      "Mosaic virus",
    ],
  },
};

// Smooth Ticker
const DiseaseTicker = ({ diseases }) => {
  const extended = [...diseases, ...diseases];
  return (
    <div className="overflow-hidden relative w-full py-2 border-y border-blue-500/20 bg-blue-50 rounded-full">
      <div className="flex animate-marquee space-x-8">
        {extended.map((disease, i) => (
          <div key={i} className="text-blue-700 font-medium flex items-center space-x-2">
            <span>🦠</span>
            <span>{disease}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stepper
const ProcessStepper = ({ stage }) => {
  const steps = [
    { id: "upload", title: "Upload Image", emoji: "📸" },
    { id: "analyze", title: "AI Analysis", emoji: "🤖" },
    { id: "result", title: "Get Solution", emoji: "💡" },
  ];
  const stageIndex = steps.findIndex((step) => step.id === stage);

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const active = i === stageIndex;
          const done = i < stageIndex;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-full text-3xl transition-all duration-300 
                    ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : done ? "bg-blue-500 text-white"
                    : "bg-slate-200 text-slate-600"}`}
                >
                  {done ? "✔️" : step.emoji}
                </div>
                <p
                  className={`mt-2 text-sm font-semibold 
                    ${active || done ? "text-blue-600" : "text-slate-500"}`}
                >
                  {step.title}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mx-3 rounded ${done ? "bg-blue-600" : "bg-slate-300"}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// InfoCard Component
const InfoCard = ({ icon, title, color, children }) => (
  <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl">
    <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200">
      {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
      <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
    </div>
    <div className="p-5 text-slate-700">{children}</div>
  </div>
);

const IdentifyDisease = () => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [confidenceProgress, setConfidenceProgress] = useState(0);

  useEffect(() => {
    if (!file) return setPreviewUrl(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (f) => {
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setError("");
      setResult(null);
    } else setError("Please select a valid image file.");
  };

  const handleUpload = async () => {
    if (!file || !selectedCrop) {
      setError("Please select a crop and upload an image.");
      return;
    }
    setIsUploading(true);
    setError("");
    setConfidenceProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(CROP_CONFIG[selectedCrop].apiEndpoint, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Prediction failed.");

      const data = await res.json();
      const info = diseaseData[selectedCrop]?.[data.disease] || {};

      setResult({
        crop: selectedCrop,
        disease: data.disease,
        confidence: data.confidence * 100,
        symptoms: info.Symptoms || "No info available.",
        prevention: info.Preventive_measures || "No info available.",
        chemicals: info.Chemicals?.slice(0, 2) || [],
        organic: info.Organic?.slice(0, 2) || [],
        links: info.links?.slice(0, 2) || [],
      });

      // Animate confidence progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        if (progress >= data.confidence * 100) {
          progress = data.confidence * 100;
          clearInterval(interval);
        }
        setConfidenceProgress(progress);
      }, 20);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedCrop(null);
    setFile(null);
    setResult(null);
    setError("");
  };

  let stage = "upload";
  if (isUploading) stage = "analyze";
  else if (result) stage = "result";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-100 text-slate-800">
      <div className="container mx-auto px-5 py-10 max-w-7xl">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-sky-700 bg-clip-text text-transparent">
            🌱 AI Crop Disease Detector
          </h1>
          <p className="text-slate-600 mt-2">
            Upload your crop leaf image and get instant diagnosis with recommendations.
          </p>
        </header>

        {selectedCrop && <ProcessStepper stage={stage} />}

        {!selectedCrop ? (
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mt-8">
            {Object.entries(CROP_CONFIG).map(([key, { name, emoji }]) => (
              <button
                key={key}
                onClick={() => setSelectedCrop(key)}
                className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center 
                hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm hover:shadow-lg"
              >
                <span className="text-6xl mb-4">{emoji}</span>
                <span className="text-xl font-bold text-slate-800">{name}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="max-w-2xl mx-auto mb-6">
              <DiseaseTicker diseases={CROP_CONFIG[selectedCrop].commonDiseases} />
            </div>

            {!result ? (
              <div className="max-w-2xl mx-auto text-center">
                <label className="block border-2 border-dashed border-blue-400 rounded-3xl p-8 bg-white hover:bg-blue-50 transition cursor-pointer">
                  <ArrowUpTrayIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-slate-700">
                    Drag & Drop or Click to Upload
                  </p>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {file && !isUploading && (
                  <div className="mt-4 bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium text-slate-700">{file.name}</span>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="p-2 text-slate-500 hover:text-red-600 transition"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl border border-red-300 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" /> {error}
                  </div>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="mt-6 w-full sm:w-auto px-10 py-4 rounded-full font-bold text-lg text-white 
                  bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:shadow-lg hover:scale-105 transition disabled:opacity-50"
                >
                  {isUploading ? "Analyzing..." : `Analyze ${CROP_CONFIG[selectedCrop].name}`}
                </button>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto mt-8 grid lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
                    <h2 className="text-lg font-bold mb-3 text-slate-700">
                      Uploaded {CROP_CONFIG[result.crop].name} Leaf
                    </h2>
                    <img src={previewUrl} alt="uploaded" className="w-full rounded-xl" />
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-4 rounded-full text-white font-bold bg-gradient-to-r from-slate-700 to-slate-800 hover:scale-105 transition"
                  >
                    <ArrowPathIcon className="w-6 h-6 inline-block mr-2" /> Analyze Another
                  </button>

                  {/* Disease Info Below */}
                  <div className="mt-6 bg-white rounded-2xl p-5 shadow border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-2">
                      🧬 Disease Information:
                    </h3>
                    <p className="text-slate-600">
                      {result.disease} is commonly found in{" "}
                      {CROP_CONFIG[result.crop].name} crops and can be prevented
                      using proper field hygiene and crop rotation.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 via-white to-white p-6 rounded-3xl shadow-md border-2 border-blue-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-blue-700 font-semibold">Diagnosis Result</p>
                        <p className="text-3xl font-bold text-slate-800">{result.disease}</p>
                      </div>
                      <span className="flex items-center gap-2 font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                        <CheckCircleIcon className="w-5 h-5" /> Success
                      </span>
                    </div>

                    {/* Confidence Progress */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Confidence:{" "}
                        <span className="font-bold text-blue-700">
                          {confidenceProgress.toFixed(0)}%
                        </span>
                      </p>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-200"
                          style={{ width: `${confidenceProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <InfoCard title="Symptoms" color="text-sky-600" icon={<DocumentMagnifyingGlassIcon />}>
                    {result.symptoms}
                  </InfoCard>

                  <InfoCard title="Prevention" color="text-green-600" icon={<ShieldCheckIcon />}>
                    {result.prevention}
                  </InfoCard>

                  {/* Only 2 Products + 2 Shops */}
                  <SolutionTabs
                    result={{
                      ...result,
                      chemicals: result.chemicals.slice(0, 2),
                      links: result.links.slice(0, 2),
                    }}
                    showMore={false}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IdentifyDisease;
