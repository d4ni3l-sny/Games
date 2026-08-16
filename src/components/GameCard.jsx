import React from 'react';
import { 
  Play, 
  Heart, 
  Star, 
  Rocket, 
  Activity, 
  Layers, 
  Grid, 
  Compass, 
  Shield, 
  Zap, 
  Target, 
  Trophy, 
  Sparkles, 
  Flame, 
  Globe 
} from 'lucide-react';

const getGameIcon = (iconName) => {
  switch (iconName) {
    case 'Rocket': return <Rocket className="w-8 h-8" />;
    case 'Activity': return <Activity className="w-8 h-8" />;
    case 'Layers': return <Layers className="w-8 h-8" />;
    case 'Grid': return <Grid className="w-8 h-8" />;
    case 'Compass': return <Compass className="w-8 h-8" />;
    case 'Shield': return <Shield className="w-8 h-8" />;
    case 'Zap': return <Zap className="w-8 h-8" />;
    case 'Target': return <Target className="w-8 h-8" />;
    case 'Trophy': return <Trophy className="w-8 h-8" />;
    case 'Sparkles': return <Sparkles className="w-8 h-8" />;
    case 'Flame': return <Flame className="w-8 h-8" />;
    default: return <Globe className="w-8 h-8" />;
  }
};

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onPlay
}) => {
  return (
    <div
      id={`game-card-${game.id}`}
      onClick={() => onPlay(game)}
      className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col"
    >
      {/* Banner / Poster */}
      <div className={`relative h-36 bg-gradient-to-br ${game.thumbnailColor || 'from-slate-800 to-slate-900'} flex items-center justify-center overflow-hidden`}>
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        {/* Central Icon */}
        <div className="relative text-white/80 group-hover:text-white group-hover:scale-110 transition-transform duration-300">
          {getGameIcon(game.icon)}
        </div>

        {/* Featured Badge */}
        {game.featured && (
          <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-extrabold tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded shadow">
            Featured
          </span>
        )}

        {/* Favorite Button */}
        <button
          id={`fav-btn-${game.id}`}
          onClick={(e) => onToggleFavorite(game.id, e)}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-sm transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
        </button>

        {/* Hover overlay Play prompt */}
        <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200">
          <span className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-indigo-600/40 group-hover:scale-105 transition-transform">
            <Play className="w-3.5 h-3.5 fill-current" /> PLAY NOW
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
              {game.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{game.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors line-clamp-1">
            {game.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Tags and Plays Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            {game.tags.slice(0, 2).map((t) => (
              <span key={t} className="bg-slate-800/90 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                #{t}
              </span>
            ))}
          </div>
          <span>{game.plays.toLocaleString()} plays</span>
        </div>
      </div>
    </div>
  );
};
