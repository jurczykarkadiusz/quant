import React, { useState } from 'react';
import { QuantDataset, HourlySweepMetric } from '../types/quant';
import { Clock, TrendingUp, AlertCircle, CheckCircle, BarChart3, Filter } from 'lucide-react';

interface SessionsViewProps {
  data: QuantDataset;
}

export const SessionsView: React.FC<SessionsViewProps> = ({ data }) => {
  const [activeSession, setActiveSession] = useState<'ALL' | 'LONDON' | 'NY'>('ALL');
  const asia = data.sessions.asian_session;
  const londonHourly = data.sessions.london_session.hourly_breakdown;
  const nyHourly = data.sessions.new_york_session.hourly_breakdown;

  // Aggregate stats
  const totalLondonSweeps = londonHourly.reduce((acc, h) => acc + h.total_sweeps, 0);
  const totalLondonWins = londonHourly.reduce((acc, h) => acc + h.wins, 0);
  const totalLondonLosses = londonHourly.reduce((acc, h) => acc + h.losses, 0);
  const avgLondonWinRate = totalLondonSweeps > 0 ? (totalLondonWins / totalLondonSweeps) * 100 : 0;

  const totalNYSweeps = nyHourly.reduce((acc, h) => acc + h.total_sweeps, 0);
  const totalNYWins = nyHourly.reduce((acc, h) => acc + h.wins, 0);
  const totalNYLosses = nyHourly.reduce((acc, h) => acc + h.losses, 0);
  const avgNYWinRate = totalNYSweeps > 0 ? (totalNYWins / totalNYSweeps) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Moduł 1: Cykl Dobowy Płynności & Sweepy Sesyjne</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Pełne Sesje: Azja (00-07 UTC) → Cały Londyn (07-16 UTC) → Cały Nowy Jork (12:30-21 UTC)
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          Rygorystyczne badanie każdego naruszenia (Sweep) poziomów Asian High oraz Asian Low w pełnych godzinach
          sesji europejskiej i amerykańskiej. Podział wyników na wygrane (skuteczny powrót i realizacja R:R) oraz przegrane 
          (ucieczka trendowa i brak odrzucenia).
        </p>
      </div>

      {/* Asian Session Foundation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Faza 1: Budowa Zakresu</div>
            <h2 className="text-lg font-bold text-white">Sesja Azjatycka (00:00 – 07:00 UTC)</h2>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Interwał bazowy: M5 (84 świece w oknie azjatyckim)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded">
            <span className="text-slate-400 font-sans">Średni Zakres Azji (Asian Range)</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">${asia.avg_range_pts.toFixed(2)} / oz</div>
            <p className="text-[11px] text-slate-500 font-sans mt-1">
              Rozpiętość między Asian High a Asian Low na przestrzeni 1 250 sesji.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded">
            <span className="text-slate-400 font-sans">Częstotliwość Naruszenia w Londynie</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{asia.london_sweep_frequency_pct.toFixed(1)}% sesji</div>
            <p className="text-[11px] text-slate-500 font-sans mt-1">
              Prawie 3 na 4 dni notują atak na płynność Azji już w oknie europejskim.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded">
            <span className="text-slate-400 font-sans">Częstotliwość Naruszenia w Nowym Jorku</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">{asia.ny_sweep_frequency_pct.toFixed(1)}% sesji</div>
            <p className="text-[11px] text-slate-500 font-sans mt-1">
              Do końca sesji NY co najmniej jedno z ekstremów Azji zostaje wybite w 87% dni.
            </p>
          </div>
        </div>
      </div>

      {/* Session Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-400 mr-2">Widok Sesji:</span>
        {(['ALL', 'LONDON', 'NY'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSession(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeSession === tab
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'Wszystkie Godziny (07:00 - 21:00 UTC)' : tab === 'LONDON' ? 'Cały Londyn (07:00 - 16:00)' : 'Cały Nowy Jork (12:30 - 21:00)'}
          </button>
        ))}
      </div>

      {/* Full London Session Table (07:00 - 16:00 UTC) */}
      {(activeSession === 'ALL' || activeSession === 'LONDON') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h2 className="text-base font-bold text-white">
                  Cała Sesja Londyńska (07:00 – 16:00 UTC): Rozbicie Godzinowe
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Porównanie wygranych (Win) i przegranych (Loss) sweepów poziomów Azji dla każdej godziny z osobna.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">Średni WR Całego Londynu:</span>
              <span className="text-amber-400 font-bold">{avgLondonWinRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/70 font-semibold">
                  <th className="py-2.5 px-3">Godzina UTC</th>
                  <th className="py-2.5 px-3 text-right">Liczba Sweepów</th>
                  <th className="py-2.5 px-3 text-right">Wygrane (Win)</th>
                  <th className="py-2.5 px-3 text-right">Przegrane (Loss)</th>
                  <th className="py-2.5 px-3 text-right">Win Rate (%)</th>
                  <th className="py-2.5 px-3 text-right">Śr. Sweep Win ($)</th>
                  <th className="py-2.5 px-3 text-right">Śr. Sweep Loss ($)</th>
                  <th className="py-2.5 px-3 text-right">Profit Factor</th>
                  <th className="py-2.5 px-3">Faza Rynku</th>
                  <th className="py-2.5 px-3">Dyrektywa EA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {londonHourly.map((h) => {
                  const isPrime = h.hour >= 7 && h.hour <= 9;
                  const isDead = h.hour >= 11 && h.hour <= 12;
                  return (
                    <tr 
                      key={h.hour}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isPrime ? 'bg-amber-500/[0.03]' : isDead ? 'bg-rose-500/[0.02]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-200">
                        {h.hour_utc}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{h.total_sweeps}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{h.wins}</td>
                      <td className="py-2.5 px-3 text-right text-rose-400">{h.losses}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          h.win_rate >= 60 
                            ? 'text-emerald-300 bg-emerald-950/60' 
                            : h.win_rate >= 45 
                            ? 'text-amber-300 bg-amber-950/60' 
                            : 'text-rose-300 bg-rose-950/60'
                        }`}>
                          {h.win_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">${h.avg_depth_win.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-rose-400">${h.avg_depth_loss.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">{h.profit_factor.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">{h.phase}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`text-[10px] font-semibold uppercase ${
                          isPrime ? 'text-emerald-400' : isDead ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {h.ea_directive}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 leading-relaxed font-sans">
            <strong className="text-slate-200">Wniosek Ilościowy dla Londynu:</strong> 
            W godzinach <span className="text-amber-400 font-mono font-semibold">07:00 – 10:00 UTC</span> ma miejsce 78% wszystkich skutecznych manipulacji sesyjnych (Judas Swing).
            Średnia głębokość naruszenia dla transakcji zyskownych wynosi <span className="text-emerald-400 font-mono">$2.46 - $3.05</span>. 
            Naruszenia powyżej <span className="text-rose-400 font-mono">$5.50</span> w 81% przypadków prowadzą do ucieczki trendowej (Breakout Runaway) i kończą się stratą przy próbie gry na odwrócenie.
          </div>
        </div>
      )}

      {/* Full New York Session Table (12:30 - 21:00 UTC) */}
      {(activeSession === 'ALL' || activeSession === 'NY') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <h2 className="text-base font-bold text-white">
                  Cała Sesja Nowojorska (12:30 – 21:00 UTC): Rozbicie Godzinowe & Overlap
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                W tym nakładanie się sesji (Overlap 12:30–16:30 UTC), publikacje makroekonomiczne USA (13:30 UTC) oraz popołudnie.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">Średni WR Całego Nowego Jorku:</span>
              <span className="text-purple-400 font-bold">{avgNYWinRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/70 font-semibold">
                  <th className="py-2.5 px-3">Godzina UTC</th>
                  <th className="py-2.5 px-3 text-right">Liczba Sweepów</th>
                  <th className="py-2.5 px-3 text-right">Wygrane (Win)</th>
                  <th className="py-2.5 px-3 text-right">Przegrane (Loss)</th>
                  <th className="py-2.5 px-3 text-right">Win Rate (%)</th>
                  <th className="py-2.5 px-3 text-right">Śr. Sweep Win ($)</th>
                  <th className="py-2.5 px-3 text-right">Śr. Sweep Loss ($)</th>
                  <th className="py-2.5 px-3 text-right">Profit Factor</th>
                  <th className="py-2.5 px-3">Faza Rynku</th>
                  <th className="py-2.5 px-3">Dyrektywa EA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {nyHourly.map((h) => {
                  const isPeak = h.hour >= 13 && h.hour <= 15;
                  const isLate = h.hour >= 17;
                  return (
                    <tr 
                      key={h.hour}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isPeak ? 'bg-purple-500/[0.04]' : isLate ? 'bg-slate-950/40 opacity-70' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-200">
                        {h.hour_utc}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{h.total_sweeps}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{h.wins}</td>
                      <td className="py-2.5 px-3 text-right text-rose-400">{h.losses}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          h.win_rate >= 60 
                            ? 'text-emerald-300 bg-emerald-950/60' 
                            : h.win_rate >= 45 
                            ? 'text-amber-300 bg-amber-950/60' 
                            : 'text-rose-300 bg-rose-950/60'
                        }`}>
                          {h.win_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">${h.avg_depth_win.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-rose-400">${h.avg_depth_loss.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">{h.profit_factor.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">{h.phase}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`text-[10px] font-semibold uppercase ${
                          isPeak ? 'text-emerald-400' : isLate ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {h.ea_directive}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 leading-relaxed font-sans">
            <strong className="text-slate-200">Wniosek Ilościowy dla Nowego Jorku:</strong> 
            Nakładanie się sesji z Londynem (<span className="text-purple-400 font-mono font-semibold">12:30 – 16:30 UTC</span>) dostarcza najwyższy wolumen tickowy. 
            Okna <span className="text-emerald-400 font-mono">13:00 – 15:00 UTC</span> notują najwyższą skuteczność (WR 67.7% - 68.7%), 
            gdyż instytucje wykorzystują dane USA do wyczyszczenia poziomów London High/Low przed ruchem właściwym. 
            Po godzinie 16:30 (zamknięcie giełd europejskich) wolumen drastycznie spada, spready rosną, a Win Rate opada poniżej 40%.
          </div>
        </div>
      )}
    </div>
  );
};
