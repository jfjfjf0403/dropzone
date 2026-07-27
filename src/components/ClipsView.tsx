import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share, Music } from 'lucide-react';

export default function ClipsView() {
  return (
    <motion.div
      key="clips"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="h-full w-full bg-black flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Container for TikTok style vertical video */}
      <div className="relative h-[90%] w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800">
        
        {/* Video Placeholder */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=1000" 
            alt="Clip background" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
        </div>

        {/* Top Bar (Overlay) */}
        <div className="absolute top-6 left-0 w-full flex justify-center z-10 px-4">
          <div className="flex gap-6 font-teko text-2xl font-bold uppercase drop-shadow-md">
            <span className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-zinc-900 dark:text-white transition">Following</span>
            <span className="text-zinc-900 dark:text-white border-b-4 border-pubg-cyan pb-1 cursor-pointer">For You</span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-800 rounded-full border-2 border-white flex items-center justify-center mb-1 overflow-hidden cursor-pointer hover:scale-105 transition">
              <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="w-6 h-6 bg-pubg-red rounded-full flex items-center justify-center -mt-5 z-10 border-2 border-black text-zinc-900 dark:text-white text-sm font-bold hover:bg-red-500 transition">+</button>
          </div>
          
          <button className="flex flex-col items-center text-zinc-900 dark:text-white hover:text-pubg-cyan transition drop-shadow-md group">
            <div className="p-3 bg-black/40 rounded-full group-hover:bg-pubg-cyan/20 transition mb-1 backdrop-blur-md">
              <Heart className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold">12.4K</span>
          </button>
          
          <button className="flex flex-col items-center text-zinc-900 dark:text-white hover:text-gray-700 dark:text-gray-300 transition drop-shadow-md group">
            <div className="p-3 bg-black/40 rounded-full group-hover:bg-white/20 transition mb-1 backdrop-blur-md">
              <MessageCircle className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold">845</span>
          </button>
          
          <button className="flex flex-col items-center text-zinc-900 dark:text-white hover:text-gray-700 dark:text-gray-300 transition drop-shadow-md group">
            <div className="p-3 bg-black/40 rounded-full group-hover:bg-white/20 transition mb-1 backdrop-blur-md">
              <Share className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold">Share</span>
          </button>
          
          {/* Record Spin */}
          <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-full border-4 border-gray-200 dark:border-zinc-800 flex items-center justify-center mt-4 animate-spin shadow-lg" style={{ animationDuration: '3s' }}>
            <Music className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-6 left-6 right-24 z-10">
          <h3 className="font-bold text-xl drop-shadow-md text-zinc-900 dark:text-white mb-2 cursor-pointer hover:underline">@SniperElite</h3>
          <p className="text-base text-gray-800 dark:text-gray-200 mt-1 drop-shadow-md leading-relaxed">1 vs 4 Clutch at Pecado! 🔥 <span className="font-bold cursor-pointer hover:underline">#PUBG</span> <span className="font-bold cursor-pointer hover:underline">#Highlights</span> <span className="font-bold cursor-pointer hover:underline">#Sniper</span></p>
          <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-pubg-yellow drop-shadow-md">
            <Music className="w-4 h-4" />
            <span className="marquee cursor-pointer hover:underline">PUBG Theme (Remix) - DropZone Original</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
