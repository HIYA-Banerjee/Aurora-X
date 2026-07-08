export interface IAuthMetricsService {
  incrementLoginSuccess(): void;
  incrementLoginFailure(): void;
  incrementAccountLockout(): void;
  incrementTokenRefresh(): void;
  getMetrics(): {
    successfulLogins: number;
    failedLogins: number;
    accountLockouts: number;
    tokenRefreshes: number;
  };
}
