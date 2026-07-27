import { SocketEventName } from './types';
import { GenerateSystemInfoList } from './system-info-generator';

/**
 * SystemInfoInjector handles recurring generation and broadcast of mock SystemInfo list
 * populated dynamically from the currently active loaded model data.
 */
export class SystemInfoInjector {
  private systemInfoInterval: NodeJS.Timeout | null = null;
  private broadcastFn: (event: string, data: any) => void;
  private hasClientsFn: () => boolean;

  constructor(
    broadcastFn: (event: string, data: any) => void,
    hasClientsFn: () => boolean
  ) {
    this.broadcastFn = broadcastFn;
    this.hasClientsFn = hasClientsFn;
  }

  /**
   * Starts the automatic system-info injection interval (every 10 seconds).
   */
  start(): void {
    this.stop();

    console.log('[SystemInfoInjector] Starting systemInfo injection interval (every 10 seconds)...');
    this.systemInfoInterval = setInterval(() => {
      this.injectSystemInfo();
    }, 10000);
  }

  /**
   * Stops the automatic system-info injection interval.
   */
  stop(): void {
    if (this.systemInfoInterval) {
      clearInterval(this.systemInfoInterval);
      this.systemInfoInterval = null;
      console.log('[SystemInfoInjector] SystemInfo injection interval stopped.');
    }
  }

  /**
   * Injects mock SystemInfo[] updates based on active model data or file fallback.
   */
  private injectSystemInfo(): void {
    if (!this.hasClientsFn()) {
      return;
    }

    try {
      const systemInfoList = GenerateSystemInfoList();
      if (systemInfoList && systemInfoList.length > 0) {
        this.broadcastFn(SocketEventName.systemInfo, systemInfoList);
        console.log(`[SystemInfoInjector] Injected ${systemInfoList.length} systemInfo items to clients.`);
      }
    } catch (err) {
      console.error('[SystemInfoInjector] Error during systemInfo injection:', (err as Error).message);
    }
  }
}
