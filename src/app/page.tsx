'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Upload, Search, Cpu, Shield, Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="animate-[fadeIn_0.5s_ease]">
      {/* Hero */}
      <section className="px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-[#eff6ff] text-[#2563eb] text-sm font-medium border border-[#2563eb]/10">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Media Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight mb-6 text-[#0f172a]">
            Share Your Vision.
            <br className="hidden sm:block" />
            <span className="text-[#2563eb]">Discover Amazing Content.</span>
          </h1>

          <p className="text-lg text-[#475569] leading-relaxed max-w-xl mx-auto mb-10">
            Upload stunning images, discover them through intelligent search,
            AI-generated tags, and automated content moderation.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {isLoggedIn && user ? (
              user.role === 'creator' ? (
                <Link href="/upload" className="inline-flex items-center gap-2 h-12 px-8 bg-[#2563eb] text-white rounded-xl font-semibold no-underline hover:no-underline hover:bg-[#1d4ed8] transition-all shadow-lg shadow-[#2563eb]/25 hover:-translate-y-0.5">
                  <Upload className="w-5 h-5" />
                  Start Uploading
                </Link>
              ) : (
                <Link href="/feed" className="inline-flex items-center gap-2 h-12 px-8 bg-[#2563eb] text-white rounded-xl font-semibold no-underline hover:no-underline hover:bg-[#1d4ed8] transition-all shadow-lg shadow-[#2563eb]/25 hover:-translate-y-0.5">
                  <Search className="w-5 h-5" />
                  Explore Feed
                </Link>
              )
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-2 h-12 px-8 bg-[#2563eb] text-white rounded-xl font-semibold no-underline hover:no-underline hover:bg-[#1d4ed8] transition-all shadow-lg shadow-[#2563eb]/25 hover:-translate-y-0.5">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="inline-flex items-center h-12 px-8 bg-white text-[#0f172a] border border-[#e2e8f0] rounded-xl font-semibold no-underline hover:no-underline hover:bg-[#f8fafc] transition-all shadow-sm">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-8 py-16 lg:py-20 bg-white border-t border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#0f172a]">Built for Scale</h2>
            <p className="text-[#475569] text-base">Everything you need to manage and discover visual content.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Cpu, title: 'AI Vision', desc: 'Automatic tagging and captioning powered by Azure AI Vision.' },
              { icon: Shield, title: 'Content Safety', desc: 'Automated moderation flags inappropriate content instantly.' },
              { icon: Search, title: 'Smart Search', desc: 'Find images by AI-detected tags, captions, and location.' },
              { icon: Zap, title: 'Cloud-Native', desc: 'Cosmos DB, Blob Storage, and App Service at scale.' },
            ].map((f) => (
              <div key={f.title} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-8 hover:border-[#2563eb]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 mb-5 flex items-center justify-center rounded-xl bg-[#eff6ff] group-hover:bg-[#dbeafe] transition-colors">
                  <f.icon className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-[#0f172a]">{f.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
