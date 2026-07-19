import * as fs from 'fs';
import * as path from 'path';
import appStore from './app-store';
import { ModelInstance, SocketEventName } from './types';

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
  private injectEvents(): void {
    if (!this.hasClientsFn()) {
      // Don't inject events if no clients are connected
      return;
    }

    try {
      const activeModel = appStore.getActiveModel();
      let eventPayload: any[] = [];

      if (activeModel && activeModel.events && activeModel.events.length > 0 && activeModel.instances && activeModel.instances.length > 0) {
        // Flatten the model instance tree
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

        // Find matches where event.nti === instance.nti
        const matches: Array<{ evt: any; inst: ModelInstance }> = [];
        activeModel.events.forEach(evt => {
          flatInstances.forEach(inst => {
            if (evt.nti === inst.nti) {
              matches.push({ evt, inst });
            }
          });
        });

        if (matches.length > 0) {
          // Select a random subset of matches (e.g., 1 to 3 events)
          const numEventsToSelect = Math.min(matches.length, Math.floor(Math.random() * 3) + 1);
          
          // Shuffle the matches array and select the first N elements
          const shuffled = [...matches].sort(() => 0.5 - Math.random());
          const selectedMatches = shuffled.slice(0, numEventsToSelect);

          eventPayload = selectedMatches.map(({ evt, inst }) => {
            const reportingSystem = parseInt(activeModel.system.id, 10) || 1;
            const eventId = parseInt(evt.id, 10) || 0;
            const nodeTypeId = parseInt(evt.nti, 10) || 0;
            const eventClass = evt.severity === 'NG' ? 3 : 2;
            const serialNumber = parseInt(inst.sn, 10) || 1;
            const hwMapIndex = parseInt(inst.hmi, 10);
            const sign = Math.random() < 0.5 ? 1 : 4;
            const eventProbability = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2));

            return {
              properties: {
                msg_hdr: {
                  messageCode: 6
                },
                evt: {
                  reporting_system_e: reportingSystem,
                  event_id_s32: eventId,
                  node_type_id: nodeTypeId,
                  event_class_e: eventClass,
                  node_serial_number_s32: serialNumber,
                  hw_map_index: hwMapIndex,
                  event_time: Date.now(),
                  sign_e: sign,
                  eventProbability: eventProbability
                }
              }
            };
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
              if (item.properties && item.properties.evt) {
                item.properties.evt.event_time = Date.now();
              }
              return item;
            });
            console.log(`[EventInjector] Injected ${eventPayload.length} events from eventmsg.json (fallback) to clients.`);
          }
        }
      }

      if (eventPayload.length > 0) {
        this.broadcastFn(SocketEventName.eventsChange, eventPayload);
      }
    } catch (err) {
      console.error('[EventInjector] Error during event injection:', (err as Error).message);
    }
  }
}
