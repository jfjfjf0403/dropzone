import React, { useEffect, useState } from 'react';
import { Crosshair, Plus, Video, User, Swords, Search, Bell, LogOut, Settings, Users, Map, Trophy, Newspaper, BadgeCheck, Menu, Sun, Moon, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from './components/MapView';
import FeedView from './components/FeedView';
import MainSearchView from './components/MainSearchView';
import ProfileView from './components/ProfileView';
import ProSettingsView from './components/ProSettingsView';
import MemberView from './components/MemberView';
import NewsView from './components/NewsView';
import AddModal from './components/AddModal';
import { getPlayerAccountId, getPlayerStats, type PlayerData } from './services/pubgApi';
import { INITIAL_POSTS, type Post } from './data/posts';

const JellyfishIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Bubbles */}
    <circle cx="3" cy="5" r="1.5" />
    <circle cx="5" cy="2" r="1" />
    
    {/* Fat Marshmallow Head (Bigger!) */}
    <rect x="3.5" y="5" width="18" height="11" rx="5.5" fill="currentColor" fillOpacity="0.1" />
    
    {/* Frilly Skirt */}
    <path d="M 4.5 15.5 Q 8.5 19 12.5 15.5 Q 16.5 19 20.5 15.5" />
    
    {/* Limp Tentacles */}
    <path d="M 8.5 17 Q 7.5 20 8 23" />
    <path d="M 12.5 17 Q 11.5 20 12 23" />
    <path d="M 16.5 17 Q 17.5 20 17 23" />

    {/* Derpy Face */}
    <circle cx="9.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
    <line x1="11.5" y1="12" x2="13.5" y2="12" strokeWidth="1.5" />
  </svg>
);

function App() {
  const [activeTab, setActiveTab] = React.useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<PlayerData | null>(null);
  const [currentUserTier, setCurrentUserTier] = useState<string>('Loading...');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('dropzone_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dropzone_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const removeFavorite = (name: string) => {
    setFavorites(prev => prev.filter(f => f !== name));
  };
  
  // Lifted state for feed posts with API persistence
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Merge API posts with dummy posts
          setFeedPosts([...data, ...INITIAL_POSTS]);
        } else {
          // Fallback if DB is empty
          setFeedPosts(INITIAL_POSTS);
        }
      })
      .catch(err => {
        console.error('Failed to fetch posts from local API', err);
        setFeedPosts(INITIAL_POSTS);
      });
  }, []);

  const executeSearch = async (queryName: string) => {
    try {
      const userData = await getPlayerAccountId(queryName, true);
      if (userData) {
        setCurrentUser(userData);
        setActiveTab('profile');
        setSearchQuery(''); // clear header search
        
        setCurrentUserTier('Loading...');
        const stats = await getPlayerStats(userData.accountId, false, true);
        setCurrentUserTier(stats && stats.tier !== 'Unranked' ? `${stats.tier}` : 'Unranked');
      }
    } catch (err) {
      alert('플레이어를 찾을 수 없거나 에러가 발생했습니다. (닉네임 대소문자를 정확히 입력하세요)');
    }
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      executeSearch(searchQuery.trim());
    }
  };

  useEffect(() => {
    // 런칭 시 실제 유저 JELLFI-_- 의 데이터를 API를 통해 가져옵니다.
    async function loadUser() {
      const userData = await getPlayerAccountId('JELLFI-_-');
      setCurrentUser(userData);
      if (userData?.accountId) {
        const stats = await getPlayerStats(userData.accountId);
        setCurrentUserTier(stats && stats.tier !== 'Unranked' ? `${stats.tier}` : 'Unranked');
      }
    }
    loadUser();
  }, []);
  
  return (
    <div className="h-screen w-full flex overflow-hidden antialiased select-none font-sans transition-colors duration-300">
      
      {/* Left Sidebar Navigation (PC Layout) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.nav 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full glass-panel border-r border-gray-200 dark:border-zinc-800 flex flex-col z-20 shrink-0 overflow-hidden whitespace-nowrap"
          >
            <div 
          onClick={() => window.location.reload()}
          className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-zinc-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/30 transition-colors"
        >
          <div className="w-10 h-10 rounded bg-pubg-yellow flex items-center justify-center font-teko font-bold text-pubg-dark text-2xl neon-border-yellow">
            DZ
          </div>
          <h1 className="font-teko text-3xl tracking-wider uppercase neon-text-cyan mt-1">DropZone</h1>
        </div>

        <div className="flex-1 py-6 px-4 flex flex-col gap-2">
          <NavItem icon={<Search />} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<Swords />} label="Feed" isActive={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
          <NavItem icon={<Users />} label="Members" isActive={activeTab === 'members'} onClick={() => setActiveTab('members')} />
          <NavItem icon={<Map />} label="Maps" isActive={activeTab === 'maps'} onClick={() => setActiveTab('maps')} />
          <NavItem icon={<Crosshair />} label="Pro Sens" isActive={activeTab === 'prosens'} onClick={() => setActiveTab('prosens')} />
          <NavItem icon={<User />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavItem icon={<Newspaper />} label="News" isActive={activeTab === 'news'} onClick={() => setActiveTab('news')} />
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddModalOpen(true)}
            className="mt-6 w-full py-3 bg-pubg-yellow text-pubg-dark rounded-lg flex items-center justify-center gap-2 font-teko text-xl font-bold uppercase shadow-[0_0_15px_rgba(255,184,0,0.3)] hover:shadow-[0_0_20px_rgba(255,184,0,0.5)] transition"
          >
            <Plus className="w-5 h-5" strokeWidth={3} /> Create Post
          </motion.button>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800/50 flex flex-col">
          <div className="text-[11px] text-gray-500 font-medium text-center mb-3 tracking-wide uppercase flex items-center justify-center gap-1">
            Designed by <span className="text-pubg-cyan font-bold">Jellyfish Studio</span> <JellyfishIcon className="w-3.5 h-3.5 text-pubg-cyan" />
          </div>
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-teko text-lg leading-none truncate flex items-center gap-1">
                {currentUser ? currentUser.name : 'Loading...'}
                {currentUser?.name === 'JELLFI-_-' && (
                  <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-500/20 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                )}
              </div>
              <div className="text-xs text-pubg-cyan font-semibold truncate">{currentUserTier}</div>
            </div>
            <Settings className="w-4 h-4 text-gray-500 hover:text-white" />
          </div>
        </div>
      </motion.nav>
      )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 dark:border-zinc-800/50 flex items-center justify-between px-8 bg-white/80 dark:bg-pubg-dark/80 backdrop-blur-md z-10 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition">
              <Menu className="w-5 h-5" />
            </button>
            {/* Search Bar */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search PUBG Nickname and press Enter..." 
              className="w-full bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-full py-1.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-pubg-cyan focus:ring-1 focus:ring-pubg-cyan transition"
            />
          </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Server Status */}
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-zinc-900/50 px-4 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700/50 shadow-inner">
               <span className="font-teko text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm pt-0.5">Season 42</span>
               <div className="w-px h-3 bg-gray-300 dark:bg-zinc-700"></div>
               <div className="flex items-center gap-2">
                 <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                 </span>
                 <span className="font-teko text-lg text-gray-200 uppercase tracking-wider mt-1">Online</span>
               </div>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700/50 flex items-center px-1 cursor-pointer transition-colors hover:border-gray-400 dark:hover:border-zinc-500"
            >
              <motion.div 
                layout 
                className="w-5 h-5 rounded-full bg-white dark:bg-pubg-yellow shadow-md dark:shadow-[0_0_10px_rgba(250,192,0,0.5)] flex items-center justify-center z-10"
                animate={{ x: isDarkMode ? 26 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {isDarkMode ? <Moon className="w-3 h-3 text-zinc-900" /> : <Sun className="w-3 h-3 text-zinc-900" />}
              </motion.div>
              <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                <Sun className="w-3.5 h-3.5 text-zinc-500" />
                <Moon className="w-3.5 h-3.5 text-zinc-500" />
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#0A0A0B]">
          <AnimatePresence mode="wait">
            {activeTab === 'maps' && <MapView key="maps" />}
            {activeTab === 'prosens' && <ProSettingsView key="prosens" />}
            {activeTab === 'feed' && <FeedView key="feed" posts={feedPosts} setPosts={setFeedPosts} currentUserName={currentUser?.name || 'JELLFI-_-'} />}
            {activeTab === 'members' && <MemberView key="members" />}
            {activeTab === 'home' && <MainSearchView key="home" favorites={favorites} onSearch={executeSearch} onSelectProfile={executeSearch} onRemoveFavorite={removeFavorite} />}
            {activeTab === 'news' && <NewsView key="news" />}
            {activeTab === 'profile' && <ProfileView key="profile" accountId={currentUser?.accountId} playerName={currentUser?.name} favorites={favorites} toggleFavorite={toggleFavorite} />}
          </AnimatePresence>
        </div>

        {/* Add Content Modal */}
        <AddModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAddPost={(newPost) => {
            fetch('/api/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPost)
            })
            .then(async res => {
              if (res.status === 429) {
                const data = await res.json().catch(() => null);
                alert(data?.error || '글을 너무 빠르게 작성하고 있어요. 잠시 후 다시 시도해주세요.');
                return null;
              }
              return res.json();
            })
            .then(savedPost => {
              if (savedPost) {
                setFeedPosts(prev => [savedPost, ...prev]);
              }
            })
            .catch(err => {
              console.error('Failed to save post', err);
              // Fallback to local state if API fails
              setFeedPosts(prev => [newPost, ...prev]);
            });
          }}
        />
      </main>
    </div>
  );
}

// NavItem Component
function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded-xl transition relative group ${isActive ? 'text-white bg-zinc-800/50' : 'text-gray-500 hover:bg-zinc-800/30 hover:text-gray-300'}`}
    >
      {isActive && (
        <motion.div layoutId="sidebarIndicator" className="absolute left-0 w-1 h-8 bg-pubg-cyan rounded-r-md shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
      )}
      <div className={`${isActive ? 'text-pubg-cyan' : 'group-hover:text-pubg-cyan'} transition-colors`}>
        {icon}
      </div>
      <span className="font-teko text-xl tracking-wide uppercase mt-1">{label}</span>
    </button>
  );
}

export default App;
