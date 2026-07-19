import * as fs from 'fs';
import * as path from 'path';
import appStore from './app-store';
import { ModelInstance, SocketEventName } from './types';

/**
 * FaultsInjector handles recurring generation and broadcast of mock faults (occurredFaults)
 * connected to the events in the currently loaded active model.
 */
export class FaultsInjector {
  private faultsInterval: NodeJS.Timeout | null = null;
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
   * Starts the automatic faults injection interval.
   */
  start(): void {
    this.stop();

    console.log('[FaultsInjector] Starting faults injection interval (every 10 seconds)...');
    this.faultsInterval = setInterval(() => {
      this.injectFaults();
    }, 10000);
  }

  /**
   * Stops the automatic faults injection interval.
   */
  stop(): void {
    if (this.faultsInterval) {
      clearInterval(this.faultsInterval);
      this.faultsInterval = null;
      console.log('[FaultsInjector] Faults injection interval stopped.');
    }
  }

  /**
   * Injects mock faults based on active model connections or file fallback.
   */
  private injectFaults(): void {
    if (!this.hasClientsFn()) {
      return;
    }

    try {
      const activeModel = appStore.getActiveModel();
      let faultMessages: any[] = [];

      if (activeModel && activeModel.faults && activeModel.faults.length > 0 && activeModel.instances && activeModel.instances.length > 0) {
        // Flatten model instances
        const collectAllInstances = (instances: ModelInstance[]): ModelInstance[] => {
          const result: ModelInstance[] = [];
          function traverse(list: ModelInstance[]) {
            for (const inst of list) {
              result.push(inst);
              if (inst.children && inst.children.length > 0) {
                traverse(inst.children);
              }
            }
          }
          traverse(instances);
          return result;
        };

        const flatInstances = collectAllInstances(activeModel.instances);

        // Find instances that have connected faults through distribution rules
        flatInstances.forEach(inst => {
          // Find events for this instance's node type
          const eventsForInst = activeModel.events.filter(evt => evt.nti === inst.nti);

          // Find faults mapped via distribution rules
          const matchedFaultsMap = new Map<string, any>();
          eventsForInst.forEach(evt => {
            const rules = activeModel.distributionRules.filter(
              r => r.eventID === evt.id && r.eventNTI === evt.nti
            );
            rules.forEach(rule => {
              const fault = activeModel.faults.find(
                f => f.id === rule.faultID && f.nti === rule.faultNTI
              );
              if (fault) {
                matchedFaultsMap.set(fault.id, fault);
              }
            });
          });

          const matchingFaults = Array.from(matchedFaultsMap.values());

          if (matchingFaults.length > 0) {
            // Randomly decide if this instance reports a fault message at this interval (e.g., 50% chance)
            if (Math.random() < 0.5) {
              const hmiNum = parseInt(inst.hmi, 10);
              
              // Map matching faults to structures
              let primaryUniqueId = -1;
              const mappedFaults = matchingFaults.map((fault, index) => {
                const faultIdNum = parseInt(fault.id, 10);
                const uniqueId = parseInt(`${hmiNum}${faultIdNum}`, 10);
                
                if (index === 0) {
                  primaryUniqueId = uniqueId;
                }

                const alternativeId = index === 0 ? -1 : primaryUniqueId;
                const faultStatus = Math.random() < 0.5 ? 2 : 3; // E_SIGN

                return {
                  hwMapIndex: hmiNum,
                  faultId: faultIdNum,
                  probability: parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)),
                  faultStatus: faultStatus,
                  faultChangeTime: Date.now(),
                  UniqueId: uniqueId,
                  AlternativeToUniqueId: alternativeId
                };
              });

              // Create fault message for this node
              faultMessages.push({
                msgHdr: {
                  messageCode: 1605,
                  messageSize: 64
                },
                node: {
                  node_id: hmiNum,
                  pss_e: Math.floor(Math.random() * 5), // E_SERVICEABILITY (0 to 4)
                  fss_e: Math.floor(Math.random() * 5), // E_SERVICEABILITY (0 to 4)
                  last_state_change_time: Date.now()
                },
                faultCount: mappedFaults.length,
                faults: mappedFaults
              });
            }
          }
        });

        if (faultMessages.length > 0) {
          console.log(`[FaultsInjector] Generated and injected ${faultMessages.length} dynamic fault messages from active model.`);
        }
      }

      // Fallback: Read occurredFaults.json if no model matches were found or activeModel is missing
      if (faultMessages.length === 0) {
        const fallbackPath = path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'fie_messages', 'occurredFaults.json');
        if (fs.existsSync(fallbackPath)) {
          const rawContent = fs.readFileSync(fallbackPath, 'utf-8');
          const parsed = JSON.parse(rawContent);
          if (parsed && Array.isArray(parsed.faultMessages)) {
            faultMessages = parsed.faultMessages.map((msg: any) => {
              if (msg.node) {
                msg.node.last_state_change_time = Date.now();
                // Randomize pss_e and fss_e to respect E_SERVICEABILITY
                msg.node.pss_e = Math.floor(Math.random() * 5);
                msg.node.fss_e = Math.floor(Math.random() * 5);
              }
              if (Array.isArray(msg.faults)) {
                msg.faults = msg.faults.map((f: any) => {
                  f.faultChangeTime = Date.now();
                  f.faultStatus = Math.random() < 0.5 ? 2 : 3; // E_SIGN
                  return f;
                });
              }
              return msg;
            });
            console.log(`[FaultsInjector] Injected ${faultMessages.length} fault messages from occurredFaults.json (fallback) to clients.`);
          }
        }
      }

      if (faultMessages.length > 0) {
        // Send under the main key "faultMessages" as expected by occuredFaults.json structure
        this.broadcastFn(SocketEventName.faultsChange, { faultMessages });
      }
    } catch (err) {
      console.error('[FaultsInjector] Error during faults injection:', (err as Error).message);
    }
  }
}
