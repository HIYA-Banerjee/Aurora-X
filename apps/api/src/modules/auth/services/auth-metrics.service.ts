import { Injectable } from '@nestjs/common';
import { IAuthMetricsService } from '../interfaces/auth-metrics.interface';

@Injectable()
export class AuthMetricsService implements IAuthMetricsService {
  private successfulLogins = 0;
  private failedLogins = 0;
  private accountLockouts = 0;
  private tokenRefreshes = 0;

  incrementLoginSuccess(): void {
    this.successfulLogins++;
  }

  incrementLoginFailure(): void {
    this.failedLogins++;
  }

  incrementAccountLockout(): void {
    this.accountLockouts++;
  }

  incrementTokenRefresh(): void {
    this.tokenRefreshes++;
  }

  getMetrics() {
    return {
      successfulLogins: this.successfulLogins,
      failedLogins: this.failedLogins,
      accountLockouts: this.accountLockouts,
      tokenRefreshes: this.tokenRefreshes,
    };
  }
}
