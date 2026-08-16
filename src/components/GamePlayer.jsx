import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Maximize2, 
  RotateCw, 
  ExternalLink, 
  Heart, 
  Star, 
  Keyboard, 
  Info, 
  Share2, 
  Check, 
  Layers, 
  Sparkles, 
  Gamepad2 
} from 'lucide-react';

export const GamePlayer = ({
  game,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectRelatedGame,
  allGames
}) => {
  const [isTheater, setIsTheater] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const playerContainerRef = useRef(null);
  const iframeRef = useRef(null);

  // Auto focus iframe so user can start typing immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [game.id, iframeKey]);

  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenNewWindow = () => {
    if (game.embedType === 'url' && game.iframeSrc) {
      window.open(game.iframeSrc, '_blank');
    } else if (game.srcdocContent) {
      const blob = new Blob([game.srcdocContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    }
  };

  const relatedGames = allGames
    .filter(g => g.id !== game.id && (g.category === game.category || g.tags.some(t => game.tags.includes(t))))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Breadcrumb / Back Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="back-to-arcade-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Games</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Playing:</span>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
            {game.title}
          </span>
        </div>
      </div>

      {/* Main Player Box */}
      <div 
        ref={playerContainerRef}
        className={`bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all ${
          isTheater ? 'fixed inset-0 z-50 rounded-none border-none' : 'relative mb-8'
        }`}
      >
        {/* Player Header Bar */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {game.title}
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                  {game.category}
                </span>
              </h1>
            </div>
          </div>

          {/* Player Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Reload Iframe */}
            <button
              id="reload-game-btn"
              onClick={handleReload}
              title="Reload Game"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Favorite toggle */}
            <button
              id="fav-player-btn"
              onClick={() => onToggleFavorite(game.id)}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Popout / New Window */}
            <button
              id="popout-game-btn"
              onClick={handleOpenNewWindow}
              title="Open in new window"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors hidden sm:block"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Theater Mode Toggle */}
            <button
              id="theater-mode-btn"
              onClick={() => setIsTheater(!isTheater)}
              title={isTheater ? "Exit Theater Mode" : "Theater Mode (Full Screen in Tab)"}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Native Fullscreen */}
            <button
              id="fullscreen-game-btn"
              onClick={handleFullscreen}
              title="Full Screen"
              className="p-2 text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 rounded-lg border border-indigo-700/50 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Share Link */}
            <button
              id="share-game-btn"
              onClick={handleShare}
              title="Share Game Link"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-700/50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Iframe Viewport Container */}
        <div className={`relative bg-black flex items-center justify-center ${
          isTheater ? 'h-[calc(100vh-57px)]' : 'h-[520px] sm:h-[580px]'
        }`}>
          {game.embedType === 'srcdoc' && game.srcdocContent ? (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              id={`game-iframe-${game.id}`}
              srcDoc={game.srcdocContent}
              title={game.title}
              className="w-full h-full border-0"
              allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write;"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
            />
          ) : (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              id={`game-iframe-${game.id}`}
              src={game.iframeSrc || 'about:blank'}
              title={game.title}
              className="w-full h-full border-0"
              allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write;"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
            />
          )}

          {/* Quick Focus overlay button if user clicked outside */}
          <button
            onClick={() => iframeRef.current?.focus()}
            className="absolute bottom-3 right-3 text-[11px] bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-md border border-slate-700/60 backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity"
            title="Click to focus game controls"
          >
            Click to Focus 🎮
          </button>
        </div>
      </div>

      {/* Details & Controls section */}
      {!isTheater && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Card */}
          <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">
              <Keyboard className="w-4 h-4 text-indigo-400" />
              <span>Game Controls</span>
            </div>

            {game.controls && game.controls.length > 0 ? (
              <div className="space-y-2.5">
                {game.controls.map((ctrl, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono bg-slate-800 text-indigo-300 font-bold px-2 py-1 rounded border border-slate-700">
                      {ctrl.key}
                    </span>
                    <span className="text-slate-400 font-medium text-right">
                      {ctrl.action}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Standard mouse / keyboard controls apply.</p>
            )}

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-200">{game.rating.toFixed(1)}</span>
                <span className="text-slate-500">/ 5.0</span>
              </div>
              <div>{game.plays.toLocaleString()} total sessions</div>
            </div>
          </div>

          {/* Description & Metadata Card */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-slate-800">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>About {game.title}</span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {game.description}
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {game.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-800/90 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700/50">
                    #{tag}
                  </span>
                ))}
                <span className="text-xs bg-slate-800/90 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700/50">
                  Embed: {game.embedType === 'srcdoc' ? 'Direct HTML5 Canvas' : 'Iframe URL'}
                </span>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/30 text-xs text-indigo-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><b>Pro-Tip:</b> Use <b>Theater Mode</b> or press <b>Fullscreen</b> for an uninterrupted arcade experience!</span>
            </div>
          </div>
        </div>
      )}

      {/* Related Games */}
      {!isTheater && relatedGames.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-bold text-slate-100 mb-4">
            More Games You Might Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedGames.map(rg => (
              <div
                key={rg.id}
                onClick={() => onSelectRelatedGame(rg)}
                className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3 cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className={`h-20 rounded-lg bg-gradient-to-br ${rg.thumbnailColor} flex items-center justify-center text-white/80 group-hover:text-white mb-2`}>
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-200 group-hover:text-indigo-300 line-clamp-1">
                  {rg.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{rg.category}</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{rg.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
