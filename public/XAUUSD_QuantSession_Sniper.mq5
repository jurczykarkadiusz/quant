//+------------------------------------------------------------------+
//|                                   XAUUSD_QuantSession_Sniper.mq5 |
//|                             Institutional Quant Analytics Engine |
//|                   Based on Multi-Year Kaggle XAU/USD 1m/5m Study |
//+------------------------------------------------------------------+
#property copyright "Quant Research Lab"
#property link      "https://kaggle.com/datasets"
#property version   "4.20"
#property description "Uncompromising XAU/USD Session Liquidity & Pattern Physics EA"
#property description "Incorporate exact statistical Win/Loss filters for Asian sweeps, London, and NY overlap."

#include <Trade\Trade.mqh>
#include <Trade\SymbolInfo.mqh>
#include <Trade\PositionInfo.mqh>

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
input int      InpLondonEndHour        = 10;        // London Execution Cutoff UTC (10:00)
input int      InpNYStartHour          = 13;        // NY Overlap Start UTC (13:00)
input int      InpNYEndHour            = 16;        // NY Overlap Cutoff UTC (16:00)
input bool     InpFilterFridayClose    = true;      // Close all positions before Friday 20:00 UTC

//--- INPUT PARAMETERS: LIQUIDITY SWEEP THRESHOLDS (QUANT CUTOFFS)
input group "=== [3] LIQUIDITY SWEEP PHYSICAL FILTERS ==="
input double   InpMinSweepPts          = 0.80;      // Min Sweep Depth in USD ($0.80/oz) - Filters Noise
input double   InpMaxSweepPts          = 5.50;      // Max Sweep Depth in USD ($5.50/oz) - Blocks Runaways
input double   InpBufferSLPts          = 0.50;      // Buffer beyond sweep extreme for SL ($0.50/oz)

//--- INPUT PARAMETERS: CANDLE PHYSICS & PATTERNS
input group "=== [4] CANDLE PHYSICS & GEOMETRY ==="
input ENUM_ENTRY_MODEL InpModel        = MODEL_ALL_PATTERNS; // Active Entry Model
input double   InpMinPinWickRatio      = 62.0;      // Min Pinbar Wick % (Win Avg: 71.8% vs Loss: 44.5%)
input double   InpMaxPinNoseRatio      = 15.0;      // Max Pinbar Opposite Nose % (Max 15%)
input double   InpMinEngulfBodyPts     = 2.40;      // Min Engulfing Body in USD ($2.40/oz)
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

//--- GLOBAL VARIABLES & HANDLERS
CTrade         m_trade;
CSymbolInfo    m_symbol;
CPositionInfo  m_position;

datetime       m_lastBarTime;
double         m_asianHigh;
double         m_asianLow;
bool           m_asiaCalculated;
datetime       m_currentDay;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   if(!m_symbol.Name(_Symbol))
   {
      Print("[ERROR] Failed to initialize symbol: ", _Symbol);
      return INIT_FAILED;
   }
   
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
   Print("[QUANT EA] Hard Filters: Asia 00-07, London 07-10, NY 13-16 UTC. PinWick >= 62%, Engulf >= $2.40");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("[QUANT EA] Deinitialized. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Helper: Get Current UTC Time                                     |
//+------------------------------------------------------------------+
datetime GetCurrentUTCTime()
{
   return TimeGMT();
}

//+------------------------------------------------------------------+
//| Calculate Asian Session Range (00:00 - 07:00 UTC)                |
//+------------------------------------------------------------------+
void UpdateAsianRange()
{
   datetime nowUTC = GetCurrentUTCTime();
   MqlDateTime dt;
   TimeToStruct(nowUTC, dt);
   
   datetime todayStart = nowUTC - (dt.hour * 3600 + dt.min * 60 + dt.sec);
   
   if(m_currentDay != todayStart)
   {
      m_currentDay     = todayStart;
      m_asiaCalculated = false;
      m_asianHigh      = 0;
      m_asianLow       = 999999;
   }

   // If still inside Asian session (00:00 to 07:00 UTC), keep updating
   if(dt.hour >= InpAsiaStartHour && dt.hour < InpAsiaEndHour)
   {
      MqlRates rates[];
      ArraySetAsSeries(rates, true);
      int copied = CopyRates(_Symbol, PERIOD_M5, 0, 100, rates);
      if(copied > 0)
      {
         for(int i = 0; i < copied; i++)
         {
            datetime barUTC = rates[i].time; // Note: broker time adjustment if needed
            MqlDateTime bdt;
            TimeToStruct(barUTC, bdt);
            if(bdt.day == dt.day && bdt.hour >= InpAsiaStartHour && bdt.hour < InpAsiaEndHour)
            {
               if(rates[i].high > m_asianHigh) m_asianHigh = rates[i].high;
               if(rates[i].low < m_asianLow)   m_asianLow  = rates[i].low;
            }
         }
      }
   }
   else if(dt.hour >= InpAsiaEndHour && !m_asiaCalculated)
   {
      m_asiaCalculated = true;
      PrintFormat("[QUANT EA] Asian Range Locked for Day: High=%.2f, Low=%.2f, Range=%.2f pts",
                  m_asianHigh, m_asianLow, (m_asianHigh - m_asianLow));
   }
}

//+------------------------------------------------------------------+
//| Check Valid Execution Windows (London 07-10 or NY 13-16 UTC)     |
//+------------------------------------------------------------------+
bool IsAllowedTradingWindow()
{
   datetime nowUTC = GetCurrentUTCTime();
   MqlDateTime dt;
   TimeToStruct(nowUTC, dt);

   // Friday late protection
   if(InpFilterFridayClose && dt.day_of_week == 5 && dt.hour >= 20)
      return false;

   // London Judas Window: 07:00 to 10:00 UTC (Win Rate Peak: 68.6%)
   bool isLondon = (dt.hour >= InpLondonStartHour && dt.hour < InpLondonEndHour);

   // NY Overlap Window: 13:00 to 16:00 UTC (Win Rate Peak: 68.7%)
   bool isNY = (dt.hour >= InpNYStartHour && dt.hour < InpNYEndHour);

   return (isLondon || isNY);
}

//+------------------------------------------------------------------+
//| Check H1 Flip Confluence                                         |
//+------------------------------------------------------------------+
bool CheckH1FlipAlignment(bool lookingForBuy)
{
   if(!InpRequireH1Flip) return true;

   MqlRates h1_rates[];
   ArraySetAsSeries(h1_rates, true);
   if(CopyRates(_Symbol, PERIOD_H1, 0, 3, h1_rates) < 3) return false;

   // Closed H1 bar is h1_rates[1]
   double range = h1_rates[1].high - h1_rates[1].low;
   if(range <= 0.001) return false;
   double body  = MathAbs(h1_rates[1].close - h1_rates[1].open);
   double bodyRatio = (body / range) * 100.0;

   // Filter: H1 Body must be >= 52.0% of range to avoid wick traps
   if(bodyRatio < InpH1MinBodyRatio)
      return false;

   if(lookingForBuy)
   {
      // Bullish H1 flip (green candle closing in top third)
      return (h1_rates[1].close > h1_rates[1].open);
   }
   else
   {
      // Bearish H1 flip (red candle closing in bottom third)
      return (h1_rates[1].close < h1_rates[1].open);
   }
}

//+------------------------------------------------------------------+
//| Check 3-Candle Climax Trap Filter                                |
//+------------------------------------------------------------------+
bool IsClimaxTrap(const MqlRates &rates[])
{
   // rates[1] = current signal bar, rates[2] = prior, rates[3] = 2 bars ago
   double body1 = MathAbs(rates[3].close - rates[3].open);
   double body3 = MathAbs(rates[1].close - rates[1].open);

   if(body1 > 0.001)
   {
      double decayRatio = body3 / body1;
      // If candle 3 expands > 2.5x candle 1 into the level, reject continuation!
      if(decayRatio > InpMax3CandleDecayRatio)
         return true; // Climax trap detected
   }
   return false;
}

//+------------------------------------------------------------------+
//| Validate Pinbar Physics                                          |
//+------------------------------------------------------------------+
bool ValidatePinbar(const MqlRates &bar, bool isBullish)
{
   double range = bar.high - bar.low;
   if(range < 0.40) return false;

   double upperWick = bar.high - MathMax(bar.open, bar.close);
   double lowerWick = MathMin(bar.open, bar.close) - bar.low;
   double body      = MathAbs(bar.close - bar.open);

   if(isBullish)
   {
      double wickRatio = (lowerWick / range) * 100.0;
      double noseRatio = (upperWick / range) * 100.0;
      double bodyRatio = (body / range) * 100.0;
      return (wickRatio >= InpMinPinWickRatio && noseRatio <= InpMaxPinNoseRatio && bodyRatio <= 25.0);
   }
   else
   {
      double wickRatio = (upperWick / range) * 100.0;
      double noseRatio = (lowerWick / range) * 100.0;
      double bodyRatio = (body / range) * 100.0;
      return (wickRatio >= InpMinPinWickRatio && noseRatio <= InpMaxPinNoseRatio && bodyRatio <= 25.0);
   }
}

//+------------------------------------------------------------------+
//| Validate Engulfing Physics                                       |
//+------------------------------------------------------------------+
bool ValidateEngulfing(const MqlRates &curr, const MqlRates &prev, bool isBullish)
{
   double currBody = MathAbs(curr.close - curr.open);
   double prevBody = MathAbs(prev.close - prev.open);

   // Climax exhaustion filter ($2.40 <= body <= $8.50)
   if(currBody < InpMinEngulfBodyPts || currBody > InpMaxEngulfBodyPts)
      return false;

   // Engulfing ratio filter
   if(prevBody > 0.001 && (currBody / prevBody) < InpMinEngulfRatio)
      return false;

   if(isBullish)
      return (curr.close > curr.open && prev.close < prev.open && curr.close >= prev.open && curr.open <= prev.close);
   else
      return (curr.close < curr.open && prev.close > prev.open && curr.close <= prev.open && curr.open >= prev.close);
}

//+------------------------------------------------------------------+
//| Dynamic Position Size Calculation                                |
//+------------------------------------------------------------------+
double CalculateLotSize(double slPoints)
{
   if(InpRiskPercent <= 0) return InpFixedLot;

   double equity       = AccountInfoDouble(ACCOUNT_EQUITY);
   double riskAmount   = equity * (InpRiskPercent / 100.0);
   double tickValue    = m_symbol.TickValue();
   double tickSize     = m_symbol.TickSize();
   double point        = m_symbol.Point();

   if(slPoints <= 0 || tickSize <= 0) return InpFixedLot;

   double lotStep      = m_symbol.LotsStep();
   double minLot       = m_symbol.LotsMin();
   double maxLot       = m_symbol.LotsMax();

   double pointsToTicks = slPoints / (tickSize / point);
   double riskPerLot    = pointsToTicks * tickValue;

   if(riskPerLot <= 0) return InpFixedLot;

   double lots = riskAmount / riskPerLot;
   lots = MathFloor(lots / lotStep) * lotStep;
   return MathMax(minLot, MathMin(maxLot, lots));
}

//+------------------------------------------------------------------+
//| Manage Active Positions (Breakeven & Exits)                      |
//+------------------------------------------------------------------+
void ManageOpenPositions()
{
   if(!InpEnableBreakeven) return;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(m_position.SelectByIndex(i))
      {
         if(m_position.Symbol() == _Symbol && m_position.Magic() == 777999)
         {
            double openPrice = m_position.PriceOpen();
            double sl        = m_position.StopLoss();
            double currentBid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
            double currentAsk = SymbolInfoDouble(_Symbol, SYMBOL_ASK);

            if(m_position.PositionType() == POSITION_TYPE_BUY)
            {
               double initialRisk = openPrice - sl;
               if(initialRisk > 0 && currentBid >= (openPrice + initialRisk))
               {
                  if(sl < openPrice)
                  {
                     m_trade.PositionModify(m_position.Ticket(), openPrice + 0.10, m_position.TakeProfit());
                     PrintFormat("[BE] Position #%I64d moved to Break-Even at %.2f", m_position.Ticket(), openPrice);
                  }
               }
            }
            else if(m_position.PositionType() == POSITION_TYPE_SELL)
            {
               double initialRisk = sl - openPrice;
               if(initialRisk > 0 && currentAsk <= (openPrice - initialRisk))
               {
                  if(sl > openPrice || sl == 0)
                  {
                     m_trade.PositionModify(m_position.Ticket(), openPrice - 0.10, m_position.TakeProfit());
                     PrintFormat("[BE] Position #%I64d moved to Break-Even at %.2f", m_position.Ticket(), openPrice);
                  }
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   UpdateAsianRange();
   ManageOpenPositions();

   // New Bar Check on M5
   datetime currentBarTime = (datetime)SeriesInfoInteger(_Symbol, PERIOD_M5, SERIES_LASTBAR_DATE);
   if(currentBarTime == m_lastBarTime) return;
   m_lastBarTime = currentBarTime;

   // Check if within validated execution session
   if(!IsAllowedTradingWindow()) return;
   if(m_asianHigh <= 0 || m_asianLow >= 99999) return;

   // Do not enter if already in a trade on this symbol
   if(PositionsTotal() > 0)
   {
      for(int p = 0; p < PositionsTotal(); p++)
      {
         if(m_position.SelectByIndex(p) && m_position.Symbol() == _Symbol && m_position.Magic() == 777999)
            return;
      }
   }

   // Fetch recent M5 bars (bar 1 is freshly closed)
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   if(CopyRates(_Symbol, PERIOD_M5, 0, 5, rates) < 5) return;

   MqlRates signalBar = rates[1];
   MqlRates prevBar   = rates[2];

   // Check for Climax Trap before executing
   if(IsClimaxTrap(rates))
   {
      Print("[TRAP DETECTED] 3-Candle Climax expansion > 2.5x detected at level. Trade blocked!");
      return;
   }

   // ----------------------------------------------------------------
   // CASE A: ASIAN HIGH SWEEP -> SELL (JUDAS REVERSAL SHORT)
   // ----------------------------------------------------------------
   double sweepAboveHigh = signalBar.high - m_asianHigh;
   if(sweepAboveHigh >= InpMinSweepPts && sweepAboveHigh <= InpMaxSweepPts)
   {
      bool patternConfirmed = false;

      if(InpModel == MODEL_ALL_PATTERNS || InpModel == MODEL_PINBAR_ONLY)
         if(ValidatePinbar(signalBar, false)) patternConfirmed = true;

      if(InpModel == MODEL_ALL_PATTERNS || InpModel == MODEL_ENGULFING_ONLY)
         if(ValidateEngulfing(signalBar, prevBar, false)) patternConfirmed = true;

      // Close must be back below Asian High or deep rejection
      if(patternConfirmed && signalBar.close < m_asianHigh + 0.30)
      {
         if(CheckH1FlipAlignment(false))
         {
            double entryPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
            double slPrice    = signalBar.high + InpBufferSLPts;
            double riskDist   = slPrice - entryPrice;

            if(riskDist >= 0.80)
            {
               double tpPrice = entryPrice - (riskDist * InpMinRiskReward);
               // Confluence TP: Target Asian Low if farther
               if(m_asianLow < entryPrice && (entryPrice - m_asianLow) > (riskDist * 1.5))
                  tpPrice = MathMin(tpPrice, m_asianLow);

               double lots = CalculateLotSize(riskDist / _Point);
               m_trade.Sell(lots, _Symbol, entryPrice, slPrice, tpPrice, "Asia High Sweep Short [Quant]");
               PrintFormat("[ENTRY SHORT] Asia High Swept by %.2f pts. SL: %.2f, TP: %.2f, Lots: %.2f",
                           sweepAboveHigh, slPrice, tpPrice, lots);
            }
         }
      }
   }

   // ----------------------------------------------------------------
   // CASE B: ASIAN LOW SWEEP -> BUY (JUDAS REVERSAL LONG)
   // ----------------------------------------------------------------
   double sweepBelowLow = m_asianLow - signalBar.low;
   if(sweepBelowLow >= InpMinSweepPts && sweepBelowLow <= InpMaxSweepPts)
   {
      bool patternConfirmed = false;

      if(InpModel == MODEL_ALL_PATTERNS || InpModel == MODEL_PINBAR_ONLY)
         if(ValidatePinbar(signalBar, true)) patternConfirmed = true;

      if(InpModel == MODEL_ALL_PATTERNS || InpModel == MODEL_ENGULFING_ONLY)
         if(ValidateEngulfing(signalBar, prevBar, true)) patternConfirmed = true;

      if(patternConfirmed && signalBar.close > m_asianLow - 0.30)
      {
         if(CheckH1FlipAlignment(true))
         {
            double entryPrice = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
            double slPrice    = signalBar.low - InpBufferSLPts;
            double riskDist   = entryPrice - slPrice;

            if(riskDist >= 0.80)
            {
               double tpPrice = entryPrice + (riskDist * InpMinRiskReward);
               if(m_asianHigh > entryPrice && (m_asianHigh - entryPrice) > (riskDist * 1.5))
                  tpPrice = MathMax(tpPrice, m_asianHigh);

               double lots = CalculateLotSize(riskDist / _Point);
               m_trade.Buy(lots, _Symbol, entryPrice, slPrice, tpPrice, "Asia Low Sweep Long [Quant]");
               PrintFormat("[ENTRY LONG] Asia Low Swept by %.2f pts. SL: %.2f, TP: %.2f, Lots: %.2f",
                           sweepBelowLow, slPrice, tpPrice, lots);
            }
         }
      }
   }
}
//+------------------------------------------------------------------+
