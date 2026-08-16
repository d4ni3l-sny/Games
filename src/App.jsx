import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_GAMES } from './data/defaultGames';
import { Navbar } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { GamePlayer } from './components/GamePlayer';
import { AddGameModal } from './components/AddGameModal';
import { JsonEditorModal } from './components/JsonEditorModal';
import { PanicOverlay } from './components/PanicOverlay';
import { 
  Gamepad2, 
  Sparkles, 
  Flame, 
  Heart, 
  Search, 
  FileCode, 
  PlusCircle
} from 'lucide-react';

const STORAGE_GAMES_KEY = 'unblocked_games_db_v1';
const STORAGE_FAVS_KEY = 'unblocked_games_favs_v1';

export default function App() {
  const [games, setGames] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GAMES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not load saved games from localStorage', e);
    }
    return DEFAULT_GAMES;
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load favorites', e);
    }
    return ['space-invaders', 'snake-retro', 'falling-blocks-2048'];
  });

  const [activeGame, setActiveGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isPanicMode, setIsPanicMode] = useState(false);

  // Sync games to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(games));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [games]);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVS_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [favorites]);

  // Global hotkeys (ESC toggles cloak/panic mode)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isAddModalOpen && !isJsonModalOpen) {
        setIsPanicMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isJsonModalOpen]);

  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePlayGame = (game) => {
    // Increment plays count
    setGames(prev =>
      prev.map(g => (g.id === game.id ? { ...g, plays: g.plays + 1 } : g))
    );
    setActiveGame({ ...game, plays: game.plays + 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomGame = () => {
    if (games.length === 0) return;
    const rand = games[Math.floor(Math.random() * games.length)];
    handlePlayGame(rand);
  };

  const handleAddGame = (newGame) => {
    setGames(prev => [newGame, ...prev]);
    setActiveGame(newGame);
  };

  const handleSaveJson = (updatedGames) => {
    setGames(updatedGames);
    if (activeGame) {
      const updatedActive = updatedGames.find(g => g.id === activeGame.id);
      if (updatedActive) setActiveGame(updatedActive);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset games to standard default collection? Any custom added games will be cleared.')) {
      setGames(DEFAULT_GAMES);
      localStorage.removeItem(STORAGE_GAMES_KEY);
      setIsJsonModalOpen(false);
    }
  };

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Category filter
      if (selectedCategory !== 'All' && game.category !== selectedCategory) {
        return false;
      }
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(game.id)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesDesc = game.description.toLowerCase().includes(q);
        const matchesTags = game.tags.some(t => t.toLowerCase().includes(q));
        const matchesCategory = game.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [games, selectedCategory, showFavoritesOnly, favorites, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Panic / Cloak Disguise Screen */}
      <PanicOverlay
        isOpen={isPanicMode}
        onClose={() => setIsPanicMode(false)}
      />

      {/* Navbar Header */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (activeGame) setActiveGame(null);
        }}
        favoritesCount={favorites.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => {
          setShowFavoritesOnly(prev => !prev);
          if (activeGame) setActiveGame(null);
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onRandomGame={handleRandomGame}
        onTogglePanic={() => setIsPanicMode(true)}
        activeGameId={activeGame ? activeGame.id : null}
        onBackToHome={() => setActiveGame(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeGame ? (
          /* Active Game Player View */
          <GamePlayer
            game={activeGame}
            isFavorite={favorites.includes(activeGame.id)}
            onToggleFavorite={(id) => toggleFavorite(id)}
            onBack={() => setActiveGame(null)}
            onSelectRelatedGame={handlePlayGame}
            allGames={games}
          />
        ) : (
          /* Arcade Catalog Grid View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Top Banner / Hero when no search & 'All' category */}
            {!searchQuery && selectedCategory === 'All' && !showFavoritesOnly && (
              <div className="mb-8 relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5" /> 100% JSON-Driven Unblocked Games
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                    Fast, Lightweight, Iframe Web Games
                  </h1>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Play instantly in responsive sandboxed iframes. Add custom embed links, edit the <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">games.json</code> database, or jump straight into retro arcade classics.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      id="hero-random-btn"
                      onClick={handleRandomGame}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      <Gamepad2 className="w-4 h-4" /> Quick Play Random Game
                    </button>
                    <button
                      id="hero-add-btn"
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-400" /> Add Custom Game
                    </button>
                    <button
                      id="hero-json-btn"
                      onClick={() => setIsJsonModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
                    >
                      <FileCode className="w-4 h-4 text-indigo-400" /> View JSON Database
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog Section Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  {showFavoritesOnly ? (
                    <>
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      <span>Your Favorite Games</span>
                    </>
                  ) : searchQuery ? (
                    <>
                      <Search className="w-5 h-5 text-indigo-400" />
                      <span>Search Results for "{searchQuery}"</span>
                    </>
                  ) : selectedCategory !== 'All' ? (
                    <>
                      <span>{selectedCategory} Games</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5 text-amber-400" />
                      <span>All Arcade Games</span>
                    </>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredGames.length} of {games.length} games available
                </p>
              </div>

              {/* Reset filter button if filtered */}
              {(selectedCategory !== 'All' || searchQuery || showFavoritesOnly) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setShowFavoritesOnly(false);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Games Grid */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={toggleFavorite}
                    onPlay={handlePlayGame}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200 mb-1">No Games Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                  No games matched your current search or filter criteria. Try searching for something else or add your own custom game!
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setShowFavoritesOnly(false);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
                  >
                    View All Games
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition-colors"
                  >
                    Add Custom Game
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">Unblocked Games Portal</span>
            <span>•</span>
            <span>Stored in JSON</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              Export JSON Database
            </button>
            <button
              onClick={() => setIsPanicMode(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Disguise Mode (Esc)
            </button>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 transition-colors"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>

      {/* Add Custom Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />

      {/* JSON Editor & Database Manager Modal */}
      <JsonEditorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        games={games}
        onSaveJson={handleSaveJson}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
