import { motion } from 'framer-motion';
import { UserPlus, MessageSquare, Crosshair, Shield, Target, Map } from 'lucide-react';

const MEMBERS = [
  {
    id: 1,
    nickname: 'Ghost_Rider',
    tier: 'Master',
    position: 'Main Sniper',
    kd: 4.25,
    avgDmg: 450,
    favMap: 'Erangel',
    intro: '저격총 잘 쏘시는 분 구합니다. 브리핑 확실하게 합니다. 즐겜 환영!',
    avatarColor: 'bg-gray-200 dark:bg-zinc-700'
  },
  {
    id: 2,
    nickname: 'AssaultKing',
    tier: 'Diamond',
    position: 'Entry Fragger',
    kd: 3.15,
    avgDmg: 380,
    favMap: 'Miramar',
    intro: '교전 지향형 엔트리입니다. 먼저 뚫어드립니다. 텐션 높으신 분!',
    avatarColor: 'bg-gray-50 dark:bg-pubg-dark'
  },
  {
    id: 3,
    nickname: 'Tactical_IGL',
    tier: 'Platinum',
    position: 'In-Game Leader',
    kd: 2.80,
    avgDmg: 290,
    favMap: 'Taego',
    intro: '오더 깔끔하게 내립니다. 자기장 운영 위주로 확실하게 치킨 먹으실 분.',
    avatarColor: 'bg-gray-100 dark:bg-zinc-800'
  },
  {
    id: 4,
    nickname: 'HealBot99',
    tier: 'Gold',
    position: 'Support',
    kd: 1.50,
    avgDmg: 180,
    favMap: 'Sanhok',
    intro: '백업 및 부활 기가 막히게 합니다. 구급상자 항상 5개 이상 소지 중!',
    avatarColor: 'bg-white dark:bg-zinc-900'
  },
  {
    id: 5,
    nickname: 'VehicleMaster',
    tier: 'Diamond',
    position: 'Driver / Flex',
    kd: 2.95,
    avgDmg: 310,
    favMap: 'Rondo',
    intro: '운전병 출신입니다. 차 절대 안 뒤집힙니다. 드라이브바이 쌉가능.',
    avatarColor: 'bg-gray-200 dark:bg-zinc-700'
  },
  {
    id: 6,
    nickname: 'LoneWolf_KR',
    tier: 'Master',
    position: 'Lurker',
    kd: 4.80,
    avgDmg: 520,
    favMap: 'Erangel',
    intro: '혼자서 각 벌리고 찌르는 플레이 선호합니다. 센스 있으신 분들 구함.',
    avatarColor: 'bg-gray-100 dark:bg-zinc-800'
  }
];

// Helper for position icon
const getPositionIcon = (position: string) => {
  if (position.includes('Sniper')) return <Target className="w-4 h-4 text-pubg-red" />;
  if (position.includes('Entry') || position.includes('Fragger')) return <Crosshair className="w-4 h-4 text-pubg-yellow" />;
  if (position.includes('Support') || position.includes('Flex')) return <Shield className="w-4 h-4 text-pubg-cyan" />;
  return <Map className="w-4 h-4 text-zinc-900 dark:text-white" />;
};

export default function MemberView() {
  return (
    <motion.div
      key="members"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col p-8 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-teko text-4xl font-semibold uppercase text-gray-800 dark:text-gray-200 tracking-wide">Community Members</h2>
          <p className="text-pubg-cyan font-semibold tracking-widest uppercase">Find players matching your style</p>
        </div>
        <div className="flex gap-4">
          <select className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm rounded-lg focus:ring-pubg-cyan focus:border-pubg-cyan block p-2.5">
            <option>All Positions</option>
            <option>Sniper</option>
            <option>Entry Fragger</option>
            <option>Support</option>
            <option>IGL</option>
          </select>
          <select className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm rounded-lg focus:ring-pubg-cyan focus:border-pubg-cyan block p-2.5">
            <option>All Maps</option>
            <option>Erangel</option>
            <option>Miramar</option>
            <option>Taego</option>
            <option>Rondo</option>
          </select>
        </div>
      </div>

      {/* Grid of Player Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {MEMBERS.map((member) => (
          <motion.div 
            key={member.id}
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,240,255,0.2)' }}
            className="glass-panel rounded-2xl flex flex-col overflow-hidden border border-gray-300 dark:border-zinc-800/80 hover:border-pubg-cyan/50 transition-all duration-300"
          >
            {/* Header / Avatar */}
            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full border-2 border-pubg-yellow p-0.5 ${member.avatarColor}`}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.nickname}`} alt="Avatar" className="w-full h-full object-cover rounded-full bg-gray-100 dark:bg-zinc-800" />
                </div>
                <div>
                  <h3 className="font-teko text-2xl font-bold uppercase tracking-wider text-zinc-900 dark:text-white leading-tight">
                    {member.nickname}
                  </h3>
                  <div className="text-xs font-semibold text-pubg-yellow uppercase tracking-widest">
                    {member.tier}
                  </div>
                </div>
              </div>
            </div>

            {/* Position Badge */}
            <div className="px-6 mt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-gray-300 dark:border-zinc-700 shadow-inner">
                {getPositionIcon(member.position)}
                <span className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200">{member.position}</span>
              </div>
            </div>

            {/* Key Stats Row */}
            <div className="px-6 py-5 flex justify-between border-b border-gray-200 dark:border-zinc-800/50 mt-2">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">K/D Ratio</div>
                <div className={`font-teko text-2xl font-bold ${member.kd >= 3.0 ? 'text-pubg-cyan' : 'text-zinc-900 dark:text-white'}`}>{member.kd.toFixed(2)}</div>
              </div>
              <div className="w-px bg-zinc-800/80 mx-2"></div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Avg Dmg</div>
                <div className={`font-teko text-2xl font-bold ${member.avgDmg >= 350 ? 'text-pubg-cyan' : 'text-zinc-900 dark:text-white'}`}>{member.avgDmg}</div>
              </div>
              <div className="w-px bg-zinc-800/80 mx-2"></div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Fav Map</div>
                <div className="font-teko text-2xl font-bold text-gray-700 dark:text-gray-300">{member.favMap}</div>
              </div>
            </div>

            {/* Intro text */}
            <div className="px-6 py-4 flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-3 leading-relaxed">
                "{member.intro}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex bg-white/50 dark:bg-zinc-900/50">
              <button className="flex-1 py-3 flex justify-center items-center gap-2 hover:bg-gray-100 dark:bg-zinc-800 transition text-gray-700 dark:text-gray-300 hover:text-zinc-900 dark:text-white border-r border-gray-200 dark:border-zinc-800/50">
                <MessageSquare className="w-4 h-4" />
                <span className="font-teko uppercase font-bold text-lg">Message</span>
              </button>
              <button className="flex-1 py-3 flex justify-center items-center gap-2 hover:bg-pubg-cyan/10 transition text-pubg-cyan hover:text-cyan-300">
                <UserPlus className="w-4 h-4" />
                <span className="font-teko uppercase font-bold text-lg">Add Friend</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
