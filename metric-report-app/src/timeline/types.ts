/**
 * Represents stats for a single route.
 */
export type RouteStats = {
  url: string;
} & { [name: string]: number };

/**
 * Represents data for a single day
 */
export interface DataSeries {
  date: string;
  routes: RouteStats[];
}
