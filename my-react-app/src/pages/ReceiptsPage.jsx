// src/pages/ReceiptsPage.jsx
import React from 'react';
import ReceiptGroupList from '../components/ReceiptGroupList';

export default function ReceiptsPage({ receipts }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Receipts</h1>
        <p className="text-gray-500 mb-8">Grouped by Store Name</p>
        
        <ReceiptGroupList receipts={receipts} />
      </div>
    </div>
  );
}