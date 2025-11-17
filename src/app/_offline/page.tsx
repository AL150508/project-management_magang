"use client";

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - Management Magang',
  description: 'Halaman offline untuk aplikasi management magang',
};

// Static fallback component (SSR)
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-cyan-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
          <svg 
            className="w-12 h-12 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Kamu Sedang Offline
        </h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Periksa koneksi internetmu dan coba lagi nanti.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}