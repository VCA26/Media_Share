'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import PostCard from '@/components/PostCard';
import { showToast } from '@/components/Toast';
import type { Post, PaginationMeta } from '@/lib/types';
import { Palette, Upload, Image, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MyPostsPage() {
  const { isLoggedIn, user } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { if (!isLoggedIn) router.push('/login'); else if (user?.role !== 'creator') router.push('/feed'); }, [isLoggedIn, user, router]);

  const loadPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try { const res = await api.getMyPosts(pageNum); setPosts(res.data as Post[]); setPagination(res.pagination || null); }
    catch (err) { showToast((err as Error).message, 'error'); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { if (isLoggedIn && user?.role === 'creator') loadPosts(1); }, [isLoggedIn, user]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!isLoggedIn || user?.role !== 'creator') return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center">
              <Palette className="w-5 h-5 text-[#2563eb]" />
            </div>
            My Posts
          </h1>
          <p className="text-sm text-[#64748b] mt-1 ml-[52px]">Manage your uploaded content</p>
        </div>
        <button onClick={() => router.push('/upload')} className="inline-flex items-center gap-2 h-10 px-5 bg-[#2563eb] text-white rounded-lg font-medium text-sm hover:bg-[#1d4ed8] transition-colors shadow-sm shadow-[#2563eb]/20">
          <Upload className="w-4 h-4" /> New Upload
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-24 gap-4"><Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" /><p className="text-sm text-[#94a3b8]">Loading your posts...</p></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <Image className="w-14 h-14 mx-auto mb-5 text-[#e2e8f0]" />
          <h3 className="text-lg font-semibold mb-2 text-[#0f172a]">No posts yet</h3>
          <p className="text-sm text-[#64748b] mb-6">Start sharing your amazing images with the world!</p>
          <button onClick={() => router.push('/upload')} className="inline-flex items-center gap-2 h-11 px-6 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-[#1d4ed8] transition-colors shadow-md shadow-[#2563eb]/20">
            <Upload className="w-4 h-4" /> Upload Your First Image
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button className="flex items-center gap-1.5 h-10 px-5 border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#475569] hover:bg-[#f8fafc] disabled:opacity-30 transition-colors" disabled={!pagination.hasPrevPage} onClick={() => { setPage(page - 1); loadPosts(page - 1); }}><ChevronLeft className="w-4 h-4" /> Prev</button>
              <span className="text-sm text-[#94a3b8] px-2">Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button className="flex items-center gap-1.5 h-10 px-5 border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#475569] hover:bg-[#f8fafc] disabled:opacity-30 transition-colors" disabled={!pagination.hasNextPage} onClick={() => { setPage(page + 1); loadPosts(page + 1); }}>Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
