import React, { useState, useRef, useEffect } from 'react';
import { Map, ZoomIn, ZoomOut, RotateCcw, MapPin, Trash2, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const MAPS = [
  { id: 'erangel', name: 'Erangel', size: '8x8 km', desc: 'The original battleground (Version 1).', image: '/maps/erangel.jpg' },
  { id: 'erangel_name', name: 'Erangel Name', size: '8x8 km', desc: 'Erangel with detailed Korean callouts.', image: '/maps/erangel_name.jpg' },
  { id: 'miramar', name: 'Miramar', size: '8x8 km', desc: 'A vast desert map (Version 1).', image: '/maps/miramar.jpg' },
  { id: 'miramar_name', name: 'Miramar Name', size: '8x8 km', desc: 'Miramar with detailed Korean callouts.', image: '/maps/miramar_name.jpg' },
  { id: 'taego', name: 'Taego', size: '8x8 km', desc: '1980s South Korea. Features comeback arenas.', image: '/maps/taego.jpg' },
  { id: 'rondo', name: 'Rondo', size: '8x8 km', desc: 'Modern city meets traditional landscapes.', image: '/maps/rondo.jpg' },
  { id: 'deston', name: 'Deston', size: '8x8 km', desc: 'A ruined near-future city featuring swamp and downtown.', image: '/maps/deston.jpg' },
  { id: 'vikendi', name: 'Vikendi', size: '8x8 km', desc: 'A harsh, snow-covered landscape with cable cars and blizzards.', image: '/maps/vikendi.jpg' },
];

const PING_COLORS = [
  { id: 'red', hex: '#FF3B30', name: 'Enemy Route' },
  { id: 'yellow', hex: '#FFCC00', name: 'Loot / Move' },
  { id: 'green', hex: '#34C759', name: 'Safe Path' },
  { id: 'blue', hex: '#00F0FF', name: 'Flank' } // Made blue more cyan/neon
];

interface Point {
  x: number;
  y: number;
}

interface Route {
  id: string;
  color: string;
  points: Point[];
}

export default function MapView() {
  const [selectedMap, setSelectedMap] = useState(MAPS[0]);
  const [scale, setScale] = useState(0.45);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState(PING_COLORS[0].hex);
  
  // 라우트 상태 관리
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);

  const [imageError, setImageError] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startDrag = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Preload all map images in the background
  useEffect(() => {
    MAPS.forEach(map => {
      const img = new Image();
      img.src = map.image;
    });
  }, []);

  // Zoom Controls
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.2));
  const handleReset = () => {
    setScale(0.45);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    isDragging.current = true;
    hasMoved.current = false;
    startDrag.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    
    const newX = e.clientX - startDrag.current.x;
    const newY = e.clientY - startDrag.current.y;
    
    if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
      hasMoved.current = true;
    }

    if (hasMoved.current) {
      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDragging.current = false;
  };

  // 선 긋기 로직
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }

    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (x >= 0 && x <= 2048 && y >= 0 && y <= 2048) {
      if (!activeRoute) {
        setActiveRoute({ id: Date.now().toString(), color: selectedColor, points: [{x, y}] });
      } else {
        if (activeRoute.color !== selectedColor) {
          setRoutes(prev => [...prev, activeRoute]);
          setActiveRoute({ id: Date.now().toString(), color: selectedColor, points: [{x, y}] });
        } else {
          setActiveRoute(prev => prev ? { ...prev, points: [...prev.points, {x, y}] } : null);
        }
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 우클릭 메뉴 방지
    finishRoute();
  };

  const finishRoute = () => {
    if (activeRoute) {
      setRoutes(prev => [...prev, activeRoute]);
      setActiveRoute(null);
    }
  };

  const clearAllRoutes = () => {
    setRoutes([]);
    setActiveRoute(null);
  };

  const renderRoute = (route: Route, isActive: boolean) => {
    const pointString = route.points.map(p => `${p.x},${p.y}`).join(' ');
    return (
      <g key={route.id}>
        {/* Glow Path */}
        {route.points.length > 1 && (
          <polyline 
            points={pointString} 
            fill="none" 
            stroke={route.color} 
            strokeWidth={isActive ? "10" : "8"} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#glow)"
            opacity={isActive ? 0.9 : 0.7}
          />
        )}
        {/* Core Path */}
        {route.points.length > 1 && (
          <polyline 
            points={pointString} 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth={isActive ? "4" : "3"} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            opacity={isActive ? 1 : 0.8}
          />
        )}
        {/* Points/Dots */}
        {route.points.map((p, i) => (
          <circle 
            key={`${route.id}-${i}`} 
            cx={p.x} 
            cy={p.y} 
            r={isActive && i === route.points.length - 1 ? "10" : "6"} 
            fill="#ffffff" 
            stroke={route.color} 
            strokeWidth="4" 
            filter="url(#glow)"
          />
        ))}
      </g>
    );
  };

  return (
    <motion.div
      key="maps"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex p-6 gap-6 overflow-hidden"
    >
      {/* Map Panel (Left side now) */}
      <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex flex-col">
        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 flex gap-2 glass-panel p-2 rounded-xl shadow-lg">
          <button onClick={handleZoomOut} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:bg-zinc-700 text-zinc-900 dark:text-white transition"><ZoomOut className="w-5 h-5" /></button>
          <div className="w-16 flex items-center justify-center font-teko text-xl font-bold select-none">{Math.round(scale * 100)}%</div>
          <button onClick={handleZoomIn} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:bg-zinc-700 text-zinc-900 dark:text-white transition"><ZoomIn className="w-5 h-5" /></button>
          <div className="w-px bg-gray-200 dark:bg-zinc-700 mx-1"></div>
          <button onClick={handleReset} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:bg-zinc-700 text-zinc-900 dark:text-white transition"><RotateCcw className="w-5 h-5" /></button>
        </div>

        {/* Map Container */}
        <div 
          className="flex-1 w-full h-full bg-zinc-950 relative overflow-hidden"
          onWheel={handleWheel}
        >
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={handleContextMenu}
          >
            <div 
              className="relative transition-transform duration-75 origin-center"
              style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
            >
              <div 
                ref={mapRef} 
                onClick={handleMapClick}
                className="w-[2048px] h-[2048px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden shadow-2xl origin-center"
              >
                
                {!imageError ? (
                  <img 
                    key={selectedMap.id}
                    src={selectedMap.image} 
                    alt={selectedMap.name} 
                    className="w-full h-full object-contain pointer-events-none select-none"
                    style={{ imageRendering: 'auto' }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
                    </div>
                    <div className="text-zinc-700 font-teko text-4xl uppercase tracking-widest pointer-events-none select-none text-center">
                      <div className="text-6xl mb-2">{selectedMap.name}</div>
                      <div className="text-sm font-sans tracking-normal opacity-70">
                        {`public/maps/${selectedMap.id}.jpg`} 경로에<br/>이미지를 추가해주세요.
                      </div>
                    </div>
                  </>
                )}

                {/* SVG Overlay for drawing Neon Routes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {routes.map(r => renderRoute(r, false))}
                  {activeRoute && renderRoute(activeRoute, true)}
                </svg>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Panel (Right side now) */}
      <div className="w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto no-scrollbar pb-6">
        <div className="glass-panel p-6 rounded-2xl shrink-0">
          <h2 className="font-teko text-4xl font-semibold uppercase text-gray-800 dark:text-gray-200 tracking-wide flex items-center gap-2 mb-6">
            <Map className="w-8 h-8 text-pubg-cyan" /> Map Intel
          </h2>
          
          <div className="grid grid-cols-2 gap-2 mb-6">
            {MAPS.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMap(m);
                  setImageError(false);
                  clearAllRoutes();
                  setScale(0.45);
                  setPosition({ x: 0, y: 0 });
                }}
                className={`w-full text-center px-2 py-2 rounded-lg font-teko text-lg tracking-wide uppercase transition ${selectedMap.id === m.id ? 'bg-pubg-cyan text-pubg-dark font-bold' : 'bg-gray-100/50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-zinc-800 hover:text-zinc-900 dark:text-white'}`}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div className="bg-gray-100 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="text-xs text-pubg-yellow uppercase font-bold tracking-widest mb-1">Selected Map</div>
            <div className="font-teko text-3xl font-bold uppercase text-zinc-900 dark:text-white mb-2">{selectedMap.name}</div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Size: {selectedMap.size}</div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {selectedMap.desc}
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col shrink-0">
          <h3 className="font-teko text-2xl font-semibold uppercase text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pubg-cyan" /> Tactical Routing
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            Click points on the map to draw paths.<br/>
            <span className="text-pubg-yellow">Left-click</span> on map to finish current route.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PING_COLORS.map(color => (
              <button
                key={color.id}
                onClick={() => {
                  if (activeRoute) finishRoute();
                  setSelectedColor(color.hex);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border-2 transition ${selectedColor === color.hex ? 'border-white bg-gray-100 dark:bg-zinc-800' : 'border-transparent bg-white/50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:bg-zinc-800'}`}
              >
                <div className="w-4 h-4 rounded-full shadow-inner shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: color.hex }}></div>
                <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300">{color.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button 
              onClick={finishRoute} 
              disabled={!activeRoute}
              className="w-full py-2.5 rounded-lg border border-teal-600 dark:border-pubg-cyan text-teal-700 dark:text-pubg-cyan font-teko text-lg uppercase font-bold hover:bg-teal-600 dark:hover:bg-pubg-cyan hover:text-white dark:hover:text-pubg-dark transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-teal-700 dark:disabled:hover:text-pubg-cyan flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-4 h-4" /> Finish Route
            </button>
            <button 
              onClick={clearAllRoutes} 
              className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-zinc-800/80 hover:bg-pubg-red/20 text-gray-700 dark:text-gray-400 hover:text-pubg-red font-teko text-lg uppercase font-bold transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
