'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import StarRating from '@/components/StarRating';
import { showToast } from '@/components/Toast';
import type { Post, Comment } from '@/lib/types';
import { ArrowLeft, CheckCircle, AlertTriangle, Sparkles, Star, MessageSquare, MapPin, Send, Loader2 } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000); const hrs = Math.floor(diff / 3600000); const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`; if (hrs < 24) return `${hrs}h ago`; if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoggedIn, user } = useAuth();
  const api = useApi();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!isLoggedIn) router.push('/login'); }, [isLoggedIn, router]);

  const loadPost = useCallback(async () => {
    try {
      const [postRes, commentsRes, ratingsRes] = await Promise.all([api.getPost(id), api.getComments(id), api.getRatings(id)]);
      setPost(postRes.data as Post); setComments((commentsRes.data || []) as Comment[]);
      const rd = ratingsRes.data as { stats: { averageRating: number; totalRatings: number } }; setRatingStats(rd.stats);
    } catch (err) { showToast((err as Error).message, 'error'); } finally { setLoading(false); }
  }, [api, id]);

  useEffect(() => { if (isLoggedIn) loadPost(); }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault(); if (!commentText.trim()) return; setSubmitting(true);
    try { const res = await api.addComment(id, commentText.trim()); setComments((prev) => [res.data as Comment, ...prev]); setCommentText(''); showToast('Comment added!', 'success'); }
    catch (err) { showToast((err as Error).message, 'error'); } finally { setSubmitting(false); }
  };

  const handleRate = async (score: number) => {
    setUserRating(score);
    try { await api.addRating(id, score); showToast(`Rated ${score}/5`, 'success');
    const rr = await api.getRatings(id); const rd = rr.data as { stats: { averageRating: number; totalRatings: number } }; setRatingStats(rd.stats);
    } catch (err) { showToast((err as Error).message, 'error'); }
  };

  if (!isLoggedIn) return null;
  if (loading) return <div className="flex flex-col items-center justify-center py-32 gap-4"><Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" /><p className="text-sm text-[#94a3b8]">Loading post...</p></div>;
  if (!post) return <div className="flex flex-col items-center justify-center py-32 gap-4"><p className="text-[#94a3b8]">Post not found</p><button onClick={() => router.push('/feed')} className="flex items-center gap-1.5 h-10 px-4 border border-[#e2e8f0] rounded-lg text-sm text-[#475569] hover:bg-[#f8fafc]"><ArrowLeft className="w-4 h-4" /> Back to Feed</button></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 h-9 px-3 border border-[#e2e8f0] rounded-lg text-sm text-[#475569] hover:bg-[#f8fafc] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <img className="w-full rounded-2xl mb-8 shadow-lg" src={post.imageUrl} alt={post.caption} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />

      {/* Author bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-sm">{post.userName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="font-semibold text-sm text-[#0f172a]">{post.userName}</div>
            <div className="text-xs text-[#94a3b8]">{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${post.moderationStatus === 'safe' ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fef2f2] text-[#dc2626]'}`}>
          {post.moderationStatus === 'safe' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {post.moderationStatus === 'safe' ? 'Safe' : 'Flagged'}
        </span>
      </div>

      <p className="text-base leading-relaxed text-[#0f172a] mb-2">{post.caption}</p>
      {post.location && <p className="flex items-center gap-1.5 text-sm text-[#94a3b8] mb-8"><MapPin className="w-4 h-4" />{post.location}</p>}

      {/* AI Section */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-[#0f172a]"><Sparkles className="w-4 h-4 text-[#2563eb]" /> AI Analysis</h3>
        <p className="text-sm text-[#475569] italic mb-4 leading-relaxed">{post.aiCaption}</p>
        <div className="flex flex-wrap gap-1.5">{post.tags.map((t) => <span key={t} className="px-2.5 py-1 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium">{t}</span>)}</div>
      </div>

      {/* Rating Section */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-[#0f172a]"><Star className="w-4 h-4 text-yellow-500" /> Rating</h3>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-bold text-[#2563eb]">{ratingStats.averageRating}</span>
          <StarRating value={Math.round(ratingStats.averageRating)} readonly size="md" />
          <span className="text-sm text-[#94a3b8]">({ratingStats.totalRatings} ratings)</span>
        </div>
        {user?.role === 'consumer' && (
          <div className="flex items-center gap-3 pt-4 border-t border-[#f1f5f9]">
            <span className="text-sm text-[#475569]">Rate this post:</span>
            <StarRating value={userRating} onChange={handleRate} />
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-[#0f172a]"><MessageSquare className="w-4 h-4 text-[#2563eb]" /> Comments ({comments.length})</h3>
        {user?.role === 'consumer' && (
          <form onSubmit={handleComment} className="flex gap-2 mb-6">
            <input className="flex-1 h-11 px-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all placeholder:text-[#94a3b8]" type="text" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} maxLength={1000} />
            <button type="submit" className="h-11 px-5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm shadow-[#2563eb]/20" disabled={submitting || !commentText.trim()}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}
        {comments.length === 0 ? (
          <p className="text-sm text-[#94a3b8] italic py-4 text-center">No comments yet. Be the first!</p>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {comments.map((c) => (
              <div key={c.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-sm text-[#0f172a]">{c.userName}</span>
                  <span className="text-xs text-[#94a3b8]">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-[#475569] leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
