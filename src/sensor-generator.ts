import { SensorsCollection, Sensor, ModelInstance, ModelNode, ModelData } from './types';
import appStore from './app-store';

// Helper function to safely convert values/collections to arrays
export function toArray<T>(value: any): T[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    return Object.values(value) as unknown as T[];
  }
  return [value];
}

/**
 * Finds the NodeType NTT attribute recursively by NTI.
 */
function findNttByNti(nodeTypes: ModelNode[], nti: string): string {
  for (const nt of nodeTypes) {
    if (nt.nti === nti) return nt.ntt;
    if (nt.children) {
      const found = findNttByNti(nt.children, nti);
      if (found) return found;
    }
  }
  return '';
}

/**
 * Determines a suitable icon for a node based on its level and name.
 */
function getIconForNode(level: number, name: string): string {
  if (level === 0) return 'dns';
  if (level === 1) return 'settings';
  const lowerName = name.toLowerCase();
  if (lowerName.includes('temp') || lowerName.includes('thermostat')) return 'thermostat';
  if (lowerName.includes('volt') || lowerName.includes('current') || lowerName.includes('power') || lowerName.includes('ps')) return 'bolt';
  return 'lens';
}

/**
 * Recursively converts ModelInstance tree to Sensor nodes.
 */
function buildFromInstances(
  instances: ModelInstance[],
  model: ModelData,
  parentId: number | null,
  level: number,
  parentIndexPath: string,
  sensors: SensorsCollection
): void {
  instances.forEach((inst, index) => {
    const id = parseInt(inst.hmi, 10);
    if (isNaN(id)) return;

    const childrenIds = (inst.children || []).map(child => parseInt(child.hmi, 10)).filter(cid => !isNaN(cid));
    const nodeIndexPath = parentIndexPath ? `${parentIndexPath}/${id}` : `/${id}`;

    // Look up node type NTT from nodeTypes
    const ntt = findNttByNti(model.nodeTypes, inst.nti);

    // Check if this instance is a supplier
    const isPowerSupplier = model.supplierInstances.some(s => s.hmi === inst.hmi) || level === 0;

    // Is it a power sensor?
    const isPowerSensor = level > 0;

    // Icons:
    const icon = getIconForNode(level, inst.name);

    // Parents and children
    const parentsIds = parentId !== null ? [parentId] : [];

    // power parents/children default to matching hierarchical parents/children
    const powerParentsIds = [...parentsIds];
    const powerChildrenIds = [...childrenIds];

    sensors[id] = {
      id,
      name: inst.name,
      parentsIds,
      childrenIds,
      isHidden: false,
      isDisplayAsSystem: level <= 1 || ntt === "System" || ntt === "Sub System",
      powerParentsIds,
      powerChildrenIds,
      isPowerSensor,
      isPowerSupplier,
      level,
      nodeType: ntt || (level === 0 ? "System" : level === 1 ? "Subsystem" : "Sensor"),
      nodeIndexPath,
      order: index + 1,
      icon
    };

    if (inst.children && inst.children.length > 0) {
      buildFromInstances(inst.children, model, id, level + 1, nodeIndexPath, sensors);
    }
  });
}

/**
 * Dynamically constructs a randomized, fully populated, and hierarchically linked collection of Sensors.
 * If an active model is loaded in the appStore, the tree is dynamically built based on the loaded model.
 */
export function GenerateSensorsTree(): SensorsCollection {
  const activeModel = appStore.getActiveModel();

  if (activeModel && activeModel.instances && activeModel.instances.length > 0) {
    console.log(`[SensorGenerator] Generating sensor tree dynamically from active model: "${activeModel.system.name}"`);
    const sensors: SensorsCollection = {};

    // 1. Build the tree hierarchically from instances
    buildFromInstances(activeModel.instances, activeModel, null, 0, '', sensors);

    // 2. Add explicit power routing from SupplierInstances
    if (activeModel.supplierInstances) {
      activeModel.supplierInstances.forEach(s => {
        const supplierId = parseInt(s.hmi, 10);
        const consumerId = parseInt(s.father, 10);
        if (!isNaN(supplierId) && !isNaN(consumerId)) {
          const supplierNode = sensors[supplierId];
          const consumerNode = sensors[consumerId];
          if (supplierNode && consumerNode) {
            if (!supplierNode.powerChildrenIds.includes(consumerId)) {
              supplierNode.powerChildrenIds.push(consumerId);
            }
            if (!consumerNode.powerParentsIds.includes(supplierId)) {
              consumerNode.powerParentsIds.push(supplierId);
            }
          }
        }
      });
    }

    return sensors;
  }

  console.log('[SensorGenerator] No active model found. Falling back to default mock randomized tree.');
  const sensors: SensorsCollection = {};

  const rootNames = ["Symon Main System", "Symon Core Controller", "Symon Gateway"];
  const subSystemNames = [
    "Radar Unit", "Power Distribution", "Thermal Regulation",
    "RF Transceiver", "GPS Receiver", "Signal Processor"
  ];
  const sensorNames = [
    "Temperature Sensor", "Voltage Monitor", "Current Sensor",
    "Pressure Transducer", "Humidity Sensor", "Frequency Counter",
    "Vibration Detector", "Optical Power Meter"
  ];

  const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  let nextId = 1;

  // 1. Create Root Node
  const rootId = nextId++;
  const rootSensor: Sensor = {
    id: rootId,
    name: pickRandom(rootNames),
    parentsIds: [],
    childrenIds: [],
    isHidden: false,
    isDisplayAsSystem: true,
    powerParentsIds: [],
    powerChildrenIds: [],
    isPowerSensor: false,
    isPowerSupplier: true,
    level: 0,
    nodeType: "System",
    nodeIndexPath: `/${rootId}`,
    order: 1,
    icon: "dns"
  };
  sensors[rootId] = rootSensor;

  // 2. Create Level 1 Subsystems (2 to 4 subsystems)
  const numSubsystems = Math.floor(Math.random() * 3) + 2; // 2, 3 or 4
  for (let i = 0; i < numSubsystems; i++) {
    const subId = nextId++;
    const subName = subSystemNames[i % subSystemNames.length] + ` ${Math.floor(Math.random() * 100)}`;

    const subSensor: Sensor = {
      id: subId,
      name: subName,
      parentsIds: [rootId],
      childrenIds: [],
      isHidden: Math.random() < 0.1, // 10% chance to be hidden
      isDisplayAsSystem: true,
      powerParentsIds: [rootId],
      powerChildrenIds: [],
      isPowerSensor: true,
      isPowerSupplier: Math.random() < 0.5,
      level: 1,
      nodeType: "Subsystem",
      nodeIndexPath: `/${rootId}/${subId}`,
      order: i + 1,
      icon: "settings"
    };

    // Link root to child
    rootSensor.childrenIds.push(subId);
    rootSensor.powerChildrenIds.push(subId);

    sensors[subId] = subSensor;

    // 3. Create Level 2 Sensors (3 to 6 sensors per subsystem)
    const numSensors = Math.floor(Math.random() * 4) + 3; // 3 to 6
    for (let j = 0; j < numSensors; j++) {
      const sensId = nextId++;
      const sensBaseName = pickRandom(sensorNames);
      const sensName = `${sensBaseName} ${String.fromCharCode(65 + j)}`; // e.g. "Temperature Sensor A"

      const leafSensor: Sensor = {
        id: sensId,
        name: sensName,
        parentsIds: [subId],
        childrenIds: [],
        isHidden: Math.random() < 0.05,
        isDisplayAsSystem: false,
        powerParentsIds: [subId],
        powerChildrenIds: [],
        isPowerSensor: true,
        isPowerSupplier: false,
        level: 2,
        nodeType: "Sensor",
        nodeIndexPath: `/${rootId}/${subId}/${sensId}`,
        order: j + 1,
        icon: sensBaseName.includes("Temp") ? "thermostat" : "bolt"
      };

      // Link subsystem to child
      subSensor.childrenIds.push(sensId);
      subSensor.powerChildrenIds.push(sensId);

      sensors[sensId] = leafSensor;
    }
  }

  return sensors;
}
