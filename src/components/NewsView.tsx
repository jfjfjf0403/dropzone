import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
  tags?: string[];
}

export default function NewsView() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Using our Vite proxy to avoid CORS
        const response = await fetch('/api/steam/ISteamNews/GetNewsForApp/v0002/?appid=578080&count=20&maxlength=300&format=json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch news from Steam API');
        }

        const data = await response.json();
        const items = data.appnews.newsitems;
        
        // Translate titles and contents to Korean using free Google Translate proxy
        const translateText = async (text: string) => {
          if (!text) return text;
          try {
            const res = await fetch(`/api/translate/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`);
            const json = await res.json();
            return json[0].map((item: any) => item[0]).join('');
          } catch (e) {
            console.error('Translation failed', e);
            return text;
          }
        };

        const translatedItems = await Promise.all(
          items.map(async (item: NewsItem) => {
            const translatedTitle = await translateText(item.title);
            const translatedContents = await translateText(cleanContents(item.contents));
            return {
              ...item,
              title: translatedTitle,
              contents: translatedContents
            };
          })
        );
        
        setNews(translatedItems);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while fetching news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Clean up steam specific tags and simple HTML from snippet
  const cleanContents = (contents: string) => {
    return contents
      .replace(/\{STEAM_CLAN_IMAGE\}\/[^\s]+/g, '')
      .replace(/\[\/?\w+\]/g, '') // Remove simple bbcode like [b], [/b]
      .replace(/<[^>]+>/g, '') // Remove simple HTML tags
      .trim();
  };

  return (
    <motion.div 
      key="news"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pubg-yellow/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pubg-cyan/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-teko text-5xl font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-3">
              <Newspaper className="w-10 h-10 text-pubg-yellow" />
              Patch Notes & News
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Official PUBG: BATTLEGROUNDS updates powered by Steam</p>
          </div>
          
          <div className="glass-panel px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live API Connection</span>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-pubg-yellow">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-teko text-2xl uppercase tracking-widest">Fetching Intel...</p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center justify-center text-red-400 glass-panel border border-red-900/30 rounded-xl">
            <p className="text-xl mb-2">Failed to load news.</p>
            <p className="text-sm opacity-70">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item, idx) => (
              <motion.div
                key={item.gid}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block glass-panel p-6 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-pubg-yellow/50 hover:bg-gray-100/50 dark:bg-zinc-800/50 transition duration-300 group h-full flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-pubg-cyan bg-pubg-cyan/10 px-2 py-1 rounded">
                      {item.feedlabel}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.date)}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-3 group-hover:text-pubg-yellow transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3 flex-1">
                    {cleanContents(item.contents)}...
                  </p>
                  
                  <div className="mt-auto flex items-center text-sm font-semibold text-pubg-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                    Read Full Article <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
