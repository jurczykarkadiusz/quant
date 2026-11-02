import React, { useState } from 'react';
import { CheckCircle2, XCircle, Eye, Sliders, ArrowRight } from 'lucide-react';

interface CandleVisualizerProps {
  onNavigateToMql5?: () => void;
}

export const CandleVisualizer: React.FC<CandleVisualizerProps> = ({ onNavigateToMql5 }) => {
  const [mode, setMode] = useState<'WIN' | 'LOSS'>('WIN');
  const [activePattern, setActivePattern] = useState<'PINBAR' | 'ENGULFING' | 'DOUBLE_TOP'>('PINBAR');

  // Coordinates and data for SVG render
  // SVG viewBox: 0 0 900 360
  // Left: Asia (0 to 300), Center: London (300 to 600), Right: NY (600 to 900)
  const asiaHighY = 160;
  const asiaLowY = 240;
  const asiaRangePts = 8.0; // 80px = $8.00 => 10px per $1.00

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Interaktywny Model Wizualny M5</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">Symulator Mikrostruktury Sesyjnej</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Anatomia Transakcji: Wygrany Sweep (Win) vs Pułapka Rynkowa (Loss)
          </h2>
        </div>

        {/* Segmented Controls for Mode & Pattern */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Win / Loss toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded">
            <button
              onClick={() => setMode('WIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                mode === 'WIN' 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Układ Wygrany (Win)</span>
            </button>
            <button
              onClick={() => setMode('LOSS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                mode === 'LOSS' 
                  ? 'bg-rose-950 text-rose-300 border border-rose-700/60 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Pułapka Rynkowa (Loss)</span>
            </button>
          </div>

          {/* Pattern selector */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded">
            {(['PINBAR', 'ENGULFING', 'DOUBLE_TOP'] as const).map((pat) => (
              <button
                key={pat}
                onClick={() => setActivePattern(pat)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  activePattern === pat
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pat === 'PINBAR' ? 'Pinbar M5' : pat === 'ENGULFING' ? 'Objęcie M5' : 'Podwójny Szczyt'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-x-auto bg-slate-950 rounded border border-slate-800/80 p-2">
        <svg viewBox="0 0 900 340" className="w-full h-[320px] select-none font-mono">
          <defs>
            <linearGradient id="asiaBoxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="londonBoxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="nyBoxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="50" y1="80" x2="880" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="50" y1="140" x2="880" y2="140" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="50" y1="200" x2="880" y2="200" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="50" y1="260" x2="880" y2="260" stroke="#1e293b" strokeDasharray="3 3" />

          {/* Session background boxes */}
          {/* Asia 00:00 - 07:00 UTC (x: 60 to 300) */}
          <rect x="60" y="30" width="240" height="280" fill="url(#asiaBoxGrad)" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 2" />
          <text x="70" y="52" fill="#38bdf8" fontSize="11" fontWeight="bold">SESJA AZJATYCKA (00:00 - 07:00 UTC)</text>
          <text x="70" y="68" fill="#94a3b8" fontSize="10">Budowa zakresu i płynności</text>

          {/* Asian Range High & Low Lines */}
          <line x1="60" y1={asiaHighY} x2="880" y2={asiaHighY} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 3" />
          <text x="310" y={asiaHighY - 6} fill="#38bdf8" fontSize="10" fontWeight="bold">ASIAN HIGH ($1858.00)</text>

          <line x1="60" y1={asiaLowY} x2="880" y2={asiaLowY} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 3" />
          <text x="310" y={asiaLowY + 14} fill="#38bdf8" fontSize="10" fontWeight="bold">ASIAN LOW ($1850.00)</text>

          {/* Asian session candles representation (tight consolidation) */}
          {/* Candle 1 */}
          <line x1="90" y1="185" x2="90" y2="215" stroke="#64748b" strokeWidth="1" />
          <rect x="85" y="190" width="10" height="18" fill="#10b981" />
          {/* Candle 2 */}
          <line x1="120" y1="180" x2="120" y2="225" stroke="#64748b" strokeWidth="1" />
          <rect x="115" y="195" width="10" height="15" fill="#f43f5e" />
          {/* Candle 3 */}
          <line x1="150" y1="175" x2="150" y2="230" stroke="#64748b" strokeWidth="1" />
          <rect x="145" y="180" width="10" height="25" fill="#10b981" />
          {/* Candle 4 */}
          <line x1="180" y1="168" x2="180" y2="215" stroke="#64748b" strokeWidth="1" />
          <rect x="175" y="172" width="10" height="28" fill="#f43f5e" />
          {/* Candle 5 */}
          <line x1="210" y1="185" x2="210" y2="238" stroke="#64748b" strokeWidth="1" />
          <rect x="205" y="195" width="10" height="22" fill="#10b981" />
          {/* Candle 6 */}
          <line x1="240" y1="170" x2="240" y2="220" stroke="#64748b" strokeWidth="1" />
          <rect x="235" y="180" width="10" height="25" fill="#f43f5e" />
          {/* Candle 7 */}
          <line x1="270" y1="175" x2="270" y2="210" stroke="#64748b" strokeWidth="1" />
          <rect x="265" y="180" width="10" height="15" fill="#10b981" />

          {/* London Session (300 to 580) */}
          <rect x="300" y="30" width="280" height="280" fill="url(#londonBoxGrad)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
          <text x="310" y="52" fill="#fbbf24" fontSize="11" fontWeight="bold">CAŁY LONDYN (07:00 - 16:00 UTC)</text>
          <text x="310" y="68" fill="#94a3b8" fontSize="10">Judas Swing 07:00-09:30 (WR: 68.6%)</text>

          {/* New York Session (580 to 880) */}
          <rect x="580" y="30" width="300" height="280" fill="url(#nyBoxGrad)" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 2" />
          <text x="590" y="52" fill="#c084fc" fontSize="11" fontWeight="bold">NOWY JORK (12:30 - 21:00 UTC)</text>
          <text x="590" y="68" fill="#94a3b8" fontSize="10">Overlap 12:30 - 16:30 UTC</text>

          {/* DYNAMIC SCENARIO RENDERING BASED ON MODE */}
          {mode === 'WIN' ? (
            /* ========================= WIN SCENARIO ========================= */
            <g>
              {/* London 07:00 pre-push candle */}
              <line x1="330" y1="165" x2="330" y2="195" stroke="#94a3b8" strokeWidth="1" />
              <rect x="325" y="170" width="10" height="20" fill="#10b981" />

              {/* London 08:00 Judas Sweep bar (reaches $1860.40 -> y: 136, 24px above Asian High) */}
              {activePattern === 'PINBAR' && (
                <g>
                  {/* Pinbar wick pushing through Asian High */}
                  <line x1="370" y1="135" x2="370" y2="175" stroke="#f43f5e" strokeWidth="1.5" />
                  {/* Small bearish body closed below Asian High */}
                  <rect x="365" y="165" width="10" height="8" fill="#f43f5e" stroke="#e11d48" strokeWidth="0.5" />
                  {/* Tiny lower nose */}
                  <line x1="370" y1="173" x2="370" y2="175" stroke="#f43f5e" strokeWidth="1" />

                  {/* Measurement caliper: Sweep depth */}
                  <line x1="390" y1="135" x2="390" y2={asiaHighY} stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="390" cy="135" r="2" fill="#10b981" />
                  <circle cx="390" cy={asiaHighY} r="2" fill="#10b981" />
                  <text x="400" y="148" fill="#10b981" fontSize="10" fontWeight="bold">Sweep: +2.45 pts</text>
                  <text x="400" y="160" fill="#94a3b8" fontSize="9">Knot: 74% (Wymagane ≥62%)</text>

                  {/* Signal badge */}
                  <rect x="350" y="105" width="80" height="20" rx="3" fill="#064e3b" stroke="#059669" />
                  <text x="355" y="119" fill="#a7f3d0" fontSize="9" fontWeight="bold">SHORT ENTER 08:15</text>
                </g>
              )}

              {activePattern === 'ENGULFING' && (
                <g>
                  {/* Prior bull candle testing high */}
                  <line x1="355" y1="148" x2="355" y2="175" stroke="#94a3b8" strokeWidth="1" />
                  <rect x="350" y="152" width="10" height="18" fill="#10b981" />
                  {/* Engulfing bear candle: large body engulfing prior */}
                  <line x1="375" y1="140" x2="375" y2="185" stroke="#f43f5e" strokeWidth="1.5" />
                  <rect x="370" y="148" width="11" height="34" fill="#f43f5e" stroke="#e11d48" strokeWidth="0.5" />

                  <text x="395" y="150" fill="#10b981" fontSize="10" fontWeight="bold">Objęcie: 3.40 pts</text>
                  <text x="395" y="162" fill="#94a3b8" fontSize="9">Ratio: 1.88x (Złoty filtr ≥1.30)</text>
                </g>
              )}

              {activePattern === 'DOUBLE_TOP' && (
                <g>
                  {/* Peak 1 */}
                  <line x1="350" y1="140" x2="350" y2="175" stroke="#94a3b8" strokeWidth="1" />
                  <rect x="345" y="150" width="10" height="20" fill="#10b981" />
                  {/* Dip */}
                  <rect x="365" y="165" width="10" height="15" fill="#f43f5e" />
                  {/* Peak 2 with rejection wick */}
                  <line x1="385" y1="142" x2="385" y2="178" stroke="#f43f5e" strokeWidth="1.5" />
                  <rect x="380" y="158" width="10" height="12" fill="#f43f5e" />

                  <text x="405" y="145" fill="#10b981" fontSize="10" fontWeight="bold">Delta szczytów: 0.20 pts</text>
                  <text x="405" y="157" fill="#94a3b8" fontSize="9">Knot 2 szczytu: 61% (≥45%)</text>
                </g>
              )}

              {/* Follow-through candles driving down across London to Asian Mid & Low */}
              <line x1="430" y1="170" x2="430" y2="215" stroke="#f43f5e" strokeWidth="1.2" />
              <rect x="425" y="175" width="10" height="35" fill="#f43f5e" />

              <line x1="465" y1="205" x2="465" y2="242" stroke="#f43f5e" strokeWidth="1.2" />
              <rect x="460" y="210" width="10" height="30" fill="#f43f5e" />

              <line x1="500" y1="230" x2="500" y2="255" stroke="#94a3b8" strokeWidth="1" />
              <rect x="495" y="235" width="10" height="18" fill="#10b981" />

              {/* New York continuation into Asian Low target */}
              <line x1="630" y1="235" x2="630" y2="275" stroke="#f43f5e" strokeWidth="1.5" />
              <rect x="625" y="240" width="10" height="32" fill="#f43f5e" />

              {/* Take profit label at Asian Low */}
              <rect x="650" y="245" width="140" height="24" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
              <text x="658" y="261" fill="#6ee7b7" fontSize="10" fontWeight="bold">TP OSIĄGNIĘTE (1:2.8 R:R)</text>
              <line x1="620" y1="260" x2="650" y2="260" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
            </g>
          ) : (
            /* ========================= LOSS / TRAP SCENARIO ========================= */
            <g>
              {/* Massive runaway sweep (> 5.5 pts blown out) */}
              <line x1="340" y1="165" x2="340" y2="195" stroke="#94a3b8" strokeWidth="1" />
              <rect x="335" y="170" width="10" height="20" fill="#10b981" />

              {/* Blown out candle shooting way up to $1868 (y: 80, 80px above Asian High) */}
              <line x1="375" y1="75" x2="375" y2="165" stroke="#10b981" strokeWidth="1.5" />
              <rect x="370" y="90" width="12" height="70" fill="#10b981" stroke="#059669" />

              {/* Trap warning */}
              <rect x="395" y="70" width="165" height="42" rx="3" fill="#4c0519" stroke="#f43f5e" strokeWidth="1" />
              <text x="403" y="86" fill="#fecdd3" fontSize="10" fontWeight="bold">PUŁAPKA: RUNAWAY BREAKOUT</text>
              <text x="403" y="99" fill="#fca5a5" fontSize="9">Naruszenie: +7.20 pts (&gt; 5.50 pts)</text>
              <text x="403" y="109" fill="#fca5a5" fontSize="8">Knot: 22% (Brak odrzucenia - filtr EA blokuje)</text>

              {/* Continuation bars blowing out early short-sellers */}
              <line x1="440" y1="65" x2="440" y2="105" stroke="#10b981" strokeWidth="1.2" />
              <rect x="435" y="70" width="10" height="30" fill="#10b981" />

              <line x1="480" y1="55" x2="480" y2="95" stroke="#10b981" strokeWidth="1.2" />
              <rect x="475" y="60" width="10" height="25" fill="#10b981" />

              {/* Fake reversal attempt that fails */}
              <line x1="520" y1="60" x2="520" y2="110" stroke="#f43f5e" strokeWidth="1.2" />
              <rect x="515" y="65" width="10" height="20" fill="#f43f5e" />

              {/* NY explosion higher */}
              <line x1="640" y1="40" x2="640" y2="85" stroke="#10b981" strokeWidth="1.5" />
              <rect x="635" y="45" width="11" height="35" fill="#10b981" />

              <rect x="660" y="45" width="180" height="28" rx="3" fill="#4c0519" stroke="#e11d48" />
              <text x="668" y="62" fill="#fda4af" fontSize="10" fontWeight="bold">STOP LOSS BEZ FILTRÓW (-1.0R)</text>
            </g>
          )}

          {/* Time axis ticks at bottom */}
          <text x="60" y="325" fill="#64748b" fontSize="9">00:00 UTC</text>
          <text x="180" y="325" fill="#64748b" fontSize="9">04:00 UTC</text>
          <text x="300" y="325" fill="#fbbf24" fontSize="9" fontWeight="bold">07:00 (Londyn Open)</text>
          <text x="420" y="325" fill="#fbbf24" fontSize="9">10:00 UTC</text>
          <text x="540" y="325" fill="#64748b" fontSize="9">12:00 UTC</text>
          <text x="600" y="325" fill="#c084fc" fontSize="9" fontWeight="bold">13:30 (US Data / Cash Open)</text>
          <text x="740" y="325" fill="#c084fc" fontSize="9">16:30 (London Fix / Close)</text>
          <text x="840" y="325" fill="#64748b" fontSize="9">21:00 UTC</text>
        </svg>
      </div>

      {/* Physics Comparison Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
          <span className="text-slate-400">Głębokość Sweepu (Pts)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-base font-bold ${mode === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {mode === 'WIN' ? '+2.45 pts ($2.45/oz)' : '+7.20 pts ($7.20/oz)'}
            </span>
            <span className="text-slate-500">Filtr EA: 0.8 - 5.5 pts</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {mode === 'WIN' 
              ? 'Optymalna głębokość instytucjonalnego pobrania płynności buy-stops przed dystrybucją.' 
              : 'Przekroczenie 5.50 pts oznacza pełny breakout trendowy — pozycja kontr-trendowa jest zabójstwem.'}
          </p>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
          <span className="text-slate-400">Stosunek Knota (Wick-to-Range)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-base font-bold ${mode === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {mode === 'WIN' ? '74.2% odrzucenia' : '22.0% (słaby knot)'}
            </span>
            <span className="text-slate-500">Próg EA: ≥ 62.0%</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {mode === 'WIN' 
              ? 'Wysoki współczynnik knota dowodzi agresywnej absorpcji zleceń rynkowych i powrotu pod poziom.' 
              : 'Niski knot oznacza dominację kupujących i brak woli odwrócenia przez algorytmy LP.'}
          </p>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
          <span className="text-slate-400">Okno Wykonania & Flipy H1</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-base font-bold ${mode === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {mode === 'WIN' ? '08:15 UTC (Złote Okno)' : '11:45 UTC (Próżnia / Lunch)'}
            </span>
            <span className="text-slate-500">H1: Potwierdzony</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {mode === 'WIN' 
              ? 'Godziny 07:00-09:30 UTC generują 68.6% Win Rate. Świeca H1 domyka się z korpusem >52%.' 
              : 'Godziny 11:00-12:30 charakteryzują się ujemną wartością oczekiwaną i fałszywymi sweepami.'}
          </p>
        </div>
      </div>
    </div>
  );
};
