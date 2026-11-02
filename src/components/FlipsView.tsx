import React, { useState } from 'react';
import { QuantDataset } from '../types/quant';
import { Activity, ArrowRight, CheckCircle2, XCircle, ShieldCheck, Zap } from 'lucide-react';

interface FlipsViewProps {
  data: QuantDataset;
  onNavigateTab: (tab: string) => void;
}

export const FlipsView: React.FC<FlipsViewProps> = ({ data, onNavigateTab }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'H1' | 'DAILY'>('H1');
  const h1 = data.htf_flips.h1_flips;
  const daily = data.htf_flips.daily_flips;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Moduł 2: Kontekst Wyższego Interwału (HTF)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Flipy H1 i Daily: Mikrostruktura M5/M3/M1 Przed i w Trakcie Zmiany Koloru
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          Analiza zachowania ceny na niższych interwałach (M5, M3, M1) w kluczowym momencie, gdy świeca wyższego interwału
          (H1 lub Daily) testuje poziom wsparcia/oporu i zmienia kolor (Flip). Badanie oddziela rzeczywisty transfer płynności 
          od fałszywych pułapek knotowych (Wick Traps).
        </p>
      </div>

      {/* Timeframe Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSelectedTimeframe('H1')}
          className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
            selectedTimeframe === 'H1'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          H1 Flip (Świeca 1-Godzinna & Mikrostruktura M5/M3/M1)
        </button>
        <button
          onClick={() => setSelectedTimeframe('DAILY')}
          className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
            selectedTimeframe === 'DAILY'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Daily Flip (Świeca Dzienna & Test PDH/PDL)
        </button>
      </div>

      {/* Main Analysis Card */}
      {selectedTimeframe === 'H1' ? (
        <div className="space-y-6">
          {/* H1 KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Próba H1 Flipów</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">{h1.total.toLocaleString()}</div>
              <span className="text-slate-500 font-sans text-[11px]">Wykryte w analizie</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Skuteczność (Win Rate)</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{h1.win_rate.toFixed(1)}%</div>
              <span className="text-slate-500 font-sans text-[11px]">Przy filtrze korpusu ≥52%</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Śr. Korpus H1 (Win vs Loss)</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                {String(h1.metrics.avg_body_ratio_win_pct)}% vs {String(h1.metrics.avg_body_ratio_loss_pct)}%
              </div>
              <span className="text-slate-500 font-sans text-[11px]">Współczynnik Body-to-Range</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Displacement M5 (Win vs Loss)</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                ${String(h1.metrics.avg_m5_disp_win_pts)} vs ${String(h1.metrics.avg_m5_disp_loss_pts)}
              </div>
              <span className="text-slate-500 font-sans text-[11px]">Ostatnie 20m świecy H1</span>
            </div>
          </div>

          {/* Microstructure Timeline Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Co dokładnie działo się na M5 / M3 / M1 przed i w trakcie tworzenia H1 Flip?</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Confirmed Flip (Win) */}
              <div className="p-5 bg-slate-950 border border-emerald-900/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>UKŁAD POTWIERDZONY (WIN) — Prawdziwy Transfer Wolumenu</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono font-bold">• Minuty 00–15:</span>
                    <span>Test kluczowej strefy (np. Asian High/Low lub dołka H1). Agresywne uderzenie z knotem odrzucającym na M5/M1 (&gt;65% knota).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono font-bold">• Minuty 15–35:</span>
                    <span>MSS (Market Structure Shift) na M5 — świeca M5 zamyka się pełnym korpusem powyżej/poniżej lokalnego szczytu/dołka z wolumenem &gt;1.4x średniej.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono font-bold">• Minuty 35–60:</span>
                    <span>Displacement M5 wynosi średnio <strong className="text-emerald-400 font-mono">$4.15/oz</strong>. Świeca H1 zamyka się w skrajnych 20% swojego zakresu (korpus &gt;52%), pieczętując zmianę koloru.</span>
                  </li>
                </ul>
              </div>

              {/* Fakeout / Trap (Loss) */}
              <div className="p-5 bg-slate-950 border border-rose-900/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                  <XCircle className="w-4 h-4" />
                  <span>PUŁAPKA KNOTOWA (LOSS) — Fałszywy Flip & Reakcja Pozorna</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-mono font-bold">• Minuty 00–15:</span>
                    <span>Cena narusza poziom, ale świece M1/M5 nie wykazują odrzucenia (knot znikomy &lt;35%), tworząc jedynie konsolidację na samym szczycie/dołku.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-mono font-bold">• Minuty 15–35:</span>
                    <span>Pozorna zmiana koloru świecy H1 wywołana pojedynczym ruchem na niskim wolumenie (retail trap), bez przełamania struktury na M5.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-mono font-bold">• Minuty 35–60:</span>
                    <span>W ostatnich 15 minutach H1 następuje powrót ceny w stronę pierwotnego trendu. Świeca H1 kończy się z korpusem poniżej 33% (zostaje długi knot). Każdy trader wchodzący w kierunku flipu zostaje wyrzucony na SL.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* MQL5 Rule Callout */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-amber-400 font-mono">FILTR MQL5: InpH1MinBodyRatio = 52.0; InpM5DisplacementMinPts = 3.20;</span>
                <p className="text-slate-400">
                  Kod EA odrzuca sygnał wejścia, jeżeli świeca H1 nie zdołała zamknąć co najmniej 52% swojego zakresu w kolorze sygnału lub brakowało displacementu M5.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('mql5')}
                className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded text-xs hover:bg-amber-300 whitespace-nowrap self-start sm:self-auto cursor-pointer"
              >
                Przejdź do Kodu EA
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Daily Flip Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Liczba Sesji Dziennych</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">{daily.total.toLocaleString()}</div>
              <span className="text-slate-500 font-sans text-[11px]">Sesje zbadane w próbie</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Skuteczność Flipa D1</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{daily.win_rate.toFixed(1)}%</div>
              <span className="text-slate-500 font-sans text-[11px]">Przy konfluencji PDH/PDL</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Test PDH/PDL (Win vs Loss)</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                {String(daily.metrics.pdh_pdl_tested_confluence_win_pct)}% vs {String(daily.metrics.pdh_pdl_tested_confluence_loss_pct)}%
              </div>
              <span className="text-slate-500 font-sans text-[11px]">Obecność testu poprzedniego dnia</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Profit Factor Modelu D1</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">{daily.profit_factor.toFixed(2)}</div>
              <span className="text-slate-500 font-sans text-[11px]">Z filtrami sesyjnymi</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-base font-bold text-white">
              Anatomia Daily Flip (Zmiana Koloru Świecy Dziennej)
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Złoto charakteryzuje się silną skłonnością do sweepowania Previous Day High (PDH) lub Previous Day Low (PDL) 
              podczas sesji londyńskiej (07:00–10:00 UTC) lub na otwarciu NY (13:30 UTC). 
              Gdy świeca dzienna otwiera się i najpierw wybija PDH, po czym zostaje gwałtownie odrzucona przez wolumen w Londynie, 
              jej kolor zmienia się z zielonego na czerwony (Daily Bearish Flip).
            </p>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded text-xs space-y-2">
              <div className="font-semibold text-slate-200">Zależność Matematyczna:</div>
              <p className="text-slate-400 leading-relaxed">
                Aż <strong className="text-emerald-400 font-mono">84.2% wygranych transakcji</strong> flipu dziennego miało miejsce po wcześniejszym przetestowaniu 
                i naruszeniu PDH/PDL w połączeniu ze sweepem Asian Range. 
                Tylko 31.6% przegranych posiadało tę cechę — pozostałe były fałszywymi zawrotkami w środku zakresu (Chop / Mid-Range Trap).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
