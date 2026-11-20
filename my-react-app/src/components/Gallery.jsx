// src/components/Gallery.jsx
import React from 'react';

// FIX: We now accept 'receipts' as a prop from App.jsx
export default function Gallery({ receipts }) {
  
  // FIX: Handle the case where the list is empty
  if (!receipts || receipts.length === 0) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Uploads</h2>
          <div className="p-8 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500">No receipts found. Upload one to get started!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Uploads</h2>
        
        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* FIX: Map through the REAL 'receipts' prop instead of mock data */}
          {receipts.map((receipt) => (
            <div key={receipt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
              
              {/* Image Area */}
              <div className="aspect-w-3 aspect-h-4 bg-gray-200 relative h-48">
                <img 
                  src={receipt.url} 
                  alt={receipt.store || "Receipt"} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors"></div>
              </div>

              {/* Receipt Details */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                    {receipt.store || "Pending..."}
                </h3>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{receipt.date}</span>
                  <span className={`font-bold px-2 py-1 rounded-md text-sm ${
                      receipt.total === "---" 
                      ? "text-gray-400 bg-gray-100" 
                      : "text-green-600 bg-green-50"
                  }`}>
                    {receipt.total}
                  </span>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}