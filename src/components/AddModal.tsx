import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, Video, X, ArrowLeft } from 'lucide-react';
import { type Post, NOW } from '../data/posts';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost?: (post: Post) => void;
}

export default function AddModal({ isOpen, onClose, onAddPost }: AddModalProps) {
  const [mode, setMode] = useState<'menu' | 'post' | 'clip'>('menu');
  
  // Form States
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [tag, setTag] = useState('Discussion');

  const handleClose = () => {
    setMode('menu');
    setTitle('');
    setBody('');
    setYoutubeId('');
    setTag('Discussion');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalYoutubeId = youtubeId;
    if (mode === 'clip') {
      const match = youtubeId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/);
      if (match && match[1]) {
        finalYoutubeId = match[1];
      }
    }

    if (onAddPost) {
      const newPost: Post = {
        id: NOW + Math.floor(Math.random() * 1000), // Random ID
        type: mode === 'clip' ? 'clip' : 'discussion',
        author: 'JELLFI-_-', // Current user
        createdAt: Date.now(),
        content: title,
        body: mode === 'post' ? body : undefined,
        youtubeId: mode === 'clip' ? finalYoutubeId : undefined,
        upvotes: Math.floor(Math.random() * 2001) + 5000, // Admin perk: start with 5000~7000 upvotes
        comments: 0,
        tag: tag,
        duration: mode === 'clip' ? '0:00' : undefined
      };
      onAddPost(newPost);
    }
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          
          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 w-full glass-panel rounded-t-3xl p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-gray-300 dark:border-zinc-700 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {mode !== 'menu' && (
                  <button onClick={() => setMode('menu')} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:bg-zinc-700 transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                <h3 className="font-teko text-2xl uppercase tracking-wider text-zinc-900 dark:text-white">
                  {mode === 'menu' ? 'Create New' : mode === 'post' ? 'Create Post' : 'Upload Clip'}
                </h3>
              </div>
              <button onClick={handleClose} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:bg-zinc-700 transition">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'menu' && (
                <motion.div 
                  key="menu"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-3 gap-4 mb-8"
                >
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 hover:border-pubg-cyan hover:bg-gray-100 dark:bg-zinc-800 transition group">
                    <div className="w-12 h-12 rounded-full bg-pubg-cyan/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <Users className="w-6 h-6 text-pubg-cyan" />
                    </div>
                    <span className="font-teko text-lg uppercase">Find Squad</span>
                    <span className="text-[10px] text-gray-500 mt-1">Recruit teammates</span>
                  </button>
                  
                  <button onClick={() => setMode('post')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 hover:border-pubg-yellow hover:bg-gray-100 dark:bg-zinc-800 transition group">
                    <div className="w-12 h-12 rounded-full bg-pubg-yellow/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <FileText className="w-6 h-6 text-pubg-yellow" />
                    </div>
                    <span className="font-teko text-lg uppercase">Post</span>
                    <span className="text-[10px] text-gray-500 mt-1">Share thoughts</span>
                  </button>

                  <button onClick={() => setMode('clip')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 hover:border-pubg-red hover:bg-gray-100 dark:bg-zinc-800 transition group">
                    <div className="w-12 h-12 rounded-full bg-pubg-red/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <Video className="w-6 h-6 text-pubg-red" />
                    </div>
                    <span className="font-teko text-lg uppercase">Upload Clip</span>
                    <span className="text-[10px] text-gray-500 mt-1">Share highlights</span>
                  </button>
                </motion.div>
              )}

              {mode !== 'menu' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4 mb-4"
                >
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tag</label>
                    <select 
                      value={tag} 
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:outline-none focus:border-pubg-cyan transition"
                    >
                      <option value="Discussion">Discussion</option>
                      <option value="Question">Question</option>
                      <option value="Guide">Guide</option>
                      <option value="Highlights">Highlights</option>
                      <option value="News">News</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter post title..."
                      required
                      className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:outline-none focus:border-pubg-cyan transition"
                    />
                  </div>

                  {mode === 'post' && (
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Body (Optional)</label>
                      <textarea 
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write detailed content here..."
                        rows={5}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:outline-none focus:border-pubg-cyan transition resize-none custom-scrollbar"
                      />
                    </div>
                  )}

                  {mode === 'clip' && (
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">YouTube Link or ID</label>
                      <input 
                        type="text" 
                        value={youtubeId}
                        onChange={(e) => setYoutubeId(e.target.value)}
                        placeholder="e.g. https://youtu.be/u1oqfdh4xBY"
                        required
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:outline-none focus:border-pubg-cyan transition"
                      />
                      <p className="text-xs text-gray-500 mt-1">Paste the full YouTube link or just the 11-character video ID.</p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-4 bg-pubg-yellow text-pubg-dark rounded-lg font-teko text-xl font-bold uppercase hover:bg-[#e5a600] transition mt-2"
                  >
                    Submit Post
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
