import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Upload, RotateCcw, Save, AlertCircle } from 'lucide-react';

export const JsonEditorModal = ({
  isOpen,
  onClose,
  games,
  onSaveJson,
  onResetDefaults
}) => {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(games, null, 2));
      setError(null);
      setSavedSuccess(false);
    }
  }, [isOpen, games]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'games.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setJsonText(JSON.stringify(parsed, null, 2));
          setError(null);
        } else {
          setError('Imported JSON must be an array of game objects.');
        }
      } catch (err) {
        setError('Invalid JSON syntax: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setError('The JSON root must be an array of games.');
        return;
      }
      onSaveJson(parsed);
      setError(null);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError('JSON Syntax Error: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>games.json Repository</span>
              <span className="text-xs bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-800/40">
                {games.length} Games
              </span>
            </h2>
            <p className="text-xs text-slate-400">View, edit, or export the unblocked iframe games database</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download .json</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div>
            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-medium border border-rose-800/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="px-6 py-2 bg-rose-950/80 border-b border-rose-800 flex items-center gap-2 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 p-4 bg-slate-950 overflow-hidden flex flex-col">
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError(null);
            }}
            spellCheck={false}
            className="w-full flex-1 font-mono text-xs text-slate-200 bg-slate-900/60 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Schema: <code>Array&lt;Game&gt;</code> with <code>embedType</code>, <code>srcdoc</code> / <code>iframeSrc</code>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Changes!' : 'Apply & Save JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
