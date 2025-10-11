import { useState, useEffect } from "react";
import { useAuthStore } from "../../authStore";
import { API_BASE_URL } from "../../api/apiConfig";

const ADVISORY_API_URL = `${API_BASE_URL}/api/services/weather`;

// --- Helper functions (getWeatherIcon, getInsightAppearance) ---
// ... (No changes in these helper functions)
function getWeatherIcon(description) {
  const desc = description.toLowerCase();
  if (desc.includes("rain") || desc.includes("shower")) {
    return (
      <svg
        className="w-16 h-16 text-blue-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
               {" "}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
        />
             {" "}
      </svg>
    );
  }
  if (desc.includes("cloud") || desc.includes("overcast")) {
    return (
      <svg
        className="w-16 h-16 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
               {" "}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-9.75 2.152 4.5 4.5 0 00-4.132 5.247z"
        />
             {" "}
      </svg>
    );
  }
  if (desc.includes("thunder")) {
    return (
      <svg
        className="w-16 h-16 text-yellow-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
               {" "}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.375 1.5H4.125a1.5 1.5 0 00-1.5 1.5v4.5m1.5-6H15M21 1.5h-5.625c-.621 0-1.125.504-1.125 1.125v4.5A1.125 1.125 0 0112.75 8.25H15m6 0h.008v.008H21V8.25zM10.875 15l-1.036 4.143a1.125 1.125 0 001.125 1.125h.009c.621 0 1.125-.504 1.125-1.125L13.125 15h-2.25zM21 12c0 .621-.504 1.125-1.125 1.125h-5.625c-.621 0-1.125-.504-1.125-1.125v-4.5c0-.621.504-1.125 1.125-1.125h5.625c.621 0 1.125.504 1.125 1.125v4.5zM3.75 15c0 .621.504 1.125 1.125 1.125h5.625c.621 0 1.125-.504 1.125-1.125v-4.5c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125v4.5z"
        />
             {" "}
      </svg>
    );
  }
  return (
    <svg
      className="w-16 h-16 text-yellow-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
           {" "}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
         {" "}
    </svg>
  );
}
function getInsightAppearance(type) {
  switch (type) {
    case "Disease":
      return {
        bgColor: "bg-red-50 border-red-200",
        titleColor: "text-red-900",
        actionColor: "text-red-700",
        icon: (
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
                       {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
                     {" "}
          </svg>
        ),
      };
    case "Spraying":
      return {
        bgColor: "bg-yellow-50 border-yellow-300",
        titleColor: "text-yellow-900",
        actionColor: "text-yellow-700",
        icon: (
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
                       {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
                     {" "}
          </svg>
        ),
      };
    case "Irrigation":
      return {
        bgColor: "bg-blue-50 border-blue-200",
        titleColor: "text-blue-900",
        actionColor: "text-blue-700",
        icon: (
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
                       {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
                     {" "}
          </svg>
        ),
      };
    default:
      return {
        bgColor: "bg-green-50 border-green-200",
        titleColor: "text-green-900",
        actionColor: "text-green-700",
        icon: (
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
                       {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
                     {" "}
          </svg>
        ),
      };
  }
}

function FarmAdvisoryWidget() {
  const [advisoryData, setAdvisoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // ... (data fetching logic is correct, no changes here)
    if (!token) {
      setIsLoading(false);
      setError("Authentication token not found. Please log in.");
      return;
    }

    const fetchAdvisory = async () => {
      try {
        const response = await fetch(ADVISORY_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch advisory data.");
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setAdvisoryData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvisory();
  }, [token]);

  // --- UPDATED LOADING STATE ---
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col animate-pulse">
        <div className="flex flex-col lg:flex-row flex-grow">
          {/* Left side skeleton */}
          <div className="flex-shrink-0 p-6 lg:w-1/3 bg-gray-200 flex flex-col justify-center">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="flex items-center justify-between gap-4">
              <div className="h-16 bg-gray-300 rounded w-1/2"></div>
              <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mt-4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-300 rounded w-full"></div>
              <div className="h-5 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
          {/* Right side skeleton */}
          <div className="flex-grow p-6">
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-5"></div>
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-red-600 h-full flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  if (!advisoryData) {
    return null;
  }

  const { insights, current_conditions } = advisoryData;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="flex flex-col lg:flex-row flex-grow">
        {/* Left Side (Current Conditions) */}
        <div className="flex-shrink-0 p-6 lg:w-1/3 bg-gradient-to-br from-blue-400 to-blue-600 text-white flex flex-col justify-center">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Current Conditions
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div className="text-6xl font-bold">
              {Math.round(current_conditions.temperature)}°C
            </div>
            {getWeatherIcon(current_conditions.description)}
          </div>
          <div className="text-2xl text-blue-100 capitalize mb-6">
            {current_conditions.description}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-blue-100">
              <svg
                className="w-5 h-5 opacity-80 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="text-sm">Humidity:</span>
              <strong className="text-lg font-medium">
                {current_conditions.humidity}%
              </strong>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <svg
                className="w-5 h-5 opacity-80 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M9 19l3 3m0 0l-3-3m-3 3V10"
                />
              </svg>
              <span className="text-sm">Rain Chance:</span>
              <strong className="text-lg font-medium">
                {current_conditions.rainfall_chance}%
              </strong>
            </div>
          </div>
        </div>
        {/* Right Side (Actionable Insights) */}
        <div className="flex-grow p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-5">
            Actionable Insights (Next 48h)
          </h3>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const { bgColor, titleColor, actionColor, icon } =
                getInsightAppearance(insight.type);
              return (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${bgColor} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-gray-400`}
                >
                  <div className="flex-shrink-0 pt-1">{icon}</div>
                  <div>
                    <h4 className={`font-semibold ${titleColor}`}>
                      {insight.insight}
                    </h4>
                    <p className={`text-sm ${actionColor} font-semibold`}>
                      {insight.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmAdvisoryWidget;
