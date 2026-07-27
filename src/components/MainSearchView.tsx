import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, X } from 'lucide-react';

interface MainSearchViewProps {
  favorites: string[];
  onSearch: (name: string) => void;
  onSelectProfile: (name: string) => void;
  onRemoveFavorite: (name: string) => void;
}

export default function MainSearchView({ favorites, onSearch, onSelectProfile, onRemoveFavorite }: MainSearchViewProps) {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="h-full flex flex-col items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center relative"
    >
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-50/80 dark:bg-pubg-dark/80 backdrop-blur-sm transition-colors duration-300"></div>
      
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        {/* Big Title */}
        <div className="mb-12 flex flex-col items-center">
          <h1 className="font-teko text-8xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 drop-shadow-xl">
            Drop<span className="text-pubg-yellow drop-shadow-[0_0_15px_rgba(250,192,0,0.6)]">Zone</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-600 dark:text-zinc-400 text-sm font-medium tracking-widest uppercase mt-4">PUBG Stats & Community</p>
        </div>

        {/* Big Search Bar */}
        <div className="w-full relative shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <span className="font-bold text-pubg-orange font-teko text-xl uppercase tracking-widest mt-1">STEAM</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="배틀그라운드 닉네임을 입력하세요."
            className="w-full h-14 bg-white rounded-sm pl-24 pr-14 text-base text-zinc-900 placeholder-zinc-400 font-bold focus:outline-none focus:ring-4 focus:ring-pubg-yellow/50 transition-all"
          />
          <button 
            onClick={() => query.trim() && onSearch(query.trim())}
            className="absolute inset-y-0 right-0 px-5 flex items-center justify-center text-gray-600 dark:text-zinc-400 hover:text-pubg-cyan transition-colors"
          >
            <Search className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="w-full mt-12 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-zinc-700/50 shadow-sm dark:shadow-none">
            <h3 className="font-teko text-lg text-gray-700 dark:text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-pubg-yellow fill-pubg-yellow" /> 즐겨찾기
            </h3>
            <div className="flex flex-wrap gap-3">
              {favorites.map((fav) => (
                <div 
                  key={fav}
                  className="group flex items-center bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-gray-400 dark:border-zinc-600 hover:border-pubg-cyan dark:hover:border-pubg-cyan rounded-lg overflow-hidden transition-all shadow-sm cursor-pointer"
                >
                  <div 
                    onClick={() => onSelectProfile(fav)}
                    className="px-4 py-2 font-bold text-gray-800 dark:text-white group-hover:text-pubg-cyan transition-colors"
                  >
                    {fav}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(fav);
                    }}
                    className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 border-l border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-500 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
