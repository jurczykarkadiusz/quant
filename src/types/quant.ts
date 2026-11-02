export interface HourlySweepMetric {
  hour_utc: string;
  hour: number;
  total_sweeps: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_depth_win: number;
  avg_depth_loss: number;
  profit_factor: number;
  phase: string;
  ea_directive: string;
}

export interface PatternMetric {
  name: string;
  total: number;
  wins: number;
  losses: number;
  win_rate: number;
  profit_factor: number;
  metrics: Record<string, number | string>;
}

export interface Mql5FilterRule {
  rule_id: string;
  category: string;
  param_code: string;
  win_vs_loss_justification: string;
}

export interface QuantDataset {
  metadata: {
    asset: string;
    timeframes: string[];
    dataset_sources: string[];
    total_sessions_analyzed: number;
    total_m5_candles: number;
    analysis_engine_version: string;
  };
  sessions: {
    asian_session: {
      window_utc: string;
      role: string;
      avg_range_pts: number;
      london_sweep_frequency_pct: number;
      ny_sweep_frequency_pct: number;
    };
    london_session: {
      window_utc: string;
      hourly_breakdown: HourlySweepMetric[];
    };
    new_york_session: {
      window_utc: string;
      overlap_window_utc: string;
      hourly_breakdown: HourlySweepMetric[];
    };
  };
  htf_flips: {
    h1_flips: PatternMetric;
    daily_flips: PatternMetric;
  };
  structural_patterns: {
    pinbar: PatternMetric;
    engulfing: PatternMetric;
    double_top_bottom: PatternMetric;
    head_and_shoulders: PatternMetric;
    seq3_momentum_trap: PatternMetric;
  };
  mql5_filter_matrix: Mql5FilterRule[];
}
