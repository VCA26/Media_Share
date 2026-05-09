'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Search, Palette, Eye, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-[#e2e8f0] z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 no-underline hover:no-underline">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center shadow-sm shadow-[#2563eb]/25">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg text-[#0f172a] tracking-tight">MediaShare</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn && user ? (
            <>
              {user.role === 'creator' ? (
                <Link href="/upload" className="inline-flex items-center gap-2 h-10 px-5 bg-[#2563eb] text-white rounded-lg font-medium text-sm no-underline hover:no-underline hover:bg-[#1d4ed8] transition-colors shadow-sm shadow-[#2563eb]/20">
                  <Upload className="w-4 h-4" />
                  Upload
                </Link>
              ) : (
                <Link href="/feed" className="inline-flex items-center gap-2 h-10 px-5 bg-[#2563eb] text-white rounded-lg font-medium text-sm no-underline hover:no-underline hover:bg-[#1d4ed8] transition-colors shadow-sm shadow-[#2563eb]/20">
                  <Search className="w-4 h-4" />
                  Explore
                </Link>
              )}
              <Link
                href={user.role === 'creator' ? '/my-posts' : '/feed'}
                className="flex items-center gap-2 h-10 px-4 bg-[#f1f5f9] rounded-lg text-sm text-[#475569] no-underline hover:no-underline hover:bg-[#e2e8f0] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
                  {user.role === 'creator' ? <Palette className="w-3.5 h-3.5 text-[#2563eb]" /> : <Eye className="w-3.5 h-3.5 text-[#2563eb]" />}
                </div>
                <span className="hidden sm:inline font-medium">{user.displayName}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#2563eb]/10 text-[#2563eb] font-semibold uppercase tracking-wider">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link href="/login" className="inline-flex items-center h-10 px-5 bg-[#2563eb] text-white rounded-lg font-medium text-sm no-underline hover:no-underline hover:bg-[#1d4ed8] transition-colors shadow-sm shadow-[#2563eb]/20">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
