import { Sensor } from './interfaces/sensor.interface';
import { SystemState, SystemStateCollection, E_PRIMARY_STATE } from './interfaces/system-state.interface';
import { E_SERVICEABILITY } from './interfaces/sensor.interface';
import treeService from './tree.service';

/**
 * Generates a SystemStateCollection from the sensor tree with parsed attributes.
 * Each sensor in the tree is mapped to a SystemState object.
 */
export function GenerateSystemStateCollection(sensorsTree?: Sensor[]): SystemStateCollection {
  const tree = sensorsTree || treeService.buildTree();
  const collection: SystemStateCollection = {};

  for (const sensor of tree) {
    collection[sensor.id] = {
      id: sensor.id,
      name: sensor.name,
      primaryStatus: E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
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
