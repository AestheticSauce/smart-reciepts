// src/components/ReceiptGroupList.jsx
import React, { useMemo } from 'react';

export default function ReceiptGroupList({ receipts }) {
  
  // 1. GROUPING LOGIC
  const groupedData = useMemo(() => {
    const groups = {};

    receipts.forEach(receipt => {
      // Clean up the store name (handle pending/null)
      const storeName = receipt.store || "Pending Analysis...";
      
      if (!groups[storeName]) {
        groups[storeName] = {
          name: storeName,
          receipts: [],
          total: 0
        };
      }

      groups[storeName].receipts.push(receipt);

      // Add to total (clean string "$14.50" -> 14.50)
      if (receipt.total !== "---") {
        const amount = parseFloat(receipt.total.replace(/[$,]/g, ''));
        if (!isNaN(amount)) {
          groups[storeName].total += amount;
        }
      }
    });

    // Convert object to array and sort alphabetically by Store Name
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [receipts]);

  // Handle empty state
  if (receipts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">No receipts to group yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedData.map((group) => (
        <div key={group.name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* GROUP HEADER (Store Name & Total) */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">{group.name}</h3>
                    <p className="text-xs text-gray-500">{group.receipts.length} receipt{group.receipts.length !== 1 && 's'}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total Spent</p>
                <p className="text-xl font-bold text-green-600">${group.total.toFixed(2)}</p>
            </div>
          </div>

          {/* LIST OF RECEIPTS FOR THIS STORE */}
          <div className="divide-y divide-gray-100">
            {group.receipts.map(receipt => (
                <div key={receipt.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <img 
                            src={receipt.url} 
                            alt="thumb" 
                            className="w-10 h-10 object-cover rounded border border-gray-200"
                        />
                        <span className="text-gray-600 text-sm font-medium">{receipt.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="font-mono font-medium text-gray-700">{receipt.total}</span>
                        {/* View Link */}
                        <a href={receipt.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                            View &rarr;
                        </a>
                    </div>
                </div>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}