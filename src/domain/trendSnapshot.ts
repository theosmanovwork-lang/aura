/** The score of a trend at one moment. A row of snapshots is the history shown on the chart. */
export type TrendSnapshot = Readonly<{
  trendId: string;
  at: number;
  score: number;
}>;
