import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowUp, Share2, Flame, Clock, Play, X, Send, Trash2, BadgeCheck } from 'lucide-react';
import { useState, useMemo, type FormEvent } from 'react';
import { type Post, type CommentType, NOW, generateDummyComments } from '../data/posts';

interface FeedViewProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  currentUserName: string;
}

export default function FeedView({ posts, setPosts, currentUserName }: FeedViewProps) {
  const [sortBy, setSortBy] = useState<'hot' | 'new'>('new');
  const [votedPosts, setVotedPosts] = useState<Set<number>>(new Set());
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Initialize comments state
  const [commentsState, setCommentsState] = useState<Record<number, CommentType[]>>(() => {
    const initial: Record<number, CommentType[]> = {};
    posts.forEach(p => {
      initial[p.id] = generateDummyComments(p.comments);
    });
    return initial;
  });

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const HOUR = 1000 * 60 * 60;
    const DAY = HOUR * 24;
    if (diff < 0) return 'Just now';
    if (diff < HOUR) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
    return `${Math.floor(diff / DAY)}d ago`;
  };

  const handleUpvote = (postId: number) => {
    setVotedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPosts(prevPosts => 
      prevPosts.map(p => {
        if (p.id === postId) {
          const isVoted = votedPosts.has(postId);
          return { ...p, upvotes: p.upvotes + (isVoted ? -1 : 1) };
        }
        return p;
      })
    );
  };

  const handleDelete = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    if (confirm('이 게시물을 정말 삭제하시겠습니까?')) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    }
  };

  const toggleComments = (postId: number) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleAddComment = (postId: number, text: string) => {
    if (!text.trim()) return;
    setCommentsState(prev => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        { id: Date.now(), author: currentUserName, text }
      ]
    }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
  };

  const sortedPosts = useMemo(() => {
    let result = [...posts];
    if (sortBy === 'hot') {
      const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;
      const oneWeekAgo = Date.now() - SEVEN_DAYS;
      result = result.filter(p => p.createdAt >= oneWeekAgo);
      result.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [posts, sortBy]);

  return (
    <>
      <motion.div
        key="feed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="h-full flex flex-col p-8 overflow-y-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h2 className="font-teko text-4xl font-semibold uppercase text-gray-800 dark:text-gray-200 tracking-wide">Community Feed</h2>
            <p className="text-pubg-cyan font-semibold tracking-widest uppercase">Discussions & Highlights in one place</p>
          </div>
          
          <div className="flex gap-4 bg-white/50 dark:bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800/80 backdrop-blur-sm">
            <button 
              onClick={() => setSortBy('new')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-teko font-bold uppercase text-lg transition-all duration-300 ${
                sortBy === 'new' 
                  ? 'bg-gradient-to-r from-pubg-cyan to-blue-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-zinc-900 dark:text-white hover:bg-gray-100 dark:bg-zinc-800'
              }`}
            >
              <Clock className="w-5 h-5" /> New
            </button>
            <button 
              onClick={() => setSortBy('hot')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-teko font-bold uppercase text-lg transition-all duration-300 ${
                sortBy === 'hot' 
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-zinc-900 dark:text-white hover:bg-gray-100 dark:bg-zinc-800'
              }`}
            >
              <Flame className="w-5 h-5" /> Hot
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          <AnimatePresence>
          {sortedPosts.map(post => {
            const isVoted = votedPosts.has(post.id);
            const isClip = post.type === 'clip';

            return (
              <motion.div 
                whileHover={{ y: -4 }}
                key={post.id} 
                className="bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer hover:border-gray-300 dark:border-zinc-700 transition flex flex-col h-full"
                onClick={() => setSelectedPost(post)}
              >
                {/* If it's a clip, show video thumbnail at the top */}
                {isClip && (post.image || post.youtubeId) && (
                  <div className="w-full relative aspect-video bg-black overflow-hidden shrink-0">
                    <img 
                      src={post.youtubeId ? `https://img.youtube.com/vi/${post.youtubeId}/hqdefault.jpg` : post.image} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition duration-700" 
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border-2 border-white/30 flex items-center justify-center group-hover:bg-pubg-cyan/80 group-hover:border-pubg-cyan transition-all duration-300 transform group-hover:scale-110">
                        <Play className="w-6 h-6 text-zinc-900 dark:text-white ml-1 fill-white" />
                      </div>
                    </div>

                    {post.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-md text-xs font-bold text-zinc-900 dark:text-white">
                        {post.duration}
                      </div>
                    )}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent"></div>
                  </div>
                )}

                {/* Text/Discussion Image (Landscape) */}
                {!isClip && post.image && (
                  <div className="w-full h-48 overflow-hidden relative">
                    <img src={post.image} alt="Post media" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1 bg-zinc-900/40">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden border border-gray-400 dark:border-zinc-600 group-hover:border-pubg-cyan transition-colors">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-pubg-cyan transition flex items-center gap-1">
                          {post.author}
                          {post.author === 'JELLFI-_-' && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400 fill-blue-500/20 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{getRelativeTime(post.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full shadow-sm ${
                        post.tag === 'Official' ? 'bg-pubg-yellow text-pubg-dark' : 
                        post.tag === 'Highlights' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-700'
                      }`}>
                        {post.tag}
                      </span>
                      {post.author === currentUserName && (
                        <button 
                          onClick={(e) => handleDelete(e, post.id)}
                          className="p-1.5 ml-2 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-gray-800 dark:text-gray-200 leading-relaxed mb-6 ${isClip ? 'text-lg font-medium' : 'text-base'}`}>
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400 mt-auto pt-4 border-t border-zinc-800/80">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpvote(post.id);
                      }}
                      className={`flex items-center gap-2 transition group/btn ${isVoted ? 'text-pubg-cyan' : 'hover:text-pubg-cyan'}`}
                    >
                      <div className={`p-1.5 rounded-full transition ${isVoted ? 'bg-pubg-cyan/20' : 'group-hover/btn:bg-pubg-cyan/20'}`}>
                        <ArrowUp className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold">{post.upvotes.toLocaleString()}</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Instead of expanding inline, we can open the modal or keep the inline toggle. Let's open modal.
                        setSelectedPost(post);
                      }}
                      className={`flex items-center gap-2 transition group/btn hover:text-zinc-900 dark:text-white`}
                    >
                      <div className={`p-1.5 rounded-full transition group-hover/btn:bg-gray-200 dark:bg-zinc-700`}>
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold">{post.comments.toLocaleString()}</span>
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 ml-auto hover:text-zinc-900 dark:text-white transition p-1.5 rounded-full hover:bg-gray-200 dark:bg-zinc-700"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Post Modal (Video or Discussion) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-7xl h-full max-h-[85vh] rounded-3xl overflow-hidden bg-zinc-950 flex relative border border-gray-300 dark:border-zinc-700/50 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Left/Full Media Area */}
              <div className="absolute inset-0 z-0 sm:right-96 right-0 overflow-y-auto custom-scrollbar flex flex-col bg-black">
                {selectedPost.type === 'clip' ? (
                  // Clip View
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    {selectedPost.youtubeId ? (
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedPost.youtubeId}?autoplay=1&rel=0`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <>
                        <img src={selectedPost.image} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Video background" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group cursor-pointer hover:bg-black/30 transition">
                          <div className="w-24 h-24 rounded-full bg-pubg-cyan/80 flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.6)] group-hover:scale-110 transition-transform">
                            <Play className="w-10 h-10 text-zinc-900 dark:text-white ml-2 fill-white" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // Discussion View
                  <div className="w-full min-h-full flex flex-col p-10 justify-center">
                    {selectedPost.image && (
                      <div className="w-full max-h-[60vh] rounded-2xl overflow-hidden mb-8 shadow-2xl border border-gray-200 dark:border-zinc-800 shrink-0">
                        <img src={selectedPost.image} alt="Post media" className="w-full h-full object-contain bg-white dark:bg-zinc-900" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
                      <div className="flex items-center mb-6">
                        <span className={`w-fit text-sm font-bold uppercase px-4 py-1.5 rounded-full ${
                          selectedPost.tag === 'Official' ? 'bg-pubg-yellow text-pubg-dark' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-700'
                        }`}>
                          {selectedPost.tag}
                        </span>
                        {selectedPost.author === currentUserName && (
                          <button 
                            onClick={(e) => handleDelete(e, selectedPost.id)}
                            className="p-2 ml-4 rounded-full text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Delete Post"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <h2 className={`text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white leading-tight ${selectedPost.body ? 'mb-6' : 'mb-8'}`}>
                        {selectedPost.content}
                      </h2>
                      {selectedPost.body && (
                        <p className="text-gray-700 dark:text-gray-300 text-lg whitespace-pre-line leading-relaxed mb-8 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/80">
                          {selectedPost.body}
                        </p>
                      )}
                      <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden border border-gray-400 dark:border-zinc-600">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPost.author}`} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                              {selectedPost.author}
                              {selectedPost.author === 'JELLFI-_-' && (
                                <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-500/20 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{getRelativeTime(selectedPost.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Comments Overlay */}
              <div className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-zinc-900/90 backdrop-blur-2xl border-l border-gray-300 dark:border-zinc-700/50 flex flex-col z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-300 dark:border-zinc-700/50 flex justify-between items-center bg-zinc-900/60 shrink-0">
                  <h3 className="font-teko text-2xl uppercase font-bold text-zinc-900 dark:text-white tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pubg-cyan" /> 
                    Comments ({selectedPost.comments})
                  </h3>
                  <button onClick={() => setSelectedPost(null)} className="text-gray-600 dark:text-gray-400 hover:text-zinc-900 dark:text-white transition-colors bg-gray-100 dark:bg-zinc-800 p-2 rounded-full hover:bg-gray-200 dark:bg-zinc-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Comment List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                  {/* Post Caption Context for Clips */}
                  {selectedPost.type === 'clip' && (
                    <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-zinc-800">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden shrink-0 border border-zinc-500">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPost.author}`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1 mb-1">
                          {selectedPost.author}
                          {selectedPost.author === 'JELLFI-_-' && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400 fill-blue-500/20 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                          )}
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{selectedPost.content}</p>
                      </div>
                    </div>
                  )}

                  {commentsState[selectedPost.id]?.map(c => (
                    <div key={c.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-gray-100/50 dark:bg-zinc-800/50 p-4 rounded-2xl rounded-tl-none text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700/50 w-full">
                        <span className="font-bold text-pubg-cyan flex items-center gap-1 mb-1.5">
                          {c.author}
                          {c.author === 'JELLFI-_-' && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400 fill-blue-500/20 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                          )}
                        </span>
                        <p className="leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Input Area */}
                <div className="p-6 border-t border-gray-300 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/80 shrink-0">
                  <CommentInput onSubmit={(text) => handleAddComment(selectedPost.id, text)} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper component for the comment input
function CommentInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden shrink-0 border border-gray-400 dark:border-zinc-600">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=me`} alt="My Avatar" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 relative">
        <input 
          type="text" 
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="댓글 쓰기..." 
          onClick={e => e.stopPropagation()}
          className="bg-zinc-800/80 text-sm text-zinc-900 dark:text-white px-5 py-3 rounded-full w-full border border-gray-300 dark:border-zinc-700 outline-none focus:border-pubg-cyan focus:bg-gray-100 dark:bg-zinc-800 transition-all pr-12"
        />
        <button 
          type="submit"
          disabled={!text.trim()}
          onClick={e => e.stopPropagation()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-pubg-cyan disabled:opacity-50 disabled:hover:text-gray-600 dark:text-gray-400 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
