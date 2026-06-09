import type { AutopilotConfig } from "./types";

function getDateInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getHourInTimezone(timezone: string): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  return parseInt(hour, 10);
}

function getHourKey(timezone: string): string {
  const date = getDateInTimezone(timezone);
  const hour = getHourInTimezone(timezone);
  return `${date}-${String(hour).padStart(2, "0")}`;
}

export function resetStatsIfNeeded(config: AutopilotConfig): AutopilotConfig {
  const tz = config.sendWindow.timezone;
  const today = getDateInTimezone(tz);
  const hourKey = getHourKey(tz);

  if (config.stats.lastResetDate !== today) {
    config.stats.sentToday = 0;
    config.stats.lastResetDate = today;
    config.warmup.currentDay += 1;
  }

  if (config.stats.lastHourKey !== hourKey) {
    config.stats.sentThisHour = 0;
    config.stats.lastHourKey = hourKey;
  }

  return config;
}

export function getEffectiveDailyLimit(config: AutopilotConfig): number {
  if (!config.warmup.enabled) return config.dailyLimit;

  const warmupLimit =
    config.warmup.startDaily +
    (config.warmup.currentDay - 1) * config.warmup.increment;

  return Math.min(warmupLimit, config.warmup.maxDaily, config.dailyLimit);
}

export function isWithinSendWindow(config: AutopilotConfig): boolean {
  const hour = getHourInTimezone(config.sendWindow.timezone);
  const { startHour, endHour } = config.sendWindow;
  return hour >= startHour && hour < endHour;
}

export interface RateLimitResult {
  canSend: boolean;
  reason?: string;
  config: AutopilotConfig;
  effectiveDailyLimit: number;
  remainingToday: number;
  remainingThisHour: number;
}

export function checkRateLimit(config: AutopilotConfig): RateLimitResult {
  let cfg = resetStatsIfNeeded({ ...config, stats: { ...config.stats } });

  if (cfg.paused) {
    return {
      canSend: false,
      reason: cfg.pauseReason || "Campaign paused",
      config: cfg,
      effectiveDailyLimit: 0,
      remainingToday: 0,
      remainingThisHour: 0,
    };
  }

  if (!isWithinSendWindow(cfg)) {
    const tz = cfg.sendWindow.timezone;
    return {
      canSend: false,
      reason: `Outside send window (${cfg.sendWindow.startHour}:00–${cfg.sendWindow.endHour}:00 ${tz})`,
      config: cfg,
      effectiveDailyLimit: getEffectiveDailyLimit(cfg),
      remainingToday: Math.max(0, getEffectiveDailyLimit(cfg) - cfg.stats.sentToday),
      remainingThisHour: Math.max(0, cfg.hourlyLimit - cfg.stats.sentThisHour),
    };
  }

  const effectiveDaily = getEffectiveDailyLimit(cfg);
  const remainingToday = effectiveDaily - cfg.stats.sentToday;
  const remainingHour = cfg.hourlyLimit - cfg.stats.sentThisHour;

  if (remainingToday <= 0) {
    return {
      canSend: false,
      reason: `Daily limit reached (${effectiveDaily}/day). Resumes tomorrow.`,
      config: cfg,
      effectiveDailyLimit: effectiveDaily,
      remainingToday: 0,
      remainingThisHour: remainingHour,
    };
  }

  if (remainingHour <= 0) {
    return {
      canSend: false,
      reason: `Hourly limit reached (${cfg.hourlyLimit}/hour). Resumes next hour.`,
      config: cfg,
      effectiveDailyLimit: effectiveDaily,
      remainingToday: remainingToday,
      remainingThisHour: 0,
    };
  }

  return {
    canSend: true,
    config: cfg,
    effectiveDailyLimit: effectiveDaily,
    remainingToday,
    remainingThisHour: remainingHour,
  };
}

export function recordSend(config: AutopilotConfig): AutopilotConfig {
  const cfg = resetStatsIfNeeded({ ...config, stats: { ...config.stats } });
  cfg.stats.sentToday += 1;
  cfg.stats.sentThisHour += 1;
  cfg.stats.totalSent += 1;
  return cfg;
}
