'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import PostCard from '@/components/PostCard';
import { showToast } from '@/components/Toast';
import type { Post, PaginationMeta } from '@/lib/types';
import { Search, X, Image, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FeedPage() {
  const { isLoggedIn } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { if (!isLoggedIn) router.push('/login'); }, [isLoggedIn, router]);

  const loadFeed = useCallback(async (pageNum: number) => {
    setLoading(true);
    try { const res = await api.getFeed(pageNum); setPosts(res.data as Post[]); setPagination(res.pagination || null); setIsSearching(false); }
    catch (err) { showToast((err as Error).message, 'error'); }
    finally { setLoading(false); }
  }, [api]);

  const handleSearch = useCallback(async (pageNum: number = 1) => {
    if (!searchQuery.trim()) { loadFeed(1); return; }
    setLoading(true);
    try { const res = await api.searchPosts(searchQuery.trim(), pageNum); setPosts(res.data as Post[]); setPagination(res.pagination || null); setIsSearching(true); }
    catch (err) { showToast((err as Error).message, 'error'); }
    finally { setLoading(false); }
  }, [api, searchQuery, loadFeed]);

  useEffect(() => { if (isLoggedIn) loadFeed(1); }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage: number) => { setPage(newPage); isSearching ? handleSearch(newPage) : loadFeed(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (!isLoggedIn) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            {isSearching ? `Results for "${searchQuery}"` : 'Explore'}
          </h1>
          <p className="text-sm text-[#64748b] mt-1">Discover amazing content from creators</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); handleSearch(1); }} className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
          <input
            className="w-full h-11 pl-11 pr-10 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all placeholder:text-[#94a3b8]"
            type="text" placeholder="Search by tags, captions, location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]" onClick={() => { setSearchQuery(''); setPage(1); loadFeed(1); }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center py-24 gap-4 text-[#94a3b8]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
          <p className="text-sm">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          {isSearching ? <Search className="w-14 h-14 mx-auto mb-5 text-[#e2e8f0]" /> : <Image className="w-14 h-14 mx-auto mb-5 text-[#e2e8f0]" />}
          <h3 className="text-lg font-semibold mb-2 text-[#0f172a]">{isSearching ? 'No results found' : 'No posts yet'}</h3>
          <p className="text-sm text-[#64748b]">{isSearching ? 'Try different search terms' : 'Be the first to see content when creators start uploading!'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button className="flex items-center gap-1.5 h-10 px-5 border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#475569] hover:bg-[#f8fafc] disabled:opacity-30 transition-colors" disabled={!pagination.hasPrevPage} onClick={() => handlePageChange(page - 1)}>
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-[#94a3b8] px-2">Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button className="flex items-center gap-1.5 h-10 px-5 border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#475569] hover:bg-[#f8fafc] disabled:opacity-30 transition-colors" disabled={!pagination.hasNextPage} onClick={() => handlePageChange(page + 1)}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
