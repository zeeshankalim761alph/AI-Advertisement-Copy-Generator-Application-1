import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  History, 
  Trash2, 
  Download, 
  PenTool, 
  Layout, 
  Users, 
  MessageSquare, 
  Target,
  Globe,
  Briefcase
} from 'lucide-react';

import { AdFormData, AdVariation, HistoryItem, ViewMode } from './types';
import { PLATFORMS, TONES, OBJECTIVES, LANGUAGES, INITIAL_FORM_DATA } from './constants';
import { generateAdCopy } from './services/geminiService';
import { Button } from './components/Button';
import { AdResultCard } from './components/AdResultCard';

const App: React.FC = () => {
  const [formData, setFormData] = useState<AdFormData>(INITIAL_FORM_DATA);
  const [variations, setVariations] = useState<AdVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GENERATOR);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('adGeniusHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('adGeniusHistory', JSON.stringify(history));
  }, [history]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName) {
      setError("Please enter a product or service name.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVariations([]);

    try {
      const generatedVariations = await generateAdCopy(formData);
      setVariations(generatedVariations);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        formData: { ...formData },
        variations: generatedVariations
      };
      
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (err) {
      setError("Failed to generate ad copy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(INITIAL_FORM_DATA);
    setVariations([]);
    setError(null);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setFormData(item.formData);
    setVariations(item.variations);
    setViewMode(ViewMode.GENERATOR);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const downloadResults = () => {
    if (variations.length === 0) return;
    
    let content = `Ad Genius Results for: ${formData.productName}\n`;
    content += `Date: ${new Date().toLocaleString()}\n`;
    content += `Platform: ${formData.platform} | Objective: ${formData.objective}\n\n`;
    content += `--------------------------------------------------\n\n`;

    variations.forEach((v, i) => {
      content += `OPTION ${i + 1} (${v.framework})\n\n`;
      content += `HEADLINE:\n${v.headline}\n\n`;
      content += `PRIMARY TEXT:\n${v.primaryText}\n\n`;
      content += `CTA: ${v.cta}\n\n`;
      content += `WHY IT WORKS: ${v.explanation}\n\n`;
      content += `--------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad-copy-${formData.productName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AdGenius<span className="text-indigo-600">AI</span></h1>
          </div>
          
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode(ViewMode.GENERATOR)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === ViewMode.GENERATOR 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setViewMode(ViewMode.HISTORY)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                viewMode === ViewMode.HISTORY
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History size={16} /> History
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {viewMode === ViewMode.GENERATOR ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                  <PenTool size={18} className="text-indigo-500" />
                  Campaign Details
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product / Service Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="productName"
                      required
                      value={formData.productName}
                      onChange={handleInputChange}
                      placeholder="e.g. EcoClean All-Purpose Spray"
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        <div className="flex items-center gap-1.5"><Briefcase size={14}/> Business Type / Industry</div>
                    </label>
                    <input
                      type="text"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      placeholder="e.g. Home Cleaning Supplies, SaaS"
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        <div className="flex items-center gap-1.5"><Users size={14}/> Target Audience</div>
                    </label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      placeholder="e.g. Busy moms, Tech professionals"
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                         <div className="flex items-center gap-1.5"><Layout size={14}/> Platform</div>
                      </label>
                      <select
                        name="platform"
                        value={formData.platform}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      >
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <div className="flex items-center gap-1.5"><MessageSquare size={14}/> Tone</div>
                      </label>
                      <select
                        name="tone"
                        value={formData.tone}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      >
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <div className="flex items-center gap-1.5"><Target size={14}/> Objective</div>
                      </label>
                      <select
                        name="objective"
                        value={formData.objective}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      >
                        {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                         <div className="flex items-center gap-1.5"><Globe size={14}/> Language</div>
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      >
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="flex-1" 
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="flex-[2] w-full" 
                      isLoading={isLoading}
                      icon={<Sparkles size={16} />}
                    >
                      Generate Copy
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start">
                    <div className="font-medium">{error}</div>
                </div>
              )}

              {variations.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Generated Variations</h2>
                     <div className="flex gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={handleSubmit} 
                            disabled={isLoading}
                            icon={<Sparkles size={14} />}
                            className="text-xs"
                        >
                            Regenerate
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={downloadResults}
                            icon={<Download size={14} />}
                            className="text-xs"
                        >
                            Export
                        </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {variations.map((v, index) => (
                      <AdResultCard key={index} variation={v} index={index} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white border border-dashed border-slate-300 rounded-2xl">
                  {!isLoading ? (
                      <>
                        <div className="bg-indigo-50 p-4 rounded-full mb-4">
                            <PenTool className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">Ready to create magic?</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            Fill in the campaign details on the left and hit generate to create professional ad copies in seconds.
                        </p>
                      </>
                  ) : (
                      <div className="flex flex-col items-center animate-pulse">
                          <div className="h-8 w-8 bg-indigo-200 rounded-full mb-4"></div>
                          <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
                          <div className="h-3 w-32 bg-slate-200 rounded"></div>
                      </div>
                  )}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* History View */
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Saved Campaigns</h2>
                {history.length > 0 && (
                    <button 
                        onClick={() => {
                            if(confirm('Are you sure you want to clear all history?')) {
                                setHistory([]);
                            }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                        <Trash2 size={14} /> Clear All
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <History className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No history yet</h3>
                    <p className="text-slate-500">Your generated ad copies will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => loadFromHistory(item)}
                            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                                        {item.formData.productName}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-2">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{item.formData.platform}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{item.formData.objective}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {item.variations[0].headline}
                                    </p>
                                </div>
                                <button 
                                    onClick={(e) => deleteHistoryItem(e, item.id)}
                                    className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-slate-500">
                Powered by Gemini AI • Designed for Marketers
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
