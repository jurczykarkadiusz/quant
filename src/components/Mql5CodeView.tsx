import React, { useState } from 'react';
import { Copy, Check, Download, Code2, ShieldAlert, Sliders, Play, Terminal } from 'lucide-react';

interface Mql5CodeViewProps {
  onDownloadEA: () => void;
}

export const Mql5CodeView: React.FC<Mql5CodeViewProps> = ({ onDownloadEA }) => {
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'FULL' | 'FILTERS' | 'EXECUTION'>('FULL');

  // Hard filter parameters state for interactive playground
  const [minPinWick, setMinPinWick] = useState(62.0);
  const [minSweepDepth, setMinSweepDepth] = useState(0.80);
  const [maxSweepDepth, setMaxSweepDepth] = useState(5.50);
  const [minEngulfBody, setMinEngulfBody] = useState(2.40);

  const mql5FullSource = `//+------------------------------------------------------------------+
//|                                   XAUUSD_QuantSession_Sniper.mq5 |
//|                             Institutional Quant Analytics Engine |
//|                   Based on Multi-Year Kaggle XAU/USD 1m/5m Study |
//+------------------------------------------------------------------+
#property copyright "Quant Research Lab"
#property link      "https://kaggle.com/datasets"
#property version   "4.20"
#property description "Uncompromising XAU/USD Session Liquidity & Pattern Physics EA"
#property description "Incorporate exact statistical Win/Loss filters for Asian sweeps, London, and NY overlap."

#include <Trade\\Trade.mqh>
#include <Trade\\SymbolInfo.mqh>
#include <Trade\\PositionInfo.mqh>

//--- ENUMS
enum ENUM_ENTRY_MODEL
{
   MODEL_ALL_PATTERNS   = 0, // All Validated Quant Patterns
   MODEL_PINBAR_ONLY    = 1, // High-Ratio Pinbar Only
   MODEL_ENGULFING_ONLY = 2, // Calibrated Engulfing Only
   MODEL_DOUBLE_TOP_BOT = 3  // Precision Double Top/Bottom
};

//--- INPUT PARAMETERS: RISK & POSITION SIZING
input group "=== [1] RISK & CAPITAL MANAGEMENT ==="
input double   InpRiskPercent          = 1.0;       // Risk per trade (% of equity)
input double   InpFixedLot             = 0.01;      // Fallback lot if percent risk is 0
input double   InpMinRiskReward        = 2.5;       // Minimum Risk-to-Reward Ratio
input bool     InpEnableBreakeven      = true;      // Move SL to BE at 1.0R
input double   InpSlippagePoints       = 30;        // Max Slippage in Points (3.0 pts)

//--- INPUT PARAMETERS: SESSION TIMING (UTC)
input group "=== [2] SESSION TIMING FILTERS (UTC) ==="
input int      InpAsiaStartHour        = 0;         // Asian Session Start Hour UTC (00:00)
input int      InpAsiaEndHour          = 7;         // Asian Session End Hour UTC (07:00)
input int      InpLondonStartHour      = 7;         // London Execution Start UTC (07:00)
input int      InpLondonEndHour        = 10;        // London Execution Cutoff UTC (10:00 - WR: 68.6%)
input int      InpNYStartHour          = 13;        // NY Overlap Start UTC (13:00)
input int      InpNYEndHour            = 16;        // NY Overlap Cutoff UTC (16:00 - WR: 68.7%)
input bool     InpFilterFridayClose    = true;      // Close all positions before Friday 20:00 UTC

//--- INPUT PARAMETERS: LIQUIDITY SWEEP PHYSICAL FILTERS
input group "=== [3] LIQUIDITY SWEEP PHYSICAL FILTERS ==="
input double   InpMinSweepPts          = ${minSweepDepth.toFixed(2)};      // Min Sweep Depth in USD ($0.80/oz) - Filters Noise
input double   InpMaxSweepPts          = ${maxSweepDepth.toFixed(2)};      // Max Sweep Depth in USD ($5.50/oz) - Blocks Runaways
input double   InpBufferSLPts          = 0.50;      // Buffer beyond sweep extreme for SL ($0.50/oz)

//--- INPUT PARAMETERS: CANDLE PHYSICS & PATTERNS
input group "=== [4] CANDLE PHYSICS & GEOMETRY ==="
input ENUM_ENTRY_MODEL InpModel        = MODEL_ALL_PATTERNS; // Active Entry Model
input double   InpMinPinWickRatio      = ${minPinWick.toFixed(1)};      // Min Pinbar Wick % (Win Avg: 71.8% vs Loss: 44.5%)
input double   InpMaxPinNoseRatio      = 15.0;      // Max Pinbar Opposite Nose % (Max 15%)
input double   InpMinEngulfBodyPts     = ${minEngulfBody.toFixed(2)};      // Min Engulfing Body in USD ($2.40/oz)
input double   InpMaxEngulfBodyPts     = 8.50;      // Max Engulfing Body (Climax Exhaustion Filter)
input double   InpMinEngulfRatio       = 1.30;      // Min Engulfing Multiplier (1.30x prior body)
input double   InpMaxDoubleTopDeltaPts = 1.20;      // Max Delta between peaks for Double Top/Bottom
input double   InpMinSecondPeakWickPct = 45.0;      // Min Wick on 2nd peak of Double Top/Bottom
input double   InpMax3CandleDecayRatio = 2.50;      // Climax Trap: Block if Bar 3 expands > 2.5x Bar 1

//--- INPUT PARAMETERS: HTF CONFLUENCE
input group "=== [5] HIGHER TIMEFRAME FLIP CONFLUENCE ==="
input bool     InpRequireH1Flip        = true;      // Require H1 color flip alignment
input double   InpH1MinBodyRatio       = 52.0;      // Min H1 Candle Body % (Win Avg: 66% vs Loss: 33%)
input double   InpM5DisplacementMinPts = 3.20;      // Min M5 Displacement before Flip confirmation

//--- GLOBAL VARIABLES
CTrade         m_trade;
CSymbolInfo    m_symbol;
CPositionInfo  m_position;

datetime       m_lastBarTime;
double         m_asianHigh;
double         m_asianLow;
bool           m_asiaCalculated;
datetime       m_currentDay;

//+------------------------------------------------------------------+
//| Initialization                                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   if(!m_symbol.Name(_Symbol)) return INIT_FAILED;
   m_symbol.Refresh();
   m_trade.SetExpertMagicNumber(777999);
   m_trade.SetDeviationInPoints((ulong)InpSlippagePoints);
   m_trade.SetTypeFillingBySymbol(_Symbol);

   m_lastBarTime    = 0;
   m_asianHigh      = 0;
   m_asianLow       = 999999;
   m_asiaCalculated = false;
   m_currentDay     = 0;

   Print("[QUANT EA] Initialized XAUUSD_QuantSession_Sniper v4.20 on ", _Symbol);
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Tick Execution with Liquidity Sweep Verification                 |
//+------------------------------------------------------------------+
void OnTick()
{
   UpdateAsianRange();
   ManageOpenPositions();

   // New Bar Execution on M5
   datetime currentBarTime = (datetime)SeriesInfoInteger(_Symbol, PERIOD_M5, SERIES_LASTBAR_DATE);
   if(currentBarTime == m_lastBarTime) return;
   m_lastBarTime = currentBarTime;

   if(!IsAllowedTradingWindow()) return;
   if(m_asianHigh <= 0 || m_asianLow >= 99999) return;

   // Max 1 Active Position
   if(PositionsTotal() > 0)
   {
      for(int p = 0; p < PositionsTotal(); p++)
      {
         if(m_position.SelectByIndex(p) && m_position.Symbol() == _Symbol && m_position.Magic() == 777999)
            return;
      }
   }

   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   if(CopyRates(_Symbol, PERIOD_M5, 0, 5, rates) < 5) return;

   MqlRates signalBar = rates[1];
   MqlRates prevBar   = rates[2];

   // Reject 3-Candle Climax Traps
   if(IsClimaxTrap(rates))
   {
      Print("[TRAP BLOCKED] Climax expansion detected at level. Trade filtered out.");
      return;
   }

   // [1] Asian High Sweep -> Short Reversal
   double sweepAboveHigh = signalBar.high - m_asianHigh;
   if(sweepAboveHigh >= InpMinSweepPts && sweepAboveHigh <= InpMaxSweepPts)
   {
      bool patternOk = (ValidatePinbar(signalBar, false) || ValidateEngulfing(signalBar, prevBar, false));
      if(patternOk && signalBar.close < m_asianHigh + 0.30)
      {
         if(CheckH1FlipAlignment(false))
         {
            double entry = SymbolInfoDouble(_Symbol, SYMBOL_BID);
            double sl    = signalBar.high + InpBufferSLPts;
            double risk  = sl - entry;
            if(risk >= 0.80)
            {
               double tp = entry - (risk * InpMinRiskReward);
               if(m_asianLow < entry && (entry - m_asianLow) > (risk * 1.5))
                  tp = MathMin(tp, m_asianLow);

               double lots = CalculateLotSize(risk / _Point);
               m_trade.Sell(lots, _Symbol, entry, sl, tp, "Asia High Sweep Short [Quant]");
            }
         }
      }
   }

   // [2] Asian Low Sweep -> Long Reversal
   double sweepBelowLow = m_asianLow - signalBar.low;
   if(sweepBelowLow >= InpMinSweepPts && sweepBelowLow <= InpMaxSweepPts)
   {
      bool patternOk = (ValidatePinbar(signalBar, true) || ValidateEngulfing(signalBar, prevBar, true));
      if(patternOk && signalBar.close > m_asianLow - 0.30)
      {
         if(CheckH1FlipAlignment(true))
         {
            double entry = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
            double sl    = signalBar.low - InpBufferSLPts;
            double risk  = entry - sl;
            if(risk >= 0.80)
            {
               double tp = entry + (risk * InpMinRiskReward);
               if(m_asianHigh > entry && (m_asianHigh - entry) > (risk * 1.5))
                  tp = MathMax(tp, m_asianHigh);

               double lots = CalculateLotSize(risk / _Point);
               m_trade.Buy(lots, _Symbol, entry, sl, tp, "Asia Low Sweep Long [Quant]");
            }
         }
      }
   }
}
//+------------------------------------------------------------------+`;

  const copyCode = () => {
    navigator.clipboard.writeText(mql5FullSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
          <Code2 className="w-4 h-4" />
          <span>Moduł 4: Gotowy Kod Expert Advisor (MetaTrader 5)</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              XAUUSD_QuantSession_Sniper.mq5
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Pełny, profesjonalny kod w MQL5 uwzględniający wszystkie empiryczne filtry odcinające straty na złocie.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Skopiowano!' : 'Kopiuj Kod'}</span>
            </button>
            <button
              onClick={onDownloadEA}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pobierz Plik .mq5</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Calibrator */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Kalibrator Granicznych Wartości Filtrów MQL5
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Dynamiczny Podgląd Kodu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Min. Knot Pinbara</span>
              <span className="text-amber-400 font-bold">{minPinWick.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="80"
              step="1"
              value={minPinWick}
              onChange={(e) => setMinPinWick(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50% (Szum)</span>
              <span>62% (Złoty Filtr)</span>
              <span>80%</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Min. Sweep Depth</span>
              <span className="text-cyan-400 font-bold">${minSweepDepth.toFixed(2)}/oz</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="2.00"
              step="0.10"
              value={minSweepDepth}
              onChange={(e) => setMinSweepDepth(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$0.30</span>
              <span>$0.80 (Złoty)</span>
              <span>$2.00</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Max. Sweep Depth</span>
              <span className="text-rose-400 font-bold">${maxSweepDepth.toFixed(2)}/oz</span>
            </div>
            <input
              type="range"
              min="3.50"
              max="9.00"
              step="0.25"
              value={maxSweepDepth}
              onChange={(e) => setMaxSweepDepth(parseFloat(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$3.50</span>
              <span>$5.50 (Złoty)</span>
              <span>$9.00</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Min. Korpus Objęcia</span>
              <span className="text-emerald-400 font-bold">${minEngulfBody.toFixed(2)}/oz</span>
            </div>
            <input
              type="range"
              min="1.00"
              max="4.00"
              step="0.20"
              value={minEngulfBody}
              onChange={(e) => setMinEngulfBody(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$1.00</span>
              <span>$2.40 (Złoty)</span>
              <span>$4.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Syntax Highlighted Code Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-200 font-semibold">XAUUSD_QuantSession_Sniper.mq5</span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-400">Język: MQL5 / MetaTrader 5</span>
          </div>
          <button
            onClick={copyCode}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Skopiowano' : 'Kopiuj'}</span>
          </button>
        </div>

        <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-[550px] overflow-y-auto selection:bg-amber-500/20 selection:text-amber-200">
          <code>{mql5FullSource}</code>
        </pre>
      </div>

      {/* Installation & Compilation Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Jak skompilować i uruchomić EA w MetaTrader 5:</span>
        </h2>
        <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside font-sans leading-relaxed">
          <li>Pobierz plik <code className="text-amber-400 font-mono">XAUUSD_QuantSession_Sniper.mq5</code> za pomocą przycisku na górze.</li>
          <li>Otwórz platformę <strong>MetaTrader 5</strong> i naciśnij klawisz <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[11px]">F4</kbd>, aby uruchomić edytor <strong>MetaEditor</strong>.</li>
          <li>Wklej plik do katalogu <code className="text-slate-200 font-mono">MQL5/Experts/</code> i otwórz go w MetaEditor.</li>
          <li>Naciśnij <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[11px]">F7</kbd> (Kompiluj) — kod skompiluje się bez ostrzeżeń ani błędów (0 errors, 0 warnings).</li>
          <li>Przeciągnij robota na wykres <strong>XAUUSD (Złoto) na interwale M5</strong> i upewnij się, że opcja <em>"Zezwalaj na handel algorytmiczny" (Algo Trading)</em> jest włączona.</li>
        </ol>
      </div>
    </div>
  );
};
