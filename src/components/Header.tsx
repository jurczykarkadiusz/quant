import React from 'react';
import { Download, Activity, Code2, Layers, Clock, ShieldCheck, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDownloadEA: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onDownloadEA }) => {
  const navItems = [
    { id: 'summary', label: 'Podsumowanie & Filtry EA', icon: ShieldCheck },
    { id: 'sessions', label: 'Pełne Sesje (Azja, Londyn, NY)', icon: Clock },
    { id: 'flips', label: 'Flipy HTF (H1 & Daily)', icon: Activity },
    { id: 'patterns', label: 'Fizyka Formacji (Win vs Loss)', icon: Layers },
    { id: 'mql5', label: 'Kod EA (MQL5)', icon: Code2 },
    { id: 'datasets', label: 'Dane Kaggle & Test CSV', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
              AU
            </div>
            <a 
              href="#top" 
              onClick={(e) => { e.preventDefault(); setActiveTab('summary'); }}
              className="text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-amber-400 transition-colors"
            >
              XAU/USD Quant Studio
            </a>
          </div>

          {/* Zone 2: 4-6 Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive 
                      ? 'text-amber-400 border-amber-400 font-semibold' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onDownloadEA}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
              title="Pobierz gotowy do kompilacji kod Expert Advisor dla MetaTrader 5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pobierz EA (.mq5)</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-4 border-t border-slate-900 text-xs no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded ${
                activeTab === item.id
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
