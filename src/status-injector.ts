import { SocketEventName } from './types';
import { GenerateSensorsTree } from './sensor-generator';
import { GenerateSensorsStatus } from './status-generator';

/**
 * StatusInjector handles recurring generation and broadcast of mock sensor statuses (serviceability)
 * populated dynamically based on the current sensors tree.
 */
export class StatusInjector {
  private statusInterval: NodeJS.Timeout | null = null;
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
   * Starts the automatic status injection interval.
   */
  start(): void {
    this.stop();

    console.log('[StatusInjector] Starting status injection interval (every 10 seconds)...');
    this.statusInterval = setInterval(() => {
      this.injectStatus();
    }, 10000);
  }

  /**
   * Stops the automatic status injection interval.
   */
  stop(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
      console.log('[StatusInjector] Status injection interval stopped.');
    }
  }

  /**
   * Injects mock status updates based on the current active sensors tree.
   */
  private injectStatus(): void {
    if (!this.hasClientsFn()) {
      return;
    }

    try {
      const sensorsTree = GenerateSensorsTree();
      const nodeIds = Object.keys(sensorsTree).map((idStr) => parseInt(idStr, 10));

      if (nodeIds.length > 0) {
        const statusPayload = GenerateSensorsStatus(nodeIds);
        this.broadcastFn(SocketEventName.serviceability, statusPayload);
        console.log(`[StatusInjector] Injected status updates for ${statusPayload.length} nodes.`);
      }
    } catch (err) {
      console.error('[StatusInjector] Error during status injection:', (err as Error).message);
    }
  }
}
