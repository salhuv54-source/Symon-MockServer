import * as fs from 'fs';
import * as path from 'path';
import appStore from './app-store';
import { getAssetPath } from './path-utils';
import { ModelInstance, BitReportDocTypes, BitOperationType } from './types';
import { SocketEventName } from './interfaces/socket-events.interface';
import { E_SERVICEABILITY } from './interfaces/sensor.interface';
import { SingleFault, E_SIGN, FaultsChangePayload } from './interfaces/fault.interface';
import { E_PRIMARY_STATE } from './interfaces/system-state.interface';

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
  public injectFaults(isOnline: boolean = true): void {
    if (!this.hasClientsFn()) {
      return;
    }

    try {
      const activeModel = appStore.getActiveModel();
      let faultPayload: SingleFault[] = [];

      if (activeModel && activeModel.faults && activeModel.faults.length > 0 && activeModel.instances && activeModel.instances.length > 0) {
        // Enriched interface to capture hierarchical path properties
        interface EnrichedInstance {
          inst: ModelInstance;
          fullPath: string;
          indexPath: string;
        }

        // Flatten the model instance tree while building full hierarchical names and ID indexes
        const collectAllInstances = (instances: ModelInstance[]): EnrichedInstance[] => {
          const result: EnrichedInstance[] = [];
          function traverse(list: ModelInstance[], parentFullPath: string, parentIndexPath: string) {
            for (const inst of list) {
              const currentFullPath = parentFullPath ? `${parentFullPath}/${inst.name}` : `/${inst.name}`;
              const currentIndexPath = parentIndexPath ? `${parentIndexPath}/${inst.hmi}` : `/${inst.hmi}`;
              result.push({
                inst,
                fullPath: currentFullPath,
                indexPath: currentIndexPath
              });
              if (inst.children && inst.children.length > 0) {
                traverse(inst.children, currentFullPath, currentIndexPath);
              }
            }
          }
          traverse(instances, '', '');
          return result;
        };

        const flatInstances = collectAllInstances(activeModel.instances);

        // Find matches where fault.nti === instance.nti
        const matches: Array<{ fault: any; enriched: EnrichedInstance }> = [];
        activeModel.faults.forEach(fault => {
          flatInstances.forEach(enriched => {
            if (fault.nti === enriched.inst.nti) {
              matches.push({ fault, enriched });
            }
          });
        });

        const rootSystemId = (activeModel.instances && activeModel.instances.length > 0)
          ? (parseInt(activeModel.instances[0].hmi, 10) || parseInt(activeModel.system.id, 10) || 1)
          : (parseInt(activeModel.system.id, 10) || 1);

        if (matches.length > 0) {
          // Select a random subset of matches (e.g., 1 to 3 faults)
          const numFaultsToSelect = Math.min(matches.length, Math.floor(Math.random() * 3) + 1);

          // Shuffle the matches array and select the first N elements
          const shuffled = [...matches].sort(() => 0.5 - Math.random());
          const selectedMatches = shuffled.slice(0, numFaultsToSelect);

          // Build a primary unique ID to link alternative faults
          let primaryUniqueId: number | null = null;

          faultPayload = selectedMatches.map(({ fault, enriched }, index) => {
            const inst = enriched.inst;
            const faultId = parseInt(fault.id, 10) || 0;
            const hwMapIndex = parseInt(inst.hmi, 10);
            const uniqueIdNum = parseInt(`${hwMapIndex}${faultId}`, 10) || (hwMapIndex + faultId);

            if (index === 0) {
              primaryUniqueId = uniqueIdNum;
            }
            const alternativeId = index === 0 ? -1 : (primaryUniqueId || -1);

            // Randomize and map status from E_SIGN
            const statusValues = [
              E_SIGN.E_SIGN_OK,
              E_SIGN.E_SIGN_UNKNOWN,
              E_SIGN.E_SIGN_PRIMARY,
              E_SIGN.E_SIGN_ALTERNATIVE,
              E_SIGN.E_SIGN_NOT_APPLICABLE,
              E_SIGN.E_SIGN_INVALID
            ];
            const status = statusValues[Math.floor(Math.random() * statusValues.length)];

            // Randomize probability dynamically
            const probability = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2));

            // Randomize state from E_PRIMARY_STATE
            const stateValues = [
              E_PRIMARY_STATE.E_PRIMARY_STATE_INIT,
              E_PRIMARY_STATE.E_PRIMARY_STATE_STANDBY,
              E_PRIMARY_STATE.E_PRIMARY_STATE_MAINTENANCE,
              E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
              E_PRIMARY_STATE.E_PRIMARY_STATE_SHUTDOWN,
              E_PRIMARY_STATE.E_PRIMARY_STATE_OFF,
              E_PRIMARY_STATE.E_PRIMARY_STATE_ERROR
            ];
            const state = stateValues[Math.floor(Math.random() * stateValues.length)];

            // Randomize serviceability from E_SERVICEABILITY
            const serviceabilityValues = [
              E_SERVICEABILITY.E_SERVICEABILITY_OK,
              E_SERVICEABILITY.E_SERVICEABILITY_DEGRADED,
              E_SERVICEABILITY.E_SERVICEABILITY_FAIL,
              E_SERVICEABILITY.E_SERVICEABILITY_UNKNOWN,
              E_SERVICEABILITY.E_SERVICEABILITY_INVALID,
              E_SERVICEABILITY.E_SERVICEABILITY_NOT_APPLICABLE,
              E_SERVICEABILITY.E_SERVICEABILITY_NOT_CONFIG,
              E_SERVICEABILITY.E_SERVICEABILITY_PSS_XOR_FSS
            ];
            const serviceability = serviceabilityValues[Math.floor(Math.random() * serviceabilityValues.length)];

            // Randomize docType and bitOperationType
            const docTypeValues = [
              BitReportDocTypes.REPORT_DEC_TYPE,
              BitReportDocTypes.FAULT_DEC_TYPE,
              BitReportDocTypes.SERVICEABILITY_DOC_TYPE
            ];
            const docType = docTypeValues[Math.floor(Math.random() * docTypeValues.length)];

            const bitOpTypeValues = [
              BitOperationType.BIT,
              BitOperationType.CALIBRATION
            ];
            const bitOperationType = bitOpTypeValues[Math.floor(Math.random() * bitOpTypeValues.length)];

            return {
              sensorId: hwMapIndex,
              faultId: faultId,
              probability: probability,
              status: status,
              date: Date.now(),
              uniqueIdWithoutDate: `uuid-fault-${hwMapIndex}-${faultId}`,
              uniqueId: `uuid-fault-${hwMapIndex}-${Date.now()}-${index}`,
              AlternativeToUniqueId: alternativeId,
              nodeFullPath: enriched.fullPath,
              nodeIndexPath: enriched.indexPath,
              faultName: fault.name,
              fieUniqueId: uniqueIdNum,
              description: fault.desc,
              systemId: hwMapIndex,
              rootSystemId: rootSystemId,
              systemName: activeModel.system.name,
              serviceability: serviceability,
              severity: fault.severity,
              state: state,
              docType: docType,
              bitOperationType: bitOperationType,
              reportId: `rep-${Math.floor(Math.random() * 10000)}`,
              source: `Model_Fault_${faultId}`
            } as SingleFault;
          });

          console.log(`[FaultsInjector] Generated and injected ${faultPayload.length} dynamic faults from active model "${activeModel.system.name}" to clients.`);
        }
      }

      // Fallback: Read occurredFaults.json if no model matches were found or activeModel is missing
      if (faultPayload.length === 0) {
        const fallbackPath = getAssetPath('mock-data-jsons', 'fie_messages', 'occurredFaults.json');
        if (fs.existsSync(fallbackPath)) {
          const rawContent = fs.readFileSync(fallbackPath, 'utf-8');
          const parsed = JSON.parse(rawContent);
          if (parsed && Array.isArray(parsed.faultMessages)) {
            const list: SingleFault[] = [];
            parsed.faultMessages.forEach((msg: any) => {
              const node_id = msg.node?.node_id || 1;
              if (Array.isArray(msg.faults)) {
                msg.faults.forEach((f: any, idx: number) => {
                  const hwMapIndex = f.hw_map_index || node_id;
                  const faultId = f.faultId || 1;
                  list.push({
                    sensorId: hwMapIndex,
                    faultId: faultId,
                    probability: f.probability || 0.5,
                    status: f.faultStatus === 2 ? E_SIGN.E_SIGN_PRIMARY : E_SIGN.E_SIGN_ALTERNATIVE,
                    date: Date.now(),
                    uniqueIdWithoutDate: `uuid-fault-fallback-${hwMapIndex}-${faultId}`,
                    uniqueId: `uuid-fault-fallback-${hwMapIndex}-${Date.now()}-${idx}`,
                    AlternativeToUniqueId: f.AlternativeToUniqueId || -1,
                    nodeFullPath: `/FallbackNode/Sensor_${hwMapIndex}`,
                    nodeIndexPath: `/${hwMapIndex}`,
                    faultName: `FALLBACK_FAULT_${faultId}`,
                    fieUniqueId: f.UniqueId || (hwMapIndex + faultId),
                    description: `Fallback fault description for ID ${faultId}`,
                    systemId: hwMapIndex,
                    rootSystemId: 1,
                    systemName: "FallbackSystem",
                    serviceability: msg.node?.pss_e || E_SERVICEABILITY.E_SERVICEABILITY_OK,
                    severity: "NG",
                    state: E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
                    docType: BitReportDocTypes.FAULT_DEC_TYPE,
                    bitOperationType: BitOperationType.BIT,
                    reportId: `rep-fallback-${hwMapIndex}`,
                    source: "Fallback_File"
                  } as SingleFault);
                });
              }
            });
            faultPayload = list;
            console.log(`[FaultsInjector] Injected ${faultPayload.length} flat faults from occurredFaults.json (fallback) to clients.`);
          }
        }
      }

      if (faultPayload.length > 0) {
        const payload: FaultsChangePayload = {
          data: faultPayload,
          isOnline
        };
        this.broadcastFn(SocketEventName.faultsChange, payload);
      }
    } catch (err) {
      console.error('[FaultsInjector] Error during faults injection:', (err as Error).message);
    }
  }
}
