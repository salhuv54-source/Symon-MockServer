import { SocketEventName } from './interfaces/socket-events.interface';
import { GenerateSystemStateCollection } from './system-state-generator';
import treeService from './tree.service';

/**
 * SystemStateInjector handles recurring generation and broadcast of mock SystemStateCollection
 * populated dynamically from the current sensors tree, injecting all primary statuses from
 * E_PRIMARY_STATE across the different systems.
 */
export class SystemStateInjector {
  private systemStateInterval: NodeJS.Timeout | null = null;
  private broadcastFn: (event: string, data: any) => void;
  private hasClientsFn: () => boolean;
  private injectionCount = 0;

  constructor(
    broadcastFn: (event: string, data: any) => void,
    hasClientsFn: () => boolean
  ) {
    this.broadcastFn = broadcastFn;
    this.hasClientsFn = hasClientsFn;
  }

  /**
   * Starts the automatic system state injection interval (every 10 seconds).
   */
  start(): void {
    this.stop();

    console.log('[SystemStateInjector] Starting system state injection interval (every 10 seconds)...');
    this.systemStateInterval = setInterval(() => {
      this.injectSystemState();
    }, 10000);
  }

  /**
   * Stops the automatic system state injection interval.
   */
  stop(): void {
    if (this.systemStateInterval) {
      clearInterval(this.systemStateInterval);
      this.systemStateInterval = null;
      console.log('[SystemStateInjector] System state injection interval stopped.');
    }
  }

  /**
   * Injects mock SystemStateCollection updates based on the current sensors tree.
   */
  private injectSystemState(): void {
    if (!this.hasClientsFn()) {
      return;
    }

    try {
      this.injectionCount++;
      const sensorsTree = treeService.buildTree();
      if (sensorsTree && sensorsTree.length > 0) {
        const systemStateCollection = GenerateSystemStateCollection(sensorsTree, {
          offset: this.injectionCount
        });
        this.broadcastFn(SocketEventName.systemStateChange, systemStateCollection);
        console.log(`[SystemStateInjector] Injected system state updates for ${Object.keys(systemStateCollection).length} systems.`);
      }
    } catch (err) {
      console.error('[SystemStateInjector] Error during system state injection:', (err as Error).message);
    }
  }
}
