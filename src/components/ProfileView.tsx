import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, User, Shield, AlertCircle, RefreshCw, Star } from 'lucide-react';
import { getPlayerStats, type PlayerStats, type RecentMatch } from '../services/pubgApi';

interface ProfileProps {
  accountId?: string;
  playerName?: string;
  favorites?: string[];
  toggleFavorite?: (name: string) => void;
}

export default function ProfileView({ accountId, playerName, favorites = [], toggleFavorite }: ProfileProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const loadStats = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh && cooldown > 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const targetId = accountId || 'account.60467965e3234f00bd9b9fa29d2b1990';
      const data = await getPlayerStats(targetId, true, isManualRefresh);
      setStats(data);
      if (isManualRefresh) {
        setCooldown(60); // 1 minute cooldown for manual refresh
      }
    } catch (err) {
      console.error(err);
      setError("데이터를 불러올 수 없습니다. 닉네임을 확인하거나 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [accountId, cooldown]);

  useEffect(() => {
    loadStats(false);
  }, [loadStats]);

  const renderModeCard = (title: string, modeStats: Partial<PlayerStats> | null | undefined, icon: React.ReactNode, bgColor: string, borderColor: string = 'border-gray-300 dark:border-zinc-700/50', shadowColor: string = '') => {
    if (!modeStats) {
      return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center opacity-50 relative overflow-hidden h-auto min-h-[200px] border border-gray-200 dark:border-zinc-800">
          <h4 className="font-teko text-2xl uppercase text-gray-600 dark:text-gray-400 mb-2">{title}</h4>
          <p className="text-sm text-gray-500 font-bold">아직 경기가 없습니다.</p>
        </div>
      );
    }

    return (
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className={`bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group flex flex-col border-2 ${borderColor} shadow-lg transition-all duration-300 ${shadowColor}`}
        style={{ boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.05)' }}
      >
        <div className={`absolute -right-12 -top-12 w-32 h-32 ${bgColor} rounded-full blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-500`}></div>
        <div className="relative z-10 flex-1 flex flex-col">
          <h4 className="font-teko text-2xl uppercase text-zinc-900 dark:text-white flex items-center gap-2 tracking-wide drop-shadow-md mb-2">
            {icon} {title}
          </h4>
          
          <div className="flex justify-between items-end mb-4 border-b border-gray-300 dark:border-zinc-700/50 pb-2">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{modeStats.roundsPlayed?.toLocaleString()} 게임</div>
            <div className="flex gap-1 text-[10px]">
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/50 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-sm">
                🍗 {modeStats.wins}
              </span>
              <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-sm">
                #10 {modeStats.top10s}
              </span>
            </div>
          </div>
          
          {/* Core Stats */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold tracking-wider">K/D</span>
            <span className={`font-teko text-3xl font-bold drop-shadow-md ${parseFloat(modeStats.kd || '0') >= 2.0 ? 'text-pubg-yellow' : 'text-zinc-900 dark:text-white'}`}>
              {modeStats.kd}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold tracking-wider">평균 딜량</span>
            <span className={`font-teko text-2xl font-bold drop-shadow-md ${parseFloat(modeStats.avgDamage || '0') >= 250 ? 'text-pubg-cyan' : 'text-gray-700 dark:text-gray-300'}`}>
              {modeStats.avgDamage}
            </span>
          </div>
          
          {/* Additional Micro Stats Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-zinc-700/30">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">승률</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">{modeStats.winRate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">탑텐</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">{modeStats.top10Rate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">헤드샷</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">{modeStats.headshotRate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">최다 킬</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">{modeStats.roundMostKills}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">최장 거리 킬</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">{Math.floor(modeStats.longestKill || 0)}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">어시스트</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">{modeStats.assists}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col p-8 overflow-y-auto"
    >
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-teko text-4xl font-semibold uppercase text-gray-800 dark:text-gray-200 tracking-wide flex items-center gap-4">
            Player Profile
            <button 
              onClick={() => loadStats(true)} 
              disabled={loading || cooldown > 0}
              className="bg-pubg-yellow text-zinc-900 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 hover:bg-yellow-400 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
              {cooldown > 0 ? `대기 (${cooldown}초)` : '갱신'}
            </button>
          </h2>
          <p className="text-pubg-cyan font-semibold tracking-widest uppercase mt-1">Steam Official Data</p>
        </div>
      </div>

      {loading && !stats && !error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-pubg-cyan border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-32 max-w-6xl mx-auto w-full">
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 text-red-200">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Header Section */}
          <div className={`glass-panel p-6 rounded-2xl flex items-center gap-6 relative overflow-hidden border-t-2 ${error ? 'border-gray-300 dark:border-gray-300 dark:border-zinc-700 opacity-50' : 'border-pubg-yellow'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-pubg-cyan/10 rounded-full blur-3xl"></div>
            
            <div className="w-24 h-24 rounded-2xl bg-gray-200 dark:bg-gray-100 dark:bg-zinc-800 border-2 border-gray-300 dark:border-gray-400 dark:border-zinc-600 p-1 relative z-10 shrink-0">
              <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200" alt="Profile" className="w-full h-full object-cover rounded-xl" />
            </div>
            
            <div className="flex flex-col flex-1 relative z-10">
              <div className="flex items-center gap-4">
                <h3 className="font-teko text-5xl font-bold uppercase tracking-wider text-gray-900 dark:text-white leading-none">{playerName || 'JELLFI-_-'}</h3>
                {toggleFavorite && playerName && (
                  <button 
                    onClick={() => toggleFavorite(playerName)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-100 dark:bg-zinc-800 rounded-full transition-colors"
                    title={favorites.includes(playerName) ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  >
                    <Star 
                      className={`w-7 h-7 transition-all ${favorites.includes(playerName) ? 'text-pubg-yellow fill-pubg-yellow' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-zinc-500 hover:text-pubg-yellow'}`} 
                    />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded bg-gray-100 dark:bg-gray-100 dark:bg-zinc-800 border ${stats?.tier && stats.tier !== 'Unranked' ? 'border-pubg-cyan text-pubg-cyan' : 'border-gray-300 dark:border-gray-400 dark:border-zinc-600 text-gray-500 dark:text-gray-600 dark:text-gray-400'} text-sm font-bold uppercase`}>
                  {stats?.tier && stats.tier !== 'Unranked' ? `${stats.tier} - ${stats.rankPoints} RP` : 'Unranked'}
                </span>
                <span className="text-gray-500 dark:text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Steam
                </span>
              </div>
              {/* 명예의 전당: Playstyle Tags */}
              {(() => {
                if (!stats || !stats.modes) return null;
                const ns = stats.modes.normalSquad;
                const rs = stats.modes.rankedSquad;
                if (!ns && !rs) return null;

                const getVal = (key: string, isFloat = false) => {
                  const val1 = isFloat ? parseFloat((ns as any)?.[key] || '0') : ((ns as any)?.[key] || 0);
                  const val2 = isFloat ? parseFloat((rs as any)?.[key] || '0') : ((rs as any)?.[key] || 0);
                  return Math.max(val1, val2);
                };

                const kd = getVal('kd', true);
                const damage = getVal('avgDamage', true);
                const winRate = getVal('winRate', true);
                const headshotRate = getVal('headshotRate', true);
                const longestKill = getVal('longestKill', false);
                const maxKills = getVal('roundMostKills', false);

                const badges = [];

                // 1. K/D Badge
                if (kd >= 5.0) badges.push({ title: '핵의심러', desc: `K/D ${kd}`, color: 'text-red-600 dark:text-red-100', bg: 'bg-red-600/20', border: 'border-red-400', glowColor: 'shadow-red-500', icon: '🚨' });
                else if (kd >= 4.0) badges.push({ title: '재야고수', desc: `K/D ${kd}`, color: 'text-purple-600 dark:text-purple-100', bg: 'bg-purple-600/20', border: 'border-purple-400', glowColor: 'shadow-purple-500', icon: '🥷' });
                else if (kd >= 3.0) badges.push({ title: '고인물', desc: `K/D ${kd}`, color: 'text-blue-600 dark:text-blue-100', bg: 'bg-blue-600/20', border: 'border-blue-400', glowColor: 'shadow-blue-500', icon: '🌊' });
                else if (kd >= 2.0) badges.push({ title: '준고수', desc: `K/D ${kd}`, color: 'text-yellow-600 dark:text-yellow-100', bg: 'bg-yellow-600/20', border: 'border-yellow-400', glowColor: 'shadow-yellow-500', icon: '⚔️' });
                else if (kd >= 1.0) badges.push({ title: '일반인', desc: `K/D ${kd}`, color: 'text-gray-700 dark:text-gray-100', bg: 'bg-gray-600/20', border: 'border-gray-400', glowColor: 'shadow-white', icon: '🚶' });
                else badges.push({ title: '배린이', desc: `K/D ${kd}`, color: 'text-green-600 dark:text-green-100', bg: 'bg-green-600/20', border: 'border-green-400', glowColor: 'shadow-green-500', icon: '🐣' });

                // 2. Avg Damage Badge
                if (damage >= 550) badges.push({ title: '재앙', desc: `평균 데미지 ${damage}`, color: 'text-red-600 dark:text-red-100', bg: 'bg-red-600/20', border: 'border-red-400', glowColor: 'shadow-red-600', icon: '🌋' });
                else if (damage >= 450) badges.push({ title: '인간병기', desc: `평균 데미지 ${damage}`, color: 'text-red-600 dark:text-red-200', bg: 'bg-red-600/20', border: 'border-red-400', glowColor: 'shadow-red-500', icon: '🤖' });
                else if (damage >= 350) badges.push({ title: '기관포', desc: `평균 데미지 ${damage}`, color: 'text-orange-600 dark:text-orange-100', bg: 'bg-orange-600/20', border: 'border-orange-400', glowColor: 'shadow-orange-500', icon: '💥' });
                else if (damage >= 250) badges.push({ title: '메인딜러', desc: `평균 데미지 ${damage}`, color: 'text-yellow-600 dark:text-yellow-100', bg: 'bg-yellow-600/20', border: 'border-yellow-400', glowColor: 'shadow-yellow-500', icon: '🗡️' });
                else if (damage >= 150) badges.push({ title: '양민', desc: `평균 데미지 ${damage}`, color: 'text-gray-700 dark:text-gray-100', bg: 'bg-gray-600/20', border: 'border-gray-400', glowColor: 'shadow-white', icon: '😐' });
                else badges.push({ title: '꽃게', desc: `평균 데미지 ${damage}`, color: 'text-zinc-700 dark:text-zinc-200', bg: 'bg-gray-600/20', border: 'border-zinc-400', glowColor: 'shadow-white/30', icon: '🦀' });

                // 3. Headshot %
                if (headshotRate >= 40) badges.push({ title: '에임핵의심', desc: `헤드샷 ${headshotRate}%`, color: 'text-red-600 dark:text-red-100', bg: 'bg-red-600/20', border: 'border-red-400', glowColor: 'shadow-red-500', icon: '👁️‍🗨️' });
                else if (headshotRate >= 30) badges.push({ title: '원탭러', desc: `헤드샷 ${headshotRate}%`, color: 'text-purple-600 dark:text-purple-100', bg: 'bg-purple-600/20', border: 'border-purple-400', glowColor: 'shadow-purple-500', icon: '🎯' });
                else if (headshotRate >= 20) badges.push({ title: '정조준러', desc: `헤드샷 ${headshotRate}%`, color: 'text-blue-600 dark:text-blue-100', bg: 'bg-blue-600/20', border: 'border-blue-400', glowColor: 'shadow-blue-500', icon: '👁️' });
                else if (headshotRate >= 10) badges.push({ title: '일반사수', desc: `헤드샷 ${headshotRate}%`, color: 'text-gray-700 dark:text-gray-100', bg: 'bg-gray-600/20', border: 'border-gray-400', glowColor: 'shadow-white', icon: '🔫' });
                else badges.push({ title: '몸샷장인', desc: `헤드샷 ${headshotRate}%`, color: 'text-zinc-700 dark:text-zinc-200', bg: 'bg-gray-600/20', border: 'border-zinc-400', glowColor: 'shadow-white/30', icon: '👕' });

                // 4. Win Rate
                if (winRate >= 20) badges.push({ title: '치킨장인', desc: `승률 ${winRate}%`, color: 'text-yellow-600 dark:text-yellow-100', bg: 'bg-yellow-600/20', border: 'border-yellow-400', glowColor: 'shadow-yellow-500', icon: '🍗' });
                else if (winRate >= 15) badges.push({ title: '우승청부업자', desc: `승률 ${winRate}%`, color: 'text-orange-600 dark:text-orange-100', bg: 'bg-orange-600/20', border: 'border-orange-400', glowColor: 'shadow-orange-500', icon: '🏆' });
                else if (winRate >= 10) badges.push({ title: '승부사', desc: `승률 ${winRate}%`, color: 'text-blue-600 dark:text-blue-100', bg: 'bg-blue-600/20', border: 'border-blue-400', glowColor: 'shadow-blue-500', icon: '🎲' });
                else if (winRate >= 5) badges.push({ title: '도전자', desc: `승률 ${winRate}%`, color: 'text-green-600 dark:text-green-100', bg: 'bg-green-600/20', border: 'border-green-400', glowColor: 'shadow-green-500', icon: '🥊' });
                else badges.push({ title: '만년패잔병', desc: `승률 ${winRate}%`, color: 'text-zinc-700 dark:text-zinc-200', bg: 'bg-gray-600/20', border: 'border-zinc-400', glowColor: 'shadow-white/30', icon: '🏳️' });

                // 7. Longest Kill
                if (longestKill >= 400) badges.push({ title: '대물저격총', desc: `최장 킬 ${longestKill}m`, color: 'text-purple-600 dark:text-purple-100', bg: 'bg-purple-600/20', border: 'border-purple-400', glowColor: 'shadow-purple-500', icon: '🔭' });
                else if (longestKill >= 300) badges.push({ title: '저격수', desc: `최장 킬 ${longestKill}m`, color: 'text-indigo-600 dark:text-indigo-100', bg: 'bg-indigo-600/20', border: 'border-indigo-400', glowColor: 'shadow-indigo-500', icon: '🦅' });
                else if (longestKill >= 200) badges.push({ title: '중장거리형', desc: `최장 킬 ${longestKill}m`, color: 'text-blue-600 dark:text-blue-100', bg: 'bg-blue-600/20', border: 'border-blue-400', glowColor: 'shadow-blue-500', icon: '🏹' });
                else if (longestKill >= 100) badges.push({ title: '표준거리형', desc: `최장 킬 ${longestKill}m`, color: 'text-gray-700 dark:text-gray-100', bg: 'bg-gray-600/20', border: 'border-gray-400', glowColor: 'shadow-white', icon: '📏' });
                else badges.push({ title: '근접전문', desc: `최장 킬 ${longestKill}m`, color: 'text-orange-600 dark:text-orange-100', bg: 'bg-orange-600/20', border: 'border-orange-400', glowColor: 'shadow-orange-500', icon: '🔪' });

                // 8. Max Kills
                if (maxKills >= 15) badges.push({ title: '전장의 신', desc: `최대 킬 ${maxKills}`, color: 'text-red-600 dark:text-red-100', bg: 'bg-red-600/20', border: 'border-red-400', glowColor: 'shadow-red-500', icon: '⚡' });
                else if (maxKills >= 12) badges.push({ title: '통곡의 벽', desc: `최대 킬 ${maxKills}`, color: 'text-purple-600 dark:text-purple-100', bg: 'bg-purple-600/20', border: 'border-purple-400', glowColor: 'shadow-purple-500', icon: '🧱' });
                else if (maxKills >= 9) badges.push({ title: '통제 불능', desc: `최대 킬 ${maxKills}`, color: 'text-indigo-600 dark:text-indigo-100', bg: 'bg-indigo-600/20', border: 'border-indigo-400', glowColor: 'shadow-indigo-500', icon: '🌪️' });
                else if (maxKills >= 7) badges.push({ title: '전장 지배자', desc: `최대 킬 ${maxKills}`, color: 'text-blue-600 dark:text-blue-100', bg: 'bg-blue-600/20', border: 'border-blue-400', glowColor: 'shadow-blue-500', icon: '👑' });
                else if (maxKills >= 4) badges.push({ title: '스쿼드 브레이커', desc: `최대 킬 ${maxKills}`, color: 'text-green-600 dark:text-green-100', bg: 'bg-green-600/20', border: 'border-green-400', glowColor: 'shadow-green-500', icon: '🔨' });
                else badges.push({ title: '첫 번째 타겟', desc: `최대 킬 ${maxKills}`, color: 'text-zinc-700 dark:text-zinc-200', bg: 'bg-gray-600/20', border: 'border-gray-400', glowColor: 'shadow-white/30', icon: '🎯' });

                return (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-300 dark:border-zinc-700/50">
                    {badges.map((b, i) => (
                      <motion.div 
                        key={i}
                        title={b.desc}
                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${b.border} ${b.bg} ${b.color} font-bold text-xs backdrop-blur-md shadow-[0_0_15px_var(--tw-shadow-color),inset_0_1px_2px_rgba(255,255,255,0.4)] ${b.glowColor} cursor-help hover:scale-110 hover:shadow-[0_0_25px_var(--tw-shadow-color),inset_0_2px_4px_rgba(255,255,255,0.6)] transition-all`}
                      >
                        <span className="drop-shadow-lg">{b.icon}</span>
                        <span className="drop-shadow-md">{b.title}</span>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Recent Averages */}
            {stats?.recentMatches && stats.recentMatches.length > 0 && (
              <div className="flex gap-6 pr-4 relative z-10 border-l border-gray-300 dark:border-zinc-700/50 pl-6 hidden md:flex">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">최근 {stats.recentMatches.length}게임 평균 딜량</div>
                  <div className="font-teko text-3xl font-bold text-pubg-yellow">
                    {Math.round(stats.recentMatches.reduce((a, b) => a + b.stats.damageDealt, 0) / stats.recentMatches.length)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">평균 킬</div>
                  <div className="font-teko text-3xl font-bold text-pubg-cyan">
                    {(stats.recentMatches.reduce((a, b) => a + b.stats.kills, 0) / stats.recentMatches.length).toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">평균 등수</div>
                  <div className="font-teko text-3xl font-bold text-zinc-900 dark:text-white">
                    #{(stats.recentMatches.reduce((a, b) => a + b.stats.winPlace, 0) / stats.recentMatches.length).toFixed(1)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3x2 Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {renderModeCard('경쟁전', stats?.modes?.rankedSquad, <Shield className="w-4 h-4" />, 'bg-slate-600', 'border-slate-500/50', 'shadow-[0_0_15px_rgba(100,116,139,0.15)] hover:shadow-[0_0_25px_rgba(100,116,139,0.3)]')}
            {renderModeCard('경쟁전 솔로', null, <User className="w-4 h-4" />, 'bg-slate-600')}
            {renderModeCard('경쟁전 듀오', null, <Users className="w-4 h-4" />, 'bg-slate-600')}
            
            {renderModeCard('솔로', stats?.modes?.normalSolo, <User className="w-4 h-4" />, 'bg-[#e67e22]', 'border-[#e67e22]/50', 'shadow-[0_0_15px_rgba(230,126,34,0.15)] hover:shadow-[0_0_25px_rgba(230,126,34,0.3)]')}
            {renderModeCard('듀오', stats?.modes?.normalDuo, <Users className="w-4 h-4" />, 'bg-[#16a085]', 'border-[#16a085]/50', 'shadow-[0_0_15px_rgba(22,160,133,0.15)] hover:shadow-[0_0_25px_rgba(22,160,133,0.3)]')}
            {renderModeCard('스쿼드', stats?.modes?.normalSquad, <Users className="w-4 h-4" />, 'bg-[#8e44ad]', 'border-[#8e44ad]/50', 'shadow-[0_0_15px_rgba(142,68,173,0.15)] hover:shadow-[0_0_25px_rgba(142,68,173,0.3)]')}
          </div>

          {/* Recent Matches List */}
          {stats?.recentMatches && stats.recentMatches.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl mt-4">
              <h4 className="font-teko text-2xl uppercase text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-pubg-cyan" /> 최근 전적
              </h4>
              <div className="space-y-4">
                {stats.recentMatches.map((match) => (
                  <div key={match.id} className="flex flex-col gap-2">
                    <div 
                      onClick={() => setExpandedMatchId(expandedMatchId === match.id ? null : match.id)}
                      className={`p-4 rounded-xl flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-2 transition-all duration-300 transform shadow-lg cursor-pointer
                        ${expandedMatchId !== match.id ? 'hover:-translate-y-1' : ''}
                        ${match.stats.winPlace === 1 
                          ? 'border-pubg-yellow shadow-[0_0_15px_rgba(242,169,0,0.15)] hover:shadow-[0_0_25px_rgba(242,169,0,0.4)]' 
                          : match.stats.winPlace <= 10 
                            ? 'border-pubg-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]' 
                            : 'border-gray-300 dark:border-zinc-700/50 hover:border-zinc-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        }`}
                      style={{ boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.03)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-xl font-teko text-3xl font-bold border ${match.stats.winPlace === 1 ? 'bg-pubg-yellow text-zinc-900 border-yellow-300 shadow-[0_0_15px_rgba(242,169,0,0.6)]' : match.stats.winPlace <= 10 ? 'bg-gray-100 dark:bg-zinc-800 text-pubg-cyan border-pubg-cyan/50 shadow-[inset_0_0_10px_rgba(0,240,255,0.2)]' : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-gray-300 dark:border-zinc-700 shadow-inner'}`}>
                          #{match.stats.winPlace}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{match.stats.winPlace === 1 ? 'Winner Winner Chicken Dinner!' : `Top ${Math.ceil(match.stats.winPlace/10)*10}`}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                            <span className="bg-gray-200 dark:bg-zinc-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{match.gameMode}</span>
                            <span>{match.mapName}</span>
                            <span className="opacity-50">•</span>
                            <span>{new Date(match.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 md:gap-8 text-right items-center">
                        <div className="hidden sm:block">
                          <div className="text-xs text-gray-500 mb-1">킬</div>
                          <div className={`font-teko text-2xl font-bold ${match.stats.kills >= 5 ? 'text-pubg-cyan drop-shadow-md' : 'text-zinc-900 dark:text-white'}`}>{match.stats.kills}</div>
                        </div>
                        <div className="w-16 md:w-24">
                          <div className="text-xs text-gray-500 mb-1">데미지</div>
                          <div className={`font-teko text-2xl font-bold ${match.stats.damageDealt >= 500 ? 'text-pubg-red drop-shadow-md' : 'text-zinc-900 dark:text-white'}`}>{Math.round(match.stats.damageDealt)}</div>
                        </div>
                        <div className="text-gray-400 pl-2 border-l border-gray-300 dark:border-zinc-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-300 ${expandedMatchId === match.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED LEADERBOARD */}
                    <AnimatePresence>
                      {expandedMatchId === match.id && match.teams && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-inner"
                        >
                          <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs sticky top-0 z-10 shadow-sm">
                                <tr>
                                  <th className="py-3 px-4 rounded-tl-lg">순위</th>
                                  <th className="py-3 px-4">팀원 (닉네임)</th>
                                  <th className="py-3 px-4 text-center">총 킬</th>
                                  <th className="py-3 px-4 text-center rounded-tr-lg">총 데미지</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                                {match.teams.map((team, idx) => {
                                  const isMyTeam = team.players.some(p => p.name === playerName);
                                  return (
                                    <tr key={idx} className={`transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700/30 ${isMyTeam ? 'bg-pubg-yellow/10 dark:bg-pubg-yellow/20' : ''}`}>
                                      <td className="py-3 px-4">
                                        <span className={`font-teko text-xl font-bold ${team.rank === 1 ? 'text-pubg-yellow drop-shadow-sm' : isMyTeam ? 'text-pubg-cyan' : 'text-gray-600 dark:text-gray-400'}`}>
                                          #{team.rank}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex flex-col gap-1">
                                          {team.players.map((p, pIdx) => (
                                            <div key={pIdx} className="flex items-center justify-between">
                                              <span className={`${p.name === playerName ? 'font-bold text-pubg-cyan' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {p.name}
                                              </span>
                                              <span className="text-xs text-gray-500 hidden sm:inline ml-2">
                                                (킬: {p.kills} | 딜: {Math.round(p.damageDealt)})
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">{team.totalKills}</td>
                                      <td className="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">{Math.round(team.totalDamage)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </motion.div>
  );
}
