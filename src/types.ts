export interface AnalyticsEntry {
  appID: string;
  action: string;
  where: string;
}

export interface AnalyticsEntryWithDateTime extends AnalyticsEntry {
  dateTime: Date;
}

export interface AnalyticsError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: unknown;
  error?: AnalyticsError;
}
