// src/components/ImageUpload.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// 1. ACCEPT THE PROP HERE
export default function ImageUpload({ onUpload }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    // Update local state (keeps your existing preview logic)
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));

    // 2. SEND THE FILE TO APP.JSX (Crucial Step!)
    // We only send the first file since your backend expects one at a time
    if (acceptedFiles.length > 0 && onUpload) {
      console.log(" ImageUpload: Sending file to App.jsx...");
      onUpload(acceptedFiles[0]);
    }

  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <section id="upload" className="py-8 bg-white">
      <div className="max-w-xl mx-auto px-4">
        <h4 className="text-xl font-bold text-gray-900 text-center mb-6">Upload Your Images</h4>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg className="mx-auto h-6 w-6 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-gray-600 text-sm">
              {isDragActive ? "Drop here..." : "Drag & drop, or click to select"}
            </p>
          </div>
        </div>

        {/* Local Previews (Optional: You can keep these or let the Gallery handle it) */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {files.map(file => (
            <div key={file.name} className="relative group aspect-w-1 aspect-h-1 rounded-md overflow-hidden bg-gray-100 shadow-sm">
              <img
                src={file.preview}
                className="object-cover w-full h-20"
                // Removed revoke on load so preview doesn't break instantly
                alt="preview"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}