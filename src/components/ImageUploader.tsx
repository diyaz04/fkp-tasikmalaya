/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Upload, Link, Check, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholderKeyword?: string;
}

export default function ImageUploader({ value, onChange, label = "Foto / Gambar", placeholderKeyword = "business" }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'mock'>('url');
  const [inputUrl, setInputUrl] = useState(value);
  const [isCopied, setIsCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;
  const isCloudinaryConfigured = !!(cloudName && uploadPreset);

  const keyWords = [
    { label: 'Wirausaha', kw: 'entrepreneur' },
    { label: 'UMKM Kuliner', kw: 'food-stall' },
    { label: 'Kopi / Cafe', kw: 'coffee-shop' },
    { label: 'Produk Kerajinan', kw: 'handicraft' },
    { label: 'Desain Kreatif', kw: 'creative-workspace' },
    { label: 'Pertemuan Forum', kw: 'youth-meeting' },
    { label: 'Fashion Hijab', kw: 'fashion-indonesia' }
  ];

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(inputUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const selectKeywordImage = (keyword: string) => {
    // Generate a beautiful, high-quality random Unsplash URL with a timestamp to avoid caching
    const randomId = Math.floor(Math.random() * 1000);
    const generatedUrl = `https://images.unsplash.com/featured/?${encodeURIComponent(keyword)}&sig=${randomId}`;
    onChange(generatedUrl);
    setInputUrl(generatedUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const img = new Image();
          img.onload = () => {
            // Target max dimension of 1000px for robust performance and lightweight cloud footprint
            const maxDim = 1000;
            let width = img.width;
            let height = img.height;
            
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              
              // Compress to JPEG with 0.82 quality
              canvas.toBlob(async (blob) => {
                if (!blob) {
                  setIsUploading(false);
                  setUploadError("Gagal mengompresi gambar.");
                  return;
                }
                
                try {
                  if (isCloudinaryConfigured) {
                    // Safe Unsigned Cloud Upload to Cloudinary API
                    const formData = new FormData();
                    formData.append('file', blob, 'compressed_image.jpg');
                    formData.append('upload_preset', uploadPreset!);

                    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                      method: 'POST',
                      body: formData
                    });

                    if (!response.ok) {
                      const errData = await response.json();
                      throw new Error(errData.error?.message || 'Unggah Cloudinary gagal');
                    }

                    const data = await response.json();
                    const downloadUrl = data.secure_url;
                    onChange(downloadUrl);
                    setInputUrl(downloadUrl);
                  } else {
                    // Default offline Base64 fallback if environment variables are not loaded yet
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
                    onChange(compressedBase64);
                    setInputUrl(compressedBase64.substring(0, 100) + '... (Base64 offline)');
                    setUploadError("Variabel VITE_CLOUDINARY_CLOUD_NAME belum disetel. Disimpan sementara sebagai Base64 lokal!");
                  }
                } catch (err: any) {
                  console.warn('Gagal mengunggah ke Cloudinary, dialihkan ke Base64 lokal:', err);
                  const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
                  onChange(compressedBase64);
                  setInputUrl(compressedBase64.substring(0, 100) + '... (Base64 default)');
                  setUploadError("Gagal terhubung ke Cloudinary: " + (err.message || 'Error koneksi. Terpaksa fallback ke Base64.'));
                } finally {
                  setIsUploading(false);
                }
              }, 'image/jpeg', 0.82);
            } else {
              setIsUploading(false);
            }
          };
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100" id="image-uploader-component">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      
      {/* Tab Selectors */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'url' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tautan URL / Gambar Lokal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mock')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'mock' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pilih Ilustrasi (Unsplash)
        </button>
      </div>

      {activeTab === 'url' && (
        <div className="space-y-3">
          {/* File input (Convert with Firebase upload or base64 fallback) */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors relative">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-1" />
                  <p className="text-xs text-blue-600 font-semibold animate-pulse">Mengunggah ke Cloud Storage...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center px-4">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-500 font-semibold">Unggah File Foto (JPG/PNG)</p>
                  <p className="text-[10px] text-slate-400">Otomatis dikompresi & diunggah ke Cloudinary</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
            </label>
          </div>

          {uploadError && (
            <p className="text-[10px] text-slate-600 text-center font-medium bg-slate-100 p-2 rounded-lg border border-slate-200">
              💡 {uploadError}
            </p>
          )}

          <div className="relative flex items-center justify-center text-xs text-slate-400 font-semibold my-1">
            <span className="bg-slate-50 px-2 z-10">ATAU</span>
            <div className="absolute w-full h-[1px] bg-slate-200"></div>
          </div>

          {/* Direct URL Link Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Masukkan URL foto eksternal..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onChange(inputUrl);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }
                }}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(inputUrl);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-400" /> : 'Terapkan'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'mock' && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Pilih kategori relevan dengan yang Anda cari untuk mendapatkan rancangan foto berkualitas secara otomatis:</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {keyWords.map((k) => (
              <button
                key={k.kw}
                type="button"
                onClick={() => selectKeywordImage(k.kw)}
                className="py-1.5 px-2 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-lg text-left text-xs transition-colors flex items-center gap-1 font-medium text-slate-700"
              >
                <ImageIcon className="w-3 h-3 text-slate-400 inline" />
                <span className="truncate">{k.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {value && (
        <div className="mt-4 flex gap-3 items-center bg-white p-2.5 rounded-lg border border-slate-200">
          <img
            src={value}
            alt="Preview upload"
            className="w-14 h-14 object-cover rounded-md border border-slate-100 bg-slate-50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594818821445-ad4e292d5cfa?auto=format&fit=crop&w=150&q=80';
            }}
          />
          <div className="text-[11px] text-slate-500 flex-1 truncate">
            <span className="font-semibold block text-slate-700">Gambar Terpasang:</span>
            <span className="truncate block font-mono">
              {value.startsWith('data:') 
                ? 'Lokal Base64' 
                : value.includes('cloudinary')
                  ? 'Cloudinary Cloud Storage'
                  : value.includes('firebasestorage') 
                    ? 'Cloud Storage (Firebase)' 
                    : value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
