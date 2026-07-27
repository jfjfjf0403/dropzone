import { motion } from 'framer-motion';
import { Navigation, Filter, UserPlus } from 'lucide-react';

const SQUADS = [
  {
    id: 1,
    leader: 'Ghost_Rider',
    tier: 'Master',
    kd: 4.25,
    tags: ['Assault', 'Erangel', 'Mic On'],
    message: '"저격총 잘 쏘시는 분 구합니다. 브리핑 확실하게 합니다."',
    slots: '3/4'
  },
  {
    id: 2,
    leader: 'CamperNo1',
    tier: 'Diamond',
    kd: 2.15,
    tags: ['Survival', 'Sanhok', 'Casual'],
    message: '"즐겜유저 모십니다. 티어 상관없이 텐션 좋으신 분!"',
    slots: '2/4'
  },
  {
    id: 3,
    leader: 'Pro_Driver',
    tier: 'Platinum',
    kd: 3.10,
    tags: ['Vehicle', 'Miramar', 'Ranked'],
    message: '"차량 운영 위주로 빡겜하실 분 2명 구함."',
    slots: '2/4'
  }
];

export default function SquadView() {
  return (
    <motion.div
      key="squad"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col p-8 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-teko text-4xl font-semibold uppercase text-gray-800 dark:text-gray-200 tracking-wide">Squad Recruitment (LFG)</h2>
          <p className="text-pubg-cyan font-semibold tracking-widest uppercase">Find your perfect teammates</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-gray-200 dark:bg-zinc-700 transition">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-10">
        {SQUADS.map((squad) => (
          <motion.div 
            key={squad.id}
            className="glass-panel rounded-2xl overflow-hidden relative flex flex-col"
            whileHover={{ y: -4, borderColor: 'rgba(0,240,255,0.3)' }}
          >
            {/* Background Header */}
            <div className="h-32 w-full bg-gray-100 dark:bg-zinc-800 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-pubg-dark via-pubg-dark/80 to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800" 
                alt="Player" 
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute top-4 right-4 z-20 bg-pubg-yellow text-pubg-dark font-teko font-bold px-3 py-1 rounded shadow-[0_0_10px_rgba(255,184,0,0.5)]">
                {squad.tier}
              </div>
            </div>

            <div className="p-6 relative z-20 -mt-10 flex-1 flex flex-col">
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-zinc-700 border-2 border-pubg-dark overflow-hidden shadow-lg">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${squad.leader}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-teko text-3xl font-bold uppercase leading-none drop-shadow-lg text-zinc-900 dark:text-white">
                      {squad.leader}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">K/D</span>
                  <div className="font-teko text-3xl text-pubg-cyan font-bold">{squad.kd.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {squad.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="bg-white/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-800/50 mb-6 flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">{squad.message}</p>
              </div>

              <div className="flex gap-4 items-center mt-auto">
                <div className="font-teko text-xl font-bold text-gray-600 dark:text-gray-400 w-16 text-center bg-gray-100 dark:bg-zinc-800 py-2 rounded-lg">
                  {squad.slots}
                </div>
                <button className="flex-1 py-3 rounded-lg bg-pubg-cyan text-pubg-dark font-teko text-xl font-bold uppercase shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" /> Request Join
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
