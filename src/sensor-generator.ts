import { SensorsCollection, Sensor } from './types';

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
 * Dynamically constructs a randomized, fully populated, and hierarchically linked collection of Sensors.
 */
export function GenerateSensorsTree(): SensorsCollection {
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
