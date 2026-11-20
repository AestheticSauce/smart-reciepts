// src/components/SpendingGauge.jsx
import React from 'react';

export default function SpendingGauge({ total, budget = 1000, month }) {
  // 1. Calculate Percentage (capped at 100%)
  const percentage = Math.min((total / budget) * 100, 100);
  
  // 2. Map percentage to Angle (0% = -90deg, 100% = 90deg)
  const angle = (percentage / 100) * 180 - 90;

  // Color logic: Green for low, Orange for mid, Red for high
  const getColor = () => {
    if (percentage < 50) return "#10B981"; // Green
    if (percentage < 85) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Month Label */}
      <h3 className="text-gray-500 font-medium uppercase tracking-wide text-sm mb-4">
        {month} Spending
      </h3>

      {/* THE GAUGE (SVG) */}
      <div className="relative w-64 h-32 mb-4">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background Arc (Gray) */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E5E7EB" strokeWidth="20" strokeLinecap="round" />
          
          {/* Progress Arc (Colored) */}
          <path 
            d="M 20 100 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke={getColor()} 
            strokeWidth="20" 
            strokeLinecap="round"
            strokeDasharray="251.2" // Circumference of the semi-circle
            strokeDashoffset={251.2 - (251.2 * percentage) / 100} // Fill amount
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* The Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-24 bg-gray-800 origin-bottom rounded-full transition-transform duration-1000 ease-out z-10"
          style={{ 
            transform: `translateX(-50%) rotate(${angle}deg)`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {/* Needle Center Dot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full"></div>
        </div>
      </div>

      {/* Text Readout */}
      <div className="text-center mt-2 z-10">
        <div className="text-4xl font-bold text-gray-900 transition-colors duration-500">
          ${total.toFixed(2)}
        </div>
        <div className="text-sm text-gray-400 font-medium mt-1">
          of ${budget} Budget
        </div>
      </div>

      {/* Warning Message if over budget */}
      {percentage >= 100 && (
        <div className="mt-3 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full animate-pulse">
          Budget Exceeded!
        </div>
      )}
    </div>
  );
}