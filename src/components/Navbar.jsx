import React from 'react';
import { 
  Gamepad2, 
  Search, 
  Heart, 
  PlusCircle, 
  FileCode, 
  Shuffle, 
  EyeOff, 
  Flame, 
  Grid, 
  Layers, 
  Rocket, 
  Activity, 
  Trophy, 
  Sparkles 
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: <Grid className="w-4 h-4" /> },
  { name: 'Arcade', icon: <Rocket className="w-4 h-4" /> },
  { name: 'Retro', icon: <Activity className="w-4 h-4" /> },
  { name: 'Puzzle', icon: <Layers className="w-4 h-4" /> },
  { name: 'Action', icon: <Flame className="w-4 h-4" /> },
  { name: 'Sports', icon: <Trophy className="w-4 h-4" /> },
  { name: 'Strategy', icon: <Gamepad2 className="w-4 h-4" /> },
  { name: 'Idle', icon: <Sparkles className="w-4 h-4" /> },
];

export const Navbar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  onOpenAddModal,
  onOpenJsonModal,
  onRandomGame,
  onTogglePanic,
  activeGameId,
  onBackToHome
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo / Home trigger */}
          <button
            id="brand-logo-btn"
            onClick={onBackToHome}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  UNBLOCKED
                </span>
                <span className="text-xs px-1.5 py-0.5 font-bold uppercase rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  Arcade
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">JSON-Powered Iframe Games</p>
            </div>
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-games-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search games, tags, controls..."
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm pl-10 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right utility actions */}
          <div className="flex items-center gap-2">
            {/* Random Game */}
            <button
              id="random-game-btn"
              onClick={onRandomGame}
              title="Play Random Game"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 rounded-lg transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Random</span>
            </button>

            {/* Favorites Toggle */}
            <button
              id="favorites-toggle-btn"
              onClick={onToggleFavoritesOnly}
              title="Saved Favorites"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                showFavoritesOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : 'text-rose-400'}`} />
              <span className="hidden md:inline">Favorites</span>
              {favoritesCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Add Custom Game */}
            <button
              id="add-game-btn"
              onClick={onOpenAddModal}
              title="Add Custom Iframe Game"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 rounded-lg transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Add Game</span>
            </button>

            {/* JSON Database Modal */}
            <button
              id="json-db-btn"
              onClick={onOpenJsonModal}
              title="View & Edit JSON Database"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 rounded-lg transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">games.json</span>
            </button>

            {/* Panic Button / Quick Cloak */}
            <button
              id="panic-cloak-btn"
              onClick={onTogglePanic}
              title="Quick Disguise Cloak (Panic Button)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 rounded-lg transition-colors shadow-sm"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Cloak (Esc)</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 sm:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-sm pl-10 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category Pills Bar (shown when not playing or scrollable) */}
        {!activeGameId && (
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-850">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  id={`cat-filter-${cat.name.toLowerCase()}`}
                  onClick={() => {
                    onSelectCategory(cat.name);
                    if (showFavoritesOnly) onToggleFavoritesOnly();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    active && !showFavoritesOnly
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
