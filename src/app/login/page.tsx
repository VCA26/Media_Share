'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/Toast';
import { Camera, Palette, Eye, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'consumer' | 'creator'>('consumer');
  const [loading, setLoading] = useState(false);
  const { login: setAuth } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = tab === 'login'
      ? { email: form.get('email'), password: form.get('password') }
      : { email: form.get('email'), password: form.get('password'), displayName: form.get('displayName'), role };

    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setAuth(data.data.user, data.data.token);
      showToast(tab === 'login' ? 'Welcome back!' : 'Account created!', 'success');
      router.push(data.data.user.role === 'creator' ? '/upload' : '/feed');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xl shadow-black/[0.04] overflow-hidden">
          {/* Branding Header */}
          <div className="px-8 pt-10 pb-8 text-center">
            <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center rounded-2xl bg-[#2563eb] shadow-lg shadow-[#2563eb]/30">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[#0f172a]">MediaShare</h1>
            <p className="text-sm text-[#64748b] mt-1.5">AI-powered media sharing platform</p>
          </div>

          {/* Tabs */}
          <div className="px-8">
            <div className="flex bg-[#f1f5f9] p-1 rounded-xl">
              <button
                className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all ${tab === 'login' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#94a3b8] hover:text-[#64748b]'}`}
                onClick={() => setTab('login')}
              >
                Sign In
              </button>
              <button
                className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all ${tab === 'signup' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#94a3b8] hover:text-[#64748b]'}`}
                onClick={() => setTab('signup')}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pt-8 pb-10">
            <div className="space-y-5">
              {tab === 'signup' && (
                <>
                  {/* Role selector */}
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-3">Choose your role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-5 border-2 rounded-xl text-center cursor-pointer transition-all ${role === 'creator' ? 'border-[#2563eb] bg-[#eff6ff]' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'}`}
                        onClick={() => setRole('creator')}
                      >
                        <Palette className={`w-7 h-7 mx-auto mb-2.5 ${role === 'creator' ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`} />
                        <span className="block font-semibold text-sm text-[#0f172a]">Creator</span>
                        <span className="block text-xs text-[#64748b] mt-1">Upload & share</span>
                      </div>
                      <div
                        className={`p-5 border-2 rounded-xl text-center cursor-pointer transition-all ${role === 'consumer' ? 'border-[#2563eb] bg-[#eff6ff]' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'}`}
                        onClick={() => setRole('consumer')}
                      >
                        <Eye className={`w-7 h-7 mx-auto mb-2.5 ${role === 'consumer' ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`} />
                        <span className="block font-semibold text-sm text-[#0f172a]">Consumer</span>
                        <span className="block text-xs text-[#64748b] mt-1">Browse & engage</span>
                      </div>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2" htmlFor="displayName">Display Name</label>
                    <input className="w-full h-11 px-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 transition-all placeholder:text-[#94a3b8]" name="displayName" id="displayName" type="text" placeholder="Your name" required />
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2" htmlFor="email">Email address</label>
                <input className="w-full h-11 px-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 transition-all placeholder:text-[#94a3b8]" name="email" id="email" type="email" placeholder="you@company.com" required />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2" htmlFor="password">Password</label>
                <input className="w-full h-11 px-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 transition-all placeholder:text-[#94a3b8]" name="password" id="password" type="password" placeholder="••••••••" required minLength={6} />
              </div>

              {/* Submit */}
              <button type="submit" className="w-full h-11 mt-2 bg-[#2563eb] text-white rounded-lg font-semibold text-sm hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#2563eb]/20 flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (tab === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
