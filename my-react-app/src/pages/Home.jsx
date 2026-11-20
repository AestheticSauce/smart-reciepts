// src/pages/Home.jsx
import React from 'react';
import Hero from '../components/Hero';
import SpendingGauge from '../components/SpendingGauge';
import Gallery from '../components/Gallery';
import ImageUpload from '../components/ImageUpload';

export default function Home({ 
  monthlyData, 
  monthLabel, 
  prevMonth, 
  nextMonth, 
  currentDate,
  setCurrentDate,
  receipts, 
  sortType, 
  setSortType, 
  onUpload, 
  uploading, 
  loadingMessage 
}) {
  // Format Value for Input (YYYY-MM)
  const monthInputValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  return (
    <>
      <Hero />
      
      {/* DASHBOARD */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <button onClick={prevMonth} className="p-3 rounded-full hover:bg-gray-200 text-gray-500 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <SpendingGauge total={monthlyData.total} month={monthLabel} budget={2000} />
              <button onClick={nextMonth} className="p-3 rounded-full hover:bg-gray-200 text-gray-500 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
          </div>
          <div className="text-center mt-6 flex flex-col items-center gap-2">
                <input 
                    type="month" 
                    value={monthInputValue}
                    onChange={(e) => {
                        const [year, month] = e.target.value.split('-');
                        setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                    }}
                    className="border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
                />
              <p className="text-gray-400 text-sm">Found {monthlyData.count} receipts for this month</p>
          </div>
      </div>

      {/* LOADING */}
      {uploading && (
        <div className="max-w-xl mx-auto mt-4 px-4">
          <div className="bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded relative flex items-center justify-center gap-3">
             <span className="font-semibold">{loadingMessage}</span>
          </div>
        </div>
      )}

      {/* GALLERY HEADER */}
      <div className="max-w-6xl mx-auto px-4 mt-12 mb-4 flex justify-between items-end border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Gallery</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm font-medium">Sort by:</span>
          <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="border-gray-300 border rounded-md text-sm py-2 px-3 bg-white shadow-sm">
            <option value="date-newest">Newest First</option>
            <option value="date-oldest">Oldest First</option>
            <option value="name-asc">Store (A-Z)</option>
            <option value="name-desc">Store (Z-A)</option>
          </select>
        </div>
      </div>

      <Gallery receipts={receipts} />
      <ImageUpload onUpload={onUpload} />
    </>
  );
}