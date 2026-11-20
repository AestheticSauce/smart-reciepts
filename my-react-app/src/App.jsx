import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom'; // <--- Routing Logic
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ReceiptsPage from './pages/ReceiptsPage';

function App() {
  // --- STATE (Kept here so it is shared between pages) ---
  const [receipts, setReceipts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [sortType, setSortType] = useState('date-newest');
  const [currentDate, setCurrentDate] = useState(new Date());
  const API_URL = "https://ckmbejx2gf.execute-api.us-east-1.amazonaws.com/prod";
  // --- DATA FETCHING ---
  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await fetch(`${API_URL}/receipts`);
      const data = await res.json();
      setReceipts(data);
    } catch (err) {
      console.error("Failed to load receipts:", err);
    }
  };

  const handleNewUpload = async (file) => {
    setUploading(true);
    setLoadingMessage("Encrypting & Uploading...");
    try {
      const response = await fetch(`${API_URL}/generate-upload-url?fileName=${file.name}&fileType=${file.type}`);
      const data = await response.json();
      const { uploadUrl, key } = data;

      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

      setLoadingMessage("Reading text with AI...");
      await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: key })
      });
      fetchReceipts();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUploading(false);
      setLoadingMessage("");
    }
  };

  // --- SORTING & MONTHLY DATA LOGIC ---
  const getSortedReceipts = () => {
    const sorted = [...receipts];
    switch (sortType) {
      case 'date-newest': return sorted.sort((a, b) => b.timestamp - a.timestamp);
      case 'date-oldest': return sorted.sort((a, b) => a.timestamp - b.timestamp);
      case 'name-asc': return sorted.sort((a, b) => a.store.localeCompare(b.store));
      case 'name-desc': return sorted.sort((a, b) => b.store.localeCompare(a.store));
      default: return sorted;
    }
  };

  const monthlyData = useMemo(() => {
    const targetMonth = currentDate.getMonth();
    const targetYear = currentDate.getFullYear();
    const filteredReceipts = receipts.filter(r => {
      let rDate = new Date(r.date);
      if (isNaN(rDate.getTime())) { rDate = new Date(r.timestamp * 1000); }
      return rDate.getMonth() === targetMonth && rDate.getFullYear() === targetYear;
    });
    const totalSpent = filteredReceipts.reduce((sum, r) => {
      if (r.total === "---") return sum;
      const cleanPrice = parseFloat(r.total.replace(/[$,]/g, ''));
      return sum + (isNaN(cleanPrice) ? 0 : cleanPrice);
    }, 0);
    return { total: totalSpent, count: filteredReceipts.length };
  }, [receipts, currentDate]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          {/* PAGE 1: HOME */}
          <Route path="/" element={
            <Home 
              monthlyData={monthlyData}
              monthLabel={monthLabel}
              prevMonth={prevMonth}
              nextMonth={nextMonth}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              receipts={getSortedReceipts()}
              sortType={sortType}
              setSortType={setSortType}
              onUpload={handleNewUpload}
              uploading={uploading}
              loadingMessage={loadingMessage}
            />
          } />
          
          {/* PAGE 2: MY RECEIPTS */}
          <Route path="/receipts" element={
            <ReceiptsPage receipts={getSortedReceipts()} />
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;