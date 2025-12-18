import React, { useState } from 'react';
import { Copy, Check, Share2, Info } from 'lucide-react';
import { AdVariation } from '../types';

interface AdResultCardProps {
  variation: AdVariation;
  index: number;
}

export const AdResultCard: React.FC<AdResultCardProps> = ({ variation, index }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = () => {
    const fullText = `Headline: ${variation.headline}\n\n${variation.primaryText}\n\nCTA: ${variation.cta}`;
    handleCopy(fullText, 'all');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            Option {index + 1}
          </span>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1" title={variation.explanation}>
            <Info size={12} />
            {variation.framework}
          </span>
        </div>
        <button 
          onClick={copyAll}
          className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center transition-colors"
        >
          {copiedField === 'all' ? <Check size={14} className="mr-1" /> : <Share2 size={14} className="mr-1" />}
          {copiedField === 'all' ? 'Copied' : 'Copy All'}
        </button>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Headline */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Headline</label>
            <button 
              onClick={() => handleCopy(variation.headline, 'headline')}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              title="Copy Headline"
            >
              {copiedField === 'headline' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-slate-900 font-bold text-lg leading-tight">{variation.headline}</p>
        </div>

        {/* Primary Text */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary Text</label>
            <button 
              onClick={() => handleCopy(variation.primaryText, 'text')}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              title="Copy Text"
            >
              {copiedField === 'text' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{variation.primaryText}</p>
        </div>

        {/* CTA */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CTA Button</label>
            <button 
              onClick={() => handleCopy(variation.cta, 'cta')}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              title="Copy CTA"
            >
               {copiedField === 'cta' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="inline-block bg-slate-100 text-slate-800 px-3 py-1.5 rounded-md text-sm font-semibold border border-slate-200">
            {variation.cta}
          </div>
        </div>
        
        {/* Insight/Explanation */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
            <p className="text-xs text-blue-800">
                <span className="font-bold">Why this works:</span> {variation.explanation}
            </p>
        </div>
      </div>
    </div>
  );
};
