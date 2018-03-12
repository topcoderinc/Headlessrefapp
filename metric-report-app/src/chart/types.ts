/**
 * Represents stats for a single route.
 */
export type RouteStats = {
  url: string;
} & { [name: string]: number };

/**
 * Represents the main report stats.
 */
export interface ReportStats {
  'total-routes': number;
  routes: RouteStats[];
}

/**
 * Represents the config for report threshold (green, yellow, red).
 */
export type ReportConfig = {
  healthyRatio: number;
} & { [name: string]: number };
