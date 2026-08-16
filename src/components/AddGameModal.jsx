import React, { useState } from 'react';
import { X, Plus, Trash2, Globe, Code } from 'lucide-react';

export const AddGameModal = ({
  isOpen,
  onClose,
  onAddGame
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [description, setDescription] = useState('');
  const [embedMode, setEmbedMode] = useState('url');
  const [iframeSrc, setIframeSrc] = useState('');
  const [rawHtml, setRawHtml] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [controls, setControls] = useState([
    { key: 'Arrow Keys / WASD', action: 'Move' },
    { key: 'Spacebar', action: 'Action / Jump' }
  ]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddControlRow = () => {
    setControls([...controls, { key: '', action: '' }]);
  };

  const handleRemoveControlRow = (index) => {
    setControls(controls.filter((_, i) => i !== index));
  };

  const handleControlChange = (index, field, val) => {
    const next = [...controls];
    next[index][field] = val;
    setControls(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the game.');
      return;
    }
    if (embedMode === 'url' && !iframeSrc.trim()) {
      setError('Please provide a valid iframe URL.');
      return;
    }
    if (embedMode === 'srcdoc' && !rawHtml.trim()) {
      setError('Please provide HTML/JS code or iframe snippet.');
      return;
    }

    const gameId = 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    // Extract src from pasted <iframe> if user pasted an iframe tag in URL box
    let cleanSrc = iframeSrc.trim();
    if (cleanSrc.includes('<iframe') && cleanSrc.includes('src=')) {
      const match = cleanSrc.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        cleanSrc = match[1];
      }
    }

    const newGame = {
      id: gameId,
      title: title.trim(),
      category: category,
      description: description.trim() || 'Custom added iframe game.',
      embedType: embedMode,
      iframeSrc: embedMode === 'url' ? cleanSrc : undefined,
      srcdocContent: embedMode === 'srcdoc' ? rawHtml.trim() : undefined,
      thumbnailColor: 'from-indigo-900 to-purple-950',
      icon: 'Globe',
      tags: parsedTags.length > 0 ? parsedTags : ['Custom', category],
      controls: controls.filter(c => c.key.trim() && c.action.trim()),
      rating: 5.0,
      plays: 1
    };

    onAddGame(newGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Add Custom Iframe Game</h2>
            <p className="text-xs text-slate-400">Save a new game to the local unblocked repository</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200">
              {error}
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Game Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Slope Run 2"
                className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Arcade">Arcade</option>
                <option value="Action">Action</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Retro">Retro</option>
                <option value="Sports">Sports</option>
                <option value="Strategy">Strategy</option>
                <option value="Idle">Idle</option>
                <option value="Classic">Classic</option>
              </select>
            </div>
          </div>

          {/* Embed Mode Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Iframe Embed Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEmbedMode('url')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-colors ${
                  embedMode === 'url'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Iframe URL / Link</span>
              </button>
              <button
                type="button"
                onClick={() => setEmbedMode('srcdoc')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-colors ${
                  embedMode === 'srcdoc'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>Raw HTML / Canvas Code</span>
              </button>
            </div>
          </div>

          {/* URL Input or HTML Input */}
          {embedMode === 'url' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Iframe URL or &lt;iframe&gt; Tag *</label>
              <input
                type="text"
                value={iframeSrc}
                onChange={e => setIframeSrc(e.target.value)}
                placeholder="https://example.com/game or <iframe src='...'></iframe>"
                className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Make sure the destination site allows iframe embedding (no X-Frame-Options block).</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Raw HTML / JS / Game Code *</label>
              <textarea
                rows={5}
                value={rawHtml}
                onChange={e => setRawHtml(e.target.value)}
                placeholder="<!DOCTYPE html><html><body><canvas id='c'></canvas><script>...</script></body></html>"
                className="w-full font-mono bg-slate-950 text-slate-100 placeholder-slate-500 text-xs p-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Game Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of gameplay, objectives, and tips..."
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. 3D, Skill, Speed, Endless"
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Controls Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Controls Cheat-Sheet</label>
              <button
                type="button"
                onClick={handleAddControlRow}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Key
              </button>
            </div>
            <div className="space-y-2">
              {controls.map((ctrl, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. Space)"
                    value={ctrl.key}
                    onChange={e => handleControlChange(idx, 'key', e.target.value)}
                    className="w-1/3 bg-slate-950 text-slate-100 text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Action (e.g. Jump)"
                    value={ctrl.action}
                    onChange={e => handleControlChange(idx, 'action', e.target.value)}
                    className="flex-1 bg-slate-950 text-slate-100 text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                  {controls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveControlRow(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-colors"
          >
            Save & Play Game
          </button>
        </div>
      </div>
    </div>
  );
};
