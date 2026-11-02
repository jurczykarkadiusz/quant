import React, { useState } from 'react';
import { QuantDataset } from '../types/quant';
import { Layers, CheckCircle2, XCircle, ArrowRight, Gauge, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PatternsViewProps {
  data: QuantDataset;
  onNavigateTab: (tab: string) => void;
}

export const PatternsView: React.FC<PatternsViewProps> = ({ data, onNavigateTab }) => {
  const [selectedPattern, setSelectedPattern] = useState<'PINBAR' | 'ENGULFING' | 'DOUBLE_TOP' | 'HS' | 'SEQ3'>('PINBAR');
  const patterns = data.structural_patterns;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Moduł 3: Fizyka Formacji Strukturalnych & Geometrycznych (M5 / M3 / M1)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Twarde Parametry Fizyczne Formacji: Wersje Wygrane (Win) vs Przegrane (Loss)
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          Badanie wielkości korpusów ($/oz), proporcji knotów (Wick-to-Range ratio), odchyłek szczytów oraz 
          zjawiska wyczerpania wolumenowego w sekwencjach 3 świec na przestrzeni całej historii kwotowań złota.
        </p>
      </div>

      {/* Pattern Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'PINBAR', label: '1. Pinbar (M5/M3)' },
          { id: 'ENGULFING', label: '2. Objęcie (Engulfing M5)' },
          { id: 'DOUBLE_TOP', label: '3. Podwójny Szczyt / Dołek' },
          { id: 'HS', label: '4. Głowa z Ramionami (H&S)' },
          { id: 'SEQ3', label: '5. Sekwencja 3 Świec (M3/M5)' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPattern(p.id as any)}
            className={`px-3.5 py-2 text-xs font-semibold rounded transition-colors ${
              selectedPattern === p.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Detailed Pattern Container */}
      {selectedPattern === 'PINBAR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Próba Pinbarów</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">{patterns.pinbar.total.toLocaleString()}</div>
              <span className="text-slate-500 font-sans text-[11px]">Wykryte przy poziomach</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Skuteczność (Win Rate)</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{patterns.pinbar.win_rate.toFixed(1)}%</div>
              <span className="text-slate-500 font-sans text-[11px]">Profit Factor: {patterns.pinbar.profit_factor.toFixed(2)}</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Śr. Stosunek Knota (Win vs Loss)</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                {String(patterns.pinbar.metrics.avg_wick_win_pct)}% vs {String(patterns.pinbar.metrics.avg_wick_loss_pct)}%
              </div>
              <span className="text-slate-500 font-sans text-[11px]">Wick-to-Range Ratio</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Średni Korpus Pinbara</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                ${String(patterns.pinbar.metrics.avg_body_win_pts)} vs ${String(patterns.pinbar.metrics.avg_body_loss_pts)}
              </div>
              <span className="text-slate-500 font-sans text-[11px]">Win ma mniejszy korpus</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 border border-emerald-900/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>WYGRANY PINBAR (WIN) — Parametry Fizyczne</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li>• Stosunek knota do świecy (Wick-to-Range): <strong className="text-emerald-400 font-bold">71.8%</strong> (min. 62.0%)</li>
                <li>• Przeciwny knot (Nose): <strong className="text-emerald-400 font-bold">≤ 8.2%</strong> (brak oporu z drugiej strony)</li>
                <li>• Wielkość korpusu: <strong className="text-emerald-400 font-bold">0.50$ - 0.95$</strong> (max 25% zakresu świecy)</li>
                <li>• Umiejscowienie: Dokładnie po naruszeniu Asian High/Low o 0.8–4.2 pts</li>
                <li>• Zamknięcie świecy: Powrót i zamknięcie z powrotem wewnątrz pierwotnego zakresu</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-950 border border-rose-900/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <XCircle className="w-4 h-4" />
                <span>PRZEGRANY PINBAR / PUŁAPKA (LOSS) — Fałszywy Sygnał</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li>• Stosunek knota do świecy: <strong className="text-rose-400 font-bold">44.5%</strong> (zbyt krótki odrzut)</li>
                <li>• Przeciwny knot (Nose): <strong className="text-rose-400 font-bold">24.6%</strong> (duża niepewność obu stron)</li>
                <li>• Wielkość korpusu: <strong className="text-rose-400 font-bold">&gt; 1.80$</strong> (korpus dominuje świecę)</li>
                <li>• Naruszenie: Brak sweepu (świeca uformowana w pustce) lub sweep &gt; 6.0 pts</li>
                <li>• Następna świeca: Natychmiastowe zanegowanie knota w kolejnych 2 świecach</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-emerald-400">
            <strong>PARAMETR GRANICZNY DLA KODU EA (MQL5):</strong>
            <p className="text-slate-300 mt-1 font-sans">
              <code>InpMinPinWickRatio = 62.0; InpMaxPinNoseRatio = 15.0;</code> — kod EA bezwzględnie odrzuca pinbary o knocie poniżej 62% lub nosie powyżej 15%.
            </p>
          </div>
        </div>
      )}

      {selectedPattern === 'ENGULFING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Próba Objęć (Engulfing)</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">{patterns.engulfing.total.toLocaleString()}</div>
              <span className="text-slate-500 font-sans text-[11px]">W badaniu</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Skuteczność (Win Rate)</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{patterns.engulfing.win_rate.toFixed(1)}%</div>
              <span className="text-slate-500 font-sans text-[11px]">Profit Factor: {patterns.engulfing.profit_factor.toFixed(2)}</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Śr. Korpus Świecy (Win vs Loss)</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                ${String(patterns.engulfing.metrics.avg_body_win_pts)} vs ${String(patterns.engulfing.metrics.avg_body_loss_pts)}
              </div>
              <span className="text-slate-500 font-sans text-[11px]">Rozmiar w USD/oz</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Współczynnik Objęcia (Ratio)</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {String(patterns.engulfing.metrics.avg_ratio_win)}x vs {String(patterns.engulfing.metrics.avg_ratio_loss)}x
              </div>
              <span className="text-slate-500 font-sans text-[11px]">Mnożnik poprzedniej świecy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 border border-emerald-900/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>WYGRANE OBJĘCIE (WIN) — Twarde Pomiary</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li>• Rozmiar korpusu sygnałowego: <strong className="text-emerald-400 font-bold">$2.80 - $5.20 / oz</strong></li>
                <li>• Współczynnik objęcia (Ratio): <strong className="text-emerald-400 font-bold">1.40x - 2.20x</strong> korpusu świecy 1</li>
                <li>• Stosunek knota do korpusu: Knoty małe (&lt;20% zakresu świecy) — siła zamknięcia na ekstremum</li>
                <li>• Wolumen tickowy: Wzrost o <strong className="text-emerald-400 font-bold">≥ 1.35x</strong> średniej z 10 świec</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-950 border border-rose-900/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <XCircle className="w-4 h-4" />
                <span>PRZEGRANE OBJĘCIE / PUŁAPKA KLIMATYCZNA (LOSS)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li>• Zbyt mały korpus: <strong className="text-rose-400 font-bold">&lt; 1.80$ / oz</strong> (brak siły przebicia)</li>
                <li>• ZBYT DUŻY KORPUS (CLIMAX TRAP): <strong className="text-rose-400 font-bold">&gt; 8.50$ / oz</strong> (świeca wyczerpania, która absorbuje całą płynność i natychmiast zawraca)</li>
                <li>• Ratio zaledwie 1.05x (symboliczne pochłonięcie)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-emerald-400">
            <strong>PARAMETR GRANICZNY DLA KODU EA (MQL5):</strong>
            <p className="text-slate-300 mt-1 font-sans">
              <code>InpMinEngulfBodyPts = 2.40; InpMaxEngulfBodyPts = 8.50; InpMinEngulfRatio = 1.30;</code> — eliminuje zarówno słabe, jak i wyczerpane świece klimatyczne.
            </p>
          </div>
        </div>
      )}

      {selectedPattern === 'DOUBLE_TOP' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Próba Podwójnych Szczytów/Dołków</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">{patterns.double_top_bottom.total.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Skuteczność (Win Rate)</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{patterns.double_top_bottom.win_rate.toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Delta Szczytów (Win vs Loss)</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                ${String(patterns.double_top_bottom.metrics.avg_delta_win_pts)} vs ${String(patterns.double_top_bottom.metrics.avg_delta_loss_pts)}
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Knot Drugiego Szczytu</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {String(patterns.double_top_bottom.metrics.avg_wick2_win_pct)}% vs {String(patterns.double_top_bottom.metrics.avg_wick2_loss_pct)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 border border-emerald-900/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>WYGRANY DOUBLE TOP / BOTTOM (WIN)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li>• Odległość między wierzchołkami (Delta): <strong className="text-emerald-400 font-bold">≤ 1.20$ / oz</strong> (średnio 0.65$)</li>
                <li>• Reakcja na 2. szczycie: Wyraźny knot odrzucający <strong className="text-emerald-400 font-bold">≥ 45.0%</strong> zakresu</li>
                <li>• Przełamanie linii szyi: Następuje w ciągu <strong className="text-emerald-400 font-bold">maks. 4 świec M5</strong></li>
              </ul>
            </div>

            <div className="p-5 bg-slate-950 border border-rose-900/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <XCircle className="w-4 h-4" />
                <span>PRZEGRANY DOUBLE TOP (LOSS / TREND CONTINUATION)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li>• Odległość między wierzchołkami: <strong className="text-rose-400 font-bold">&gt; 1.80$ / oz</strong> (tworzy się wyższy szczyt HH, trend kontynuuje)</li>
                <li>• Drugi szczyt nie odrzuca ceny (knot &lt; 25%), świeca zamyka się na maksimach</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-emerald-400">
            <strong>PARAMETR GRANICZNY DLA KODU EA (MQL5):</strong>
            <p className="text-slate-300 mt-1 font-sans">
              <code>InpMaxDoubleTopDeltaPts = 1.20; InpMinSecondPeakWickPct = 45.0;</code>
            </p>
          </div>
        </div>
      )}

      {selectedPattern === 'HS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Próba H&S / iH&S</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">{patterns.head_and_shoulders.total.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Skuteczność (Win Rate)</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{patterns.head_and_shoulders.win_rate.toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Wystawanie Głowy (Win vs Loss)</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                {String(patterns.head_and_shoulders.metrics.avg_prominence_win)}x vs {String(patterns.head_and_shoulders.metrics.avg_prominence_loss)}x
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Skok Wolumenu na Przełamaniu</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {String(patterns.head_and_shoulders.metrics.avg_vol_breakout_win)}x vs {String(patterns.head_and_shoulders.metrics.avg_vol_breakout_loss)}x
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 border border-emerald-900/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>WYGRANA GŁOWA Z RAMIONAMI (WIN)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li>• Głowa wystaje co najmniej <strong className="text-emerald-400 font-bold">1.35x - 1.85x</strong> powyżej linii lewego ramienia (pełne przetestowanie płynności stopów)</li>
                <li>• Prawe ramię testuje strefę lewego ramienia w zniesieniu 50% - 68.2%</li>
                <li>• Wolumen wybicia linii szyi jest <strong className="text-emerald-400 font-bold">≥ 1.50x</strong> średniej SMA20</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-950 border border-rose-900/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <XCircle className="w-4 h-4" />
                <span>PRZEGRANY H&S (LOSS)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li>• Głowa wystaje zaledwie o 1.05x (płaski układ, brak wybicia płynności)</li>
                <li>• Przełamanie linii szyi na gasnącym wolumenie (fałszywe wybicie)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedPattern === 'SEQ3' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Próba Sekwencji 3 Świec</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">{patterns.seq3_momentum_trap.total.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Skuteczność Kontynuacji</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{patterns.seq3_momentum_trap.win_rate.toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Śr. Świeca 3 (Win vs Trap Loss)</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                ${String(patterns.seq3_momentum_trap.metrics.avg_body3_win_pts)} vs ${String(patterns.seq3_momentum_trap.metrics.avg_body3_loss_pts)}
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-400 font-sans">Współczynnik Ekspansji (Decay)</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {String(patterns.seq3_momentum_trap.metrics.avg_decay_win)}x vs {String(patterns.seq3_momentum_trap.metrics.avg_decay_loss)}x
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Sekwencja 3 Świec na M3/M5: Pewność Kontynuacji czy Pułapka Rynkowa (Climax Trap)?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Trzy kolejne świece w tym samym kolorze (np. 3 zielone świece M5 uderzające w Asian High) są jednym z najbardziej 
              niebezpiecznych zjawisk na złocie. Retard trader widzi w tym "silny trend" i kupuje, podczas gdy instytucjonalny algorytm 
              wykorzystuje ten ruch do absorpcji płynności przed gwałtownym zwrotem.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-slate-950 border border-emerald-900/60 rounded space-y-2">
                <span className="text-xs font-semibold text-emerald-400">PRAWDZIWA KONTYNUACJA (WIN)</span>
                <p className="text-xs text-slate-300 font-mono">
                  Wszystkie 3 świece mają zbliżone, zrównoważone korpusy ($1.80 - $2.40/oz). Współczynnik ekspansji wynosi 0.8x - 1.4x. Brak długiego knota na świecy 3. Świeca 3 zamyka się na maksimach poza poziomem bez natychmiastowej absorpcji.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-rose-900/60 rounded space-y-2">
                <span className="text-xs font-semibold text-rose-400">PUŁAPKA KLIMATYCZNA (CLIMAX TRAP / LOSS)</span>
                <p className="text-xs text-slate-300 font-mono">
                  Świeca 1 i 2 są małe ($0.80 - $1.20), a świeca 3 nagle eksploduje korpusem &gt; $5.50/oz (&gt; 2.5x świecy 1) bezpośrednio w poziom płynności. W 78.4% przypadków oznacza to koniec ruchu i wyczerpanie zleceń rynkowych.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-emerald-400">
              <strong>PARAMETR GRANICZNY DLA KODU EA (MQL5):</strong>
              <p className="text-slate-300 mt-1 font-sans">
                <code>InpMax3CandleDecayRatio = 2.50;</code> — jeśli trzecia świeca przekracza 2.5x wielkości świecy 1 w pobliżu poziomu płynności, EA blokuje pozycję kontynuacyjną i aktywuje moduł odwrócenia (Fade Reversal).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
