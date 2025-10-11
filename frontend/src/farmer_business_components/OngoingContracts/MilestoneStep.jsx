import React from "react";

export default function MilestoneStep({ name, status, isLast }) {
  const getStatusClasses = () => {
    switch (status) {
      case "completed":
        return {
          circle: "bg-green-600 border-green-600",
          icon: "fa-check text-white",
          line: "bg-green-600",
          text: "text-gray-900 font-medium",
        };
      case "in_progress":
        return {
          circle: "bg-white border-4 border-green-600 animate-pulse",
          icon: "",
          line: "bg-gray-300",
          text: "text-green-600 font-bold",
        };
      case "pending":
      default:
        return {
          circle: "bg-gray-300 border-gray-300",
          icon: "",
          line: "bg-gray-300",
          text: "text-gray-500",
        };
    }
  };

  const classes = getStatusClasses();

  return (
    <div className="flex">
            {/* Icon and vertical line */}     {" "}
      <div className="flex flex-col items-center mr-4">
               {" "}
        <div
          className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 ${classes.circle}`}
        >
                   {" "}
          {classes.icon && <i className={`fas ${classes.icon} text-sm`}></i>}   
             {" "}
        </div>
               {" "}
        {!isLast && <div className={`w-0.5 h-12 mt-1 ${classes.line}`}></div>} 
           {" "}
      </div>
            {/* Text */}     {" "}
      <div className="pt-1">
                <p className={`text-base ${classes.text}`}>{name}</p>     {" "}
      </div>
         {" "}
    </div>
  );
}
