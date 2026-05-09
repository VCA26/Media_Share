'use client';

import type { Post } from '@/lib/types';
import Link from 'next/link';
import { Star, MessageSquare, MapPin, User } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000); const hrs = Math.floor(diff / 3600000); const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`; if (hrs < 24) return `${hrs}h ago`; if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostCard({ post }: { post: Post }) {
  const filledStars = Math.round(post.averageRating || 0);

  return (
    <Link href={`/post/${post.id}`} className="block bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden no-underline text-inherit hover:no-underline hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-1 transition-all duration-300 group">
      <div className="relative aspect-square overflow-hidden bg-[#f1f5f9]">
        <img className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" src={post.imageUrl} alt={post.caption} loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%2394a3b8'%3EImage unavailable%3C/text%3E%3C/svg%3E"; }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`} />)}
          </div>
          <span className="flex items-center gap-1 text-white text-xs font-medium"><MessageSquare className="w-3.5 h-3.5" />{post.commentCount || 0}</span>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        <p className="text-sm text-[#0f172a] font-medium line-clamp-2 leading-snug">{post.caption}</p>
        {post.location && <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]"><MapPin className="w-3 h-3" />{post.location}</div>}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => <span key={tag} className="px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] rounded-md text-xs font-medium">{tag}</span>)}
          {post.tags.length > 3 && <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#94a3b8] rounded-md text-xs">+{post.tags.length - 3}</span>}
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-[#f1f5f9]">
          <span className="flex items-center gap-1.5 text-xs text-[#64748b]"><User className="w-3 h-3" />{post.userName}</span>
          <span className="text-xs text-[#94a3b8]">{timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
