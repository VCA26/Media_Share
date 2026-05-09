'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/Toast';
import type { Post } from '@/lib/types';
import { Upload, Image, CheckCircle, AlertTriangle, Sparkles, Shield, Loader2, ArrowRight } from 'lucide-react';

export default function UploadPage() {
  const { isLoggedIn, user } = useAuth();
  const api = useApi();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Post | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
    else if (user?.role !== 'creator') { showToast('Creators only', 'error'); router.push('/feed'); }
  }, [isLoggedIn, user, router]);

  const handleFile = (f: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) { showToast('Invalid file type.', 'error'); return; }
    if (f.size > 10 * 1024 * 1024) { showToast('File too large. Max 10MB.', 'error'); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { showToast('Please select an image', 'error'); return; }
    if (!caption.trim()) { showToast('Caption is required', 'error'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file); formData.append('caption', caption);
      if (location.trim()) formData.append('location', location);
      const res = await api.createPost(formData);
      setResult(res.data as Post); showToast('Post created successfully!', 'success');
    } catch (err) { showToast((err as Error).message, 'error'); } finally { setUploading(false); }
  };

  const resetForm = () => { setFile(null); setPreview(null); setCaption(''); setLocation(''); setResult(null); };
  if (!isLoggedIn || user?.role !== 'creator') return null;

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#2563eb]" />
          </div>
          Upload New Post
        </h1>
        <p className="text-sm text-[#64748b] mt-2 ml-[52px]">Upload an image for AI analysis and sharing</p>
      </div>

      {result ? (
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-lg overflow-hidden animate-[fadeIn_0.4s_ease]">
          <div className="p-8 border-b border-[#e2e8f0] text-center">
            <CheckCircle className="w-10 h-10 text-[#059669] mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-[#0f172a]">Post Created!</h2>
          </div>
          <div className="p-8">
            <img className="max-h-80 rounded-xl mx-auto mb-8 shadow-md" src={result.imageUrl} alt={result.caption} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-6 mb-8 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-[#0f172a]"><Sparkles className="w-4 h-4 text-[#2563eb]" /> AI Analysis</h3>
              <div className="text-sm"><span className="text-[#64748b]">Caption: </span><span className="text-[#0f172a]">{result.aiCaption}</span></div>
              <div className="flex flex-wrap gap-1.5">{result.tags.map((t) => <span key={t} className="px-2.5 py-1 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium">{t}</span>)}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#64748b]">Status:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${result.moderationStatus === 'safe' ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fef2f2] text-[#dc2626]'}`}>
                  {result.moderationStatus === 'safe' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {result.moderationStatus === 'safe' ? 'Safe' : 'Flagged'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 h-11 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-[#1d4ed8] transition-colors shadow-sm shadow-[#2563eb]/20" onClick={resetForm}>Upload Another</button>
              <button className="flex-1 h-11 bg-white text-[#0f172a] border border-[#e2e8f0] rounded-xl font-semibold text-sm hover:bg-[#f8fafc] transition-colors flex items-center justify-center gap-2" onClick={() => router.push(`/post/${result.id}`)}>View Post <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center ${dragOver ? 'border-[#2563eb] bg-[#eff6ff]' : preview ? 'border-[#e2e8f0] p-4' : 'border-[#cbd5e1] hover:border-[#2563eb] hover:bg-[#eff6ff]/50 p-16'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            {preview ? (
              <img className="max-h-80 rounded-xl mx-auto" src={preview} alt="Preview" />
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-2xl bg-[#f1f5f9]">
                  <Image className="w-8 h-8 text-[#94a3b8]" />
                </div>
                <span className="text-base font-semibold text-[#0f172a] mb-1">Drop an image here or click to browse</span>
                <span className="text-sm text-[#94a3b8]">JPEG, PNG, WebP, GIF — Max 10MB</span>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {preview && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">Caption *</label>
                <textarea className="w-full px-4 py-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 transition-all min-h-28 resize-y placeholder:text-[#94a3b8]" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Describe your image..." maxLength={2000} required />
                <div className="text-xs text-[#94a3b8] text-right mt-1.5">{caption.length}/2000</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">Location (optional)</label>
                <input className="w-full h-11 px-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 transition-all placeholder:text-[#94a3b8]" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., London, UK" maxLength={200} />
              </div>
              <button type="submit" className="w-full h-12 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-[#1d4ed8] disabled:opacity-60 transition-all shadow-md shadow-[#2563eb]/20 flex items-center justify-center gap-2" disabled={uploading}>
                {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading & Analyzing...</> : <><Upload className="w-5 h-5" /> Upload & Analyze with AI</>}
              </button>
              {uploading && (
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 space-y-2.5 text-sm text-[#475569]">
                  <p className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[#2563eb]" /> Uploading to Azure Blob Storage...</p>
                  <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#2563eb]" /> Running AI Vision analysis...</p>
                  <p className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#2563eb]" /> Checking content safety...</p>
                </div>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
