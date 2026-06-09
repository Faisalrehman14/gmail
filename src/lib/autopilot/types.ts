export interface SendWindow {
  startHour: number; // 0-23
  endHour: number;
  timezone: string;
}

export interface WarmupConfig {
  enabled: boolean;
  startDaily: number;
  increment: number;
  maxDaily: number;
  currentDay: number;
}

export interface AutopilotStats {
  sentToday: number;
  sentThisHour: number;
  lastResetDate: string; // YYYY-MM-DD
  lastHourKey: string; // YYYY-MM-DD-HH
  totalQueued: number;
  totalSent: number;
  totalFailed: number;
  totalInvalid: number;
  startedAt: string;
}

export interface AutopilotConfig {
  dailyLimit: number;
  hourlyLimit: number;
  sendWindow: SendWindow;
  warmup: WarmupConfig;
  pauseOnBounceRate: number;
  paused: boolean;
  pauseReason?: string;
  estimatedDays: number;
  providerType: string;
  stats: AutopilotStats;
}

export interface AutopilotLaunchInput {
  name: string;
  subject: string;
  htmlContent: string;
  contacts: {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
  }[];
  timezone?: string;
  createdById: string;
  smtpProviderId?: string;
}

export interface AutopilotLaunchResult {
  campaignId: string;
  listId: string;
  totalUploaded: number;
  validContacts: number;
  invalidContacts: number;
  estimatedDays: number;
  dailyLimit: number;
  message: string;
}
