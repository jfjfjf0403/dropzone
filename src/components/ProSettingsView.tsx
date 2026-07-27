import React, { useState } from 'react';
import { Search, Mouse, Crosshair, Monitor, Target } from 'lucide-react';
import { motion } from 'framer-motion';

import proSettingsData from '../data/proSettings.json';

export default function ProSettingsView() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPros = proSettingsData.filter(pro => 
    pro.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pubg-cyan/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex items-center gap-3">
            <Crosshair className="w-8 h-8 text-pubg-cyan" />
            <h1 className="font-teko text-5xl tracking-wide uppercase neon-text-cyan">Pro Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Discover and compare mouse sensitivity settings from top PUBG professional players.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mb-12">
          <div className="absolute inset-0 bg-pubg-cyan/10 blur-xl rounded-full"></div>
          <div className="relative bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 focus-within:border-pubg-cyan rounded-full p-2 flex items-center shadow-lg transition-all duration-300">
            <Search className="w-6 h-6 text-gray-500 ml-4 mr-2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by player nickname or team..."
              className="w-full bg-transparent border-none focus:outline-none text-zinc-900 dark:text-white text-lg py-2"
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPros.map((pro, idx) => (
            <motion.div 
              key={pro.nickname}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-pubg-cyan/50 transition duration-300 group"
            >
              {/* Card Header */}
              <div className="bg-white/80 dark:bg-zinc-900/80 p-5 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pubg-cyan via-blue-500 to-transparent"></div>
                <div>
                  <h3 className="font-teko text-3xl uppercase tracking-wide text-zinc-900 dark:text-white group-hover:text-pubg-cyan transition-colors flex items-end gap-2">
                    {pro.nickname}
                    {pro.ingameId && pro.ingameId !== '-' && (
                      <span className="text-xl text-gray-500 font-sans normal-case tracking-normal mb-0.5">({pro.ingameId})</span>
                    )}
                  </h3>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded inline-block mt-1">{pro.team}</span>
                </div>
                <Mouse className="w-10 h-10 text-zinc-600 group-hover:text-pubg-cyan/50 transition-colors" />
              </div>

              {/* Card Body */}
              <div className="p-5 grid grid-cols-2 gap-4">
                
                {/* Core Settings */}
                <div className="bg-black/40 rounded-lg p-5 border border-gray-200 dark:border-zinc-800/50 flex flex-col items-center justify-center shadow-inner">
                  <div className="text-sm text-gray-500 uppercase mb-2 font-semibold">DPI</div>
                  <div className="font-teko text-6xl text-pubg-cyan neon-text-cyan drop-shadow-md">{pro.dpi}</div>
                </div>
                
                <div className="bg-black/40 rounded-lg p-5 border border-gray-200 dark:border-zinc-800/50 flex flex-col items-center justify-center shadow-inner">
                  <div className="text-sm text-gray-500 uppercase mb-2 font-semibold">Vertical Multiplier</div>
                  <div className="font-teko text-6xl text-yellow-400 drop-shadow-md">{pro.verticalMultiplier}</div>
                </div>

                <div className="bg-orange-500 dark:bg-black/40 rounded-lg p-5 border border-gray-200 dark:border-zinc-800/50 flex flex-col items-center justify-center shadow-inner">
                  <div className="text-sm text-gray-500 uppercase mb-2 font-semibold">AIM Sens</div>
                  <div className="font-teko text-5xl text-zinc-900 dark:text-white drop-shadow-md">{pro.aimSens}</div>
                </div>

                <div className="bg-orange-500 dark:bg-black/40 rounded-lg p-5 border border-gray-200 dark:border-zinc-800/50 flex flex-col items-center justify-center shadow-inner">
                  <div className="text-sm text-gray-500 uppercase mb-2 font-semibold">ADS Sens</div>
                  <div className="font-teko text-5xl text-zinc-900 dark:text-white drop-shadow-md">{pro.adsSens}</div>
                </div>

                {/* Detailed Sensitivities */}
                <div className="col-span-2 mt-2">
                  <div className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Scope Sensitivities
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    <SensBadge label="General" value={pro.generalSens} />
                    <SensBadge label="2X" value={pro.scope2x} />
                    <SensBadge label="3X" value={pro.scope3x} />
                    <SensBadge label="4X" value={pro.scope4x} />
                    <SensBadge label="6X" value={pro.scope6x} />
                    <SensBadge label="8X" value={pro.scope8x} />
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
          
          {filteredPros.length === 0 && (
            <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-500">
              <Crosshair className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl">No players found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}

function SensBadge({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-gray-100/50 dark:bg-zinc-800/50 rounded flex flex-col items-center py-2 border border-gray-300 dark:border-zinc-700/50 hover:bg-gray-200 dark:bg-zinc-700 transition cursor-default shadow-sm">
      <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-0.5">{label}</span>
      <span className="text-lg font-bold text-zinc-900 dark:text-white">{value}</span>
    </div>
  );
}
