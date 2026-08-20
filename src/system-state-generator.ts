import { Sensor } from './interfaces/sensor.interface';
import { SystemStateCollection, E_PRIMARY_STATE } from './interfaces/system-state.interface';
import { E_SERVICEABILITY } from './interfaces/sensor.interface';
import treeService from './tree.service';

/**
 * Array of all numeric primary state enum values from E_PRIMARY_STATE.
 */
export const PRIMARY_STATE_VALUES: E_PRIMARY_STATE[] = Object.values(E_PRIMARY_STATE)
  .filter((val): val is E_PRIMARY_STATE => typeof val === 'number');

export interface GenerateSystemStateOptions {
  randomize?: boolean;
  offset?: number;
}

/**
 * Generates a SystemStateCollection from the sensor tree with parsed attributes.
 * Each sensor in the tree is mapped to a SystemState object with a primary status
 * injected from the E_PRIMARY_STATE enum across different systems.
 */
export function GenerateSystemStateCollection(
  sensorsTree?: Sensor[],
  options?: GenerateSystemStateOptions
): SystemStateCollection {
  const tree = sensorsTree || treeService.buildTree();
  const collection: SystemStateCollection = {};
  const states = PRIMARY_STATE_VALUES.length > 0
    ? PRIMARY_STATE_VALUES
    : [
        E_PRIMARY_STATE.E_PRIMARY_STATE_INVALID,
        E_PRIMARY_STATE.E_PRIMARY_STATE_INIT,
        E_PRIMARY_STATE.E_PRIMARY_STATE_STANDBY,
        E_PRIMARY_STATE.E_PRIMARY_STATE_MAINTENANCE,
        E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
        E_PRIMARY_STATE.E_PRIMARY_STATE_SHUTDOWN,
        E_PRIMARY_STATE.E_PRIMARY_STATE_OFF,
        E_PRIMARY_STATE.E_PRIMARY_STATE_ERROR,
        E_PRIMARY_STATE.E_PRIMARY_STATE_UNKNOWN
      ];

  const offset = options?.offset ?? 0;

  for (let i = 0; i < tree.length; i++) {
    const sensor = tree[i];
    let primaryStatus: E_PRIMARY_STATE;

    if (options?.randomize) {
      primaryStatus = states[Math.floor(Math.random() * states.length)];
    } else {
      primaryStatus = states[(i + offset) % states.length];
    }

    collection[sensor.id] = {
      id: sensor.id,
      name: sensor.name,
      primaryStatus: primaryStatus,
      isDisplayAsSystem: !!sensor.isDisplayAsSystem,
      isPowerSystem: !!sensor.isPowerSupplier,
      secondaryStatus: '',
      date: Date.now(),
      uniqueId: `uuid-system-state-${sensor.id}`,
      status: E_SERVICEABILITY.E_SERVICEABILITY_OK,
      isNoCommunication: false,
      order: sensor.order,
      icon: sensor.icon
    };
  }

  return collection;
}

