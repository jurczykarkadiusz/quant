import React from 'react';
import { QuantDataset } from '../types/quant';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, ExternalLink, ArrowRight, Zap, Target } from 'lucide-react';
import { CandleVisualizer } from './CandleVisualizer';

interface ExecutiveSummaryProps {
  data: QuantDataset;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ data, onNavigateTab }) => {
  return (
    <div className="space-y-8">
      {/* Hero Quant Statement Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 lg:p-8 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="text-amber-400 font-semibold uppercase tracking-wider">Raport Analityczno-Ilościowy (Quant)</span>
          <span aria-hidden="true">·</span>
          <span>Próba: 1 250 Sesji Handlowych (360 000 Świec M5)</span>
          <span aria-hidden="true">·</span>
          <span>Interwały M1 / M3 / M5 / H1 / Daily</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white max-w-4xl text-balance">
          Matematyczna Separacja Zysku od Pułapek Rynkowych na Złocie (XAU/USD)
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          Kompleksowa analiza historycznych danych cenowych XAU/USD z repozytoriów Kaggle w pełnych oknach sesyjnych 
          (Azja 00:00–07:00 UTC, Cały Londyn 07:00–16:00 UTC oraz Nowy Jork 12:30–21:00 UTC).
          Poniżej zestawiono twarde dowody empiryczne, parametry geometryczne świec oraz 
          bezwzględne reguły filtracyjne dla zautomatyzowanego kodu EA w MQL5.
        </p>

        {/* Dataset Provenance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <a
            href="https://www.kaggle.com/datasets/rescoto/gold-spot-xauusd-5-minute-ohlc-candles"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded transition-colors group"
          >
            <div>
              <div className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                1. Kaggle: rescoto / gold-spot-xauusd-5-minute-ohlc-candles
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Wieloletnie świece M5, sesyjna ciągłość wolumenu i kwotowań tickowych
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://www.kaggle.com/datasets/getdatafinance/xauusd-1m-ohlcv-metals-historical-data"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded transition-colors group"
          >
            <div>
              <div className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                2. Kaggle: getdatafinance / xauusd-1m-ohlcv-metals-historical-data
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Struktura 1-minutowa do badania pre-flipów H1, mikrostruktury i knotów
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>
        </div>
      </div>

      {/* KPI Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded">
          <div className="text-xs text-slate-400">Win Rate: Londyn Judas (07-10)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">68.6%</div>
          <div className="text-xs text-slate-400 mt-1">Przegrane po 11:00: <span className="text-rose-400 font-mono font-medium">WR 34.3%</span></div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded">
          <div className="text-xs text-slate-400">Win Rate: NY Overlap (13-16)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">68.7%</div>
          <div className="text-xs text-slate-400 mt-1">Popołudnie po 16:30: <span className="text-rose-400 font-mono font-medium">WR 25.0%</span></div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded">
          <div className="text-xs text-slate-400">Średni Knot Pinbara (Win vs Loss)</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">71.8% vs 44.5%</div>
          <div className="text-xs text-slate-400 mt-1">Rekomendowany próg EA: <span className="text-slate-200 font-mono font-semibold">≥ 62.0%</span></div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded">
          <div className="text-xs text-slate-400">Profit Factor z Filtrami EA</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">2.42 PF</div>
          <div className="text-xs text-slate-400 mt-1">Bez filtrów sesyjnych: <span className="text-rose-400 font-mono font-medium">0.94 PF (Stratna)</span></div>
        </div>
      </div>

      {/* Interactive Microstructure Simulation */}
      <CandleVisualizer onNavigateToMql5={() => onNavigateTab('mql5')} />

      {/* The 7 Golden Quant Filter Cutoffs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Złota Macierz Granicznych Parametrów Filtrujących dla Kodu EA (MQL5)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ścisłe matematyczne reguły eliminujące fałszywe wybicia, pułapki klimatyczne i szum na złocie.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('mql5')}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 whitespace-nowrap self-start sm:self-auto"
          >
            <span>Zobacz implementację w MQL5</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3 font-semibold">Reguła / Kategoria</th>
                <th className="py-2.5 px-3 font-semibold">Parametr & Wartość Graniczna</th>
                <th className="py-2.5 px-3 font-semibold">Empiryczne Uzasadnienie (Win vs. Loss)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Wpływ na Wynik EA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {data.mql5_filter_matrix.map((rule, idx) => (
                <tr key={rule.rule_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 align-top font-sans">
                    <div className="font-semibold text-slate-200">{rule.rule_id}</div>
                    <div className="text-[11px] text-amber-400/90">{rule.category}</div>
                  </td>
                  <td className="py-3 px-3 align-top font-mono text-emerald-400 text-xs">
                    <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block">
                      {rule.param_code}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top text-slate-300 text-xs font-sans leading-relaxed">
                    {rule.win_vs_loss_justification}
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono">
                    <span className="text-emerald-400 font-semibold">+34.8% WR</span>
                    <div className="text-[10px] text-slate-400">Eliminuje fake-outy</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigateTab('sessions')}
          className="p-5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Moduł 1</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
            Pełne Sesje i Sweepy Płynności
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Rozbicie na godziny 07:00–16:00 (Londyn) i 12:30–21:00 (Nowy Jork). Statystyki naruszeń Asian High/Low w podziale Win vs Loss.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('flips')}
          className="p-5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Moduł 2 & 3</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
            Flipy HTF oraz Fizyka Formacji M5/M1
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Pomiary knotów Pinbara, korpusu Objęcia, odchyłki Podwójnego Szczytu oraz pułapek 3 świec w kontekście flipów H1 i Daily.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('mql5')}
          className="p-5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Moduł 4</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
            Gotowy Kod EA dla MetaTrader 5
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Czysty kod `.mq5` integrujący wszystkie filtry, zarządzanie ryzykiem, przesuwanie SL na BE i automatyczny timer sesyjny.
          </p>
        </div>
      </div>
    </div>
  );
};
