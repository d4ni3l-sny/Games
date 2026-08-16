import React, { useEffect } from 'react';
import { Eye, FileText, CheckCircle2 } from 'lucide-react';

export const PanicOverlay = ({
  isOpen,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[999] bg-white text-slate-800 font-sans flex flex-col cursor-default select-none overflow-y-auto"
    >
      {/* Top Google Docs / Drive Style Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">AP Biology Chapter 8 - Photosynthesis & Cellular Respiration Notes</span>
              <span className="text-[11px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">Saved to Drive</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="hover:text-blue-600 cursor-pointer">File</span>
              <span className="hover:text-blue-600 cursor-pointer">Edit</span>
              <span className="hover:text-blue-600 cursor-pointer">View</span>
              <span className="hover:text-blue-600 cursor-pointer">Insert</span>
              <span className="hover:text-blue-600 cursor-pointer">Format</span>
              <span className="hover:text-blue-600 cursor-pointer">Tools</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400 italic">Click anywhere or press [Esc] to return</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-full transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Return to Arcade</span>
          </button>
        </div>
      </div>

      {/* Disguised Document Content */}
      <div className="max-w-4xl mx-auto w-full my-8 bg-white border border-gray-200 shadow-sm rounded-lg p-12 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 border-b pb-3">
          Section 8.2: Light-Dependent Reactions of Photosynthesis
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-blue-900">
          <b>Key Concept:</b> Photosynthesis converts light energy into the chemical energy of sugars and other organic compounds.
        </div>

        <h2 className="text-lg font-semibold text-gray-800">1. Photosystem II and Electron Transport Chain</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Photons of light strike chlorophyll molecules within Photosystem II (P680), exciting electrons to a higher energy level. These high-energy electrons pass along an electron transport chain to Photosystem I (P700). As electrons move down the gradient, hydrogen ions (protons) are pumped across the thylakoid membrane into the thylakoid lumen.
        </p>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="border border-gray-200 rounded p-4 text-xs bg-gray-50">
            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Reactants
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Water (H₂O) - Electron donor</li>
              <li>Light photons (400 - 700 nm)</li>
              <li>NADP⁺ and ADP + Pᵢ</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded p-4 text-xs bg-gray-50">
            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Products
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Oxygen gas (O₂) - Byproduct</li>
              <li>ATP (via ATP Synthase)</li>
              <li>NADPH (Reducing agent)</li>
            </ul>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800">2. The Calvin Cycle (Light-Independent Phase)</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Occurring in the stroma of the chloroplast, carbon fixation is catalyzed by the enzyme RuBisCO (ribulose-1,5-bisphosphate carboxylase-oxygenase). 3 molecules of CO₂ combine with RuBP to yield glyceraldehyde 3-phosphate (G3P), which is used to synthesize glucose and other carbohydrates.
        </p>
      </div>
    </div>
  );
};
