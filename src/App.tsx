import React, { useState } from 'react';
import { defaultQuantData } from './data/defaultQuantData';
import { Header } from './components/Header';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { SessionsView } from './components/SessionsView';
import { FlipsView } from './components/FlipsView';
import { PatternsView } from './components/PatternsView';
import { Mql5CodeView } from './components/Mql5CodeView';
import { CsvUploader } from './components/CsvUploader';
import { Download, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('summary');

  const handleDownloadEA = () => {
    const link = document.createElement('a');
    link.href = '/XAUUSD_QuantSession_Sniper.mq5';
    link.download = 'XAUUSD_QuantSession_Sniper.mq5';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(defaultQuantData, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = 'XAUUSD_Quant_Research_Report.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadEA={handleDownloadEA}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'summary' && (
          <ExecutiveSummary
            data={defaultQuantData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsView data={defaultQuantData} />
        )}

        {activeTab === 'flips' && (
          <FlipsView
            data={defaultQuantData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'patterns' && (
          <PatternsView
            data={defaultQuantData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'mql5' && (
          <Mql5CodeView onDownloadEA={handleDownloadEA} />
        )}

        {activeTab === 'datasets' && (
          <CsvUploader />
        )}
      </main>

      {/* Institutional Quant Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500/80" />
            <span>XAU/USD Quantitative Institutional Research Lab · MetaTrader 5 Expert Advisor</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Eksportuj Raport JSON</span>
            </button>
            <a
              href="https://www.kaggle.com/datasets/rescoto/gold-spot-xauusd-5-minute-ohlc-candles"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-slate-300 transition-colors"
            >
              <span>Kaggle 5m</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.kaggle.com/datasets/getdatafinance/xauusd-1m-ohlcv-metals-historical-data"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-slate-300 transition-colors"
            >
              <span>Kaggle 1m</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
