import * as fs from 'fs';
import * as path from 'path';
import appStore from './app-store';
import { ModelInstance, SocketEventName } from './types';
import { EventMsg, E_EVENT_CLASS, E_FIE_PROCESS, EventsChangePayload } from './interfaces/event.interface';
import { E_SIGN } from './interfaces/fault.interface';
import { E_PRIMARY_STATE } from './interfaces/system-state.interface';

/**
 * EventInjector handles recurring generation and broadcast of mock events
 * populated dynamically from the currently active loaded model data.
 */
export class EventInjector {
  private eventInterval: NodeJS.Timeout | null = null;
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
   * Starts the automatic event injection interval.
   */
  start(): void {
    this.stop();

    console.log('[EventInjector] Starting events injection interval (every 10 seconds)...');
    this.eventInterval = setInterval(() => {
      this.injectEvents();
    }, 10000);
  }

  /**
   * Stops the automatic event injection interval.
   */
  stop(): void {
    if (this.eventInterval) {
      clearInterval(this.eventInterval);
      this.eventInterval = null;
      console.log('[EventInjector] Events injection interval stopped.');
    }
  }

  /**
   * Injects mock events based on active model data or file fallback.
   */
  public injectEvents(isOnline: boolean = true): void {
    if (!this.hasClientsFn()) {
      // Don't inject events if no clients are connected
      return;
    }

    try {
      const activeModel = appStore.getActiveModel();
      let eventPayload: any[] = [];

      if (activeModel && activeModel.events && activeModel.events.length > 0 && activeModel.instances && activeModel.instances.length > 0) {
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

        // Find matches where event.nti === instance.nti
        const matches: Array<{ evt: any; enriched: EnrichedInstance }> = [];
        activeModel.events.forEach(evt => {
          flatInstances.forEach(enriched => {
            if (evt.nti === enriched.inst.nti) {
              matches.push({ evt, enriched });
            }
          });
        });

        const rootSystemId = (activeModel.instances && activeModel.instances.length > 0)
          ? (parseInt(activeModel.instances[0].hmi, 10) || parseInt(activeModel.system.id, 10) || 1)
          : (parseInt(activeModel.system.id, 10) || 1);

        if (matches.length > 0) {
          // Select a random subset of matches (e.g., 1 to 3 events)
          const numEventsToSelect = Math.min(matches.length, Math.floor(Math.random() * 3) + 1);

          // Shuffle the matches array and select the first N elements
          const shuffled = [...matches].sort(() => 0.5 - Math.random());
          const selectedMatches = shuffled.slice(0, numEventsToSelect);

          eventPayload = selectedMatches.map(({ evt, enriched }) => {
            const inst = enriched.inst;
            const reportingSystem = parseInt(activeModel.system.id, 10) || 1;
            const eventId = parseInt(evt.id, 10) || 0;
            const nodeTypeId = parseInt(evt.nti, 10) || 0;

            // Randomize and map event class (using severity as preferred fallback)
            const eventClasses = [
              E_EVENT_CLASS.E_EVENT_CLASS_HW_FAULT,
              E_EVENT_CLASS.E_EVENT_CLASS_COMM_PROBLEM,
              E_EVENT_CLASS.E_EVENT_CLASS_SW_PROBLEM,
              E_EVENT_CLASS.E_EVENT_CLASS_CONFIGURATION,
              E_EVENT_CLASS.E_EVENT_CLASS_DATA,
              E_EVENT_CLASS.E_EVENT_CLASS_STATE_CHANGE
            ];
            let eventClass = evt.severity === 'NG' ? E_EVENT_CLASS.E_EVENT_CLASS_SW_PROBLEM : E_EVENT_CLASS.E_EVENT_CLASS_COMM_PROBLEM;
            if (Math.random() < 0.4) {
              // 40% probability of a fully randomized event class to generate rich/diverse test data
              eventClass = eventClasses[Math.floor(Math.random() * eventClasses.length)];
            }

            const serialNumber = parseInt(inst.sn, 10) || 1;
            const hwMapIndex = parseInt(inst.hmi, 10);

            // Randomize status/sign
            const statusValues = [E_SIGN.E_SIGN_PRIMARY, E_SIGN.E_SIGN_ALTERNATIVE, E_SIGN.E_SIGN_UNKNOWN];
            const status = statusValues[Math.floor(Math.random() * statusValues.length)];

            // Randomize probability dynamically
            const eventProbability = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2));

            // Randomize state
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

            return {
              sensorId: hwMapIndex,
              event_id_s32: eventId,
              node_type_id: nodeTypeId,
              event_class_e: eventClass,
              date: Date.now(),
              status: status,
              eventProbability: eventProbability,
              reporting_system_e: reportingSystem as E_FIE_PROCESS,
              node_serial_number_s32: serialNumber,
              eventName: evt.name,
              description: evt.desc,
              severity: evt.severity,
              systemId: hwMapIndex,
              rootSystemId: rootSystemId,
              systemName: activeModel.system.name,
              nodeFullPath: enriched.fullPath,
              nodeIndexPath: enriched.indexPath,
              state: state,
              uniqueId: `uuid-${hwMapIndex}-${Date.now()}`,
              uniqueIdWithoutDate: `uuid-${hwMapIndex}-${eventId}`
            } as EventMsg;
          });

          console.log(`[EventInjector] Injected ${eventPayload.length} events from active model "${activeModel.system.name}" to clients.`);
        }
      }

      // Fallback: Read eventmsg.json if no model matches were found or activeModel is missing
      if (eventPayload.length === 0) {
        const eventMsgPath = path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'fie_messages', 'eventmsg.json');
        if (fs.existsSync(eventMsgPath)) {
          const rawContent = fs.readFileSync(eventMsgPath, 'utf-8');
          const parsed = JSON.parse(rawContent);
          if (Array.isArray(parsed)) {
            eventPayload = parsed.map((item: any) => {
              const evt = item.properties?.evt || {};
              const hwMapIndex = evt.hw_map_index || 1;
              const eventId = evt.event_id_s32 || 1;
              return {
                sensorId: hwMapIndex,
                event_id_s32: eventId,
                node_type_id: evt.node_type_id || 1,
                event_class_e: evt.event_class_e || E_EVENT_CLASS.E_EVENT_CLASS_SW_PROBLEM,
                date: Date.now(),
                status: evt.sign_e === 1 ? E_SIGN.E_SIGN_PRIMARY : E_SIGN.E_SIGN_ALTERNATIVE,
                eventProbability: evt.eventProbability || 0.5,
                reporting_system_e: evt.reporting_system_e || E_FIE_PROCESS.E_FIE_PROCESS_EVENT_SIM,
                node_serial_number_s32: evt.node_serial_number_s32 || 1,
                nodeFullPath: `/FallbackNode/Sensor_${hwMapIndex}`,
                nodeIndexPath: `/${hwMapIndex}`,
                eventName: `FALLBACK_EVENT_${eventId}`,
                description: `Fallback event description for ID ${eventId}`,
                systemId: hwMapIndex,
                rootSystemId: 1,
                systemName: "FallbackSystem",
                severity: "NG",
                state: E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
                uniqueId: `uuid-fallback-${hwMapIndex}-${Date.now()}`,
                uniqueIdWithoutDate: `uuid-fallback-${hwMapIndex}-${eventId}`
              } as EventMsg;
            });
            console.log(`[EventInjector] Injected ${eventPayload.length} events from eventmsg.json (fallback) to clients.`);
          }
        }
      }

      if (eventPayload.length > 0) {
        const payload: EventsChangePayload = {
          data: eventPayload,
          isOnline
        };
        this.broadcastFn(SocketEventName.eventsChange, payload);
      }
    } catch (err) {
      console.error('[EventInjector] Error during event injection:', (err as Error).message);
    }
  }
}
