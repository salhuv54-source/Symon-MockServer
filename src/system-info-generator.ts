import appStore from './app-store';
import treeService from './tree.service';
import {
  SystemInfo,
  E_PARAM_TYPE,
  E_SYSTEM_INFO_LEVEL,
  E_UNIT_TYPE
} from './interfaces/system-info.interface';

interface ParameterTemplate {
  description: string;
  graphName: string;
  group: string;
  unitType: E_UNIT_TYPE;
  paramType: E_PARAM_TYPE;
  getValueAndText: () => { value: number; text: string };
}

const PARAMETER_TEMPLATES: ParameterTemplate[] = [
  {
    description: 'Supply Voltage',
    graphName: 'Voltage',
    group: 'Power',
    unitType: E_UNIT_TYPE.E_UNIT_TYPE_VOLTAGE,
    paramType: E_PARAM_TYPE.E_PARAM_TYPE_VALUE,
    getValueAndText: () => {
      const v = parseFloat((22 + Math.random() * 6).toFixed(2)); // ~22V - 28V
      return { value: v, text: `${v} V` };
    }
  },
  {
    description: 'Operating Temperature',
    graphName: 'Temperature',
    group: 'Thermal',
    unitType: E_UNIT_TYPE.E_UNIT_TYPE_TEMPERATURE,
    paramType: E_PARAM_TYPE.E_PARAM_TYPE_VALUE,
    getValueAndText: () => {
      const temp = parseFloat((30 + Math.random() * 45).toFixed(1)); // ~30°C - 75°C
      return { value: temp, text: `${temp} °C` };
    }
  },
  {
    description: 'Current Draw',
    graphName: 'Current',
    group: 'Power',
    unitType: E_UNIT_TYPE.E_UNIT_TYPE_CURRENT,
    paramType: E_PARAM_TYPE.E_PARAM_TYPE_VALUE,
    getValueAndText: () => {
      const current = parseFloat((0.5 + Math.random() * 9.5).toFixed(2)); // ~0.5A - 10A
      return { value: current, text: `${current} A` };
    }
  },
  {
    description: 'System Pressure',
    graphName: 'Pressure',
    group: 'Hydraulics',
    unitType: E_UNIT_TYPE.E_UNIT_TYPE_PRESSURE,
    paramType: E_PARAM_TYPE.E_PARAM_TYPE_VALUE,
    getValueAndText: () => {
      const press = parseFloat((1.0 + Math.random() * 4.0).toFixed(2)); // ~1 - 5 bar
      return { value: press, text: `${press} bar` };
    }
  },
  {
    description: 'Operational Mode',
    graphName: 'Status',
    group: 'State',
    unitType: E_UNIT_TYPE.E_UNIT_TYPE_NUMBER,
    paramType: E_PARAM_TYPE.E_PARAM_TYPE_TEXT,
    getValueAndText: () => {
      const modes = ['NORMAL', 'STANDBY', 'OPTIMAL', 'CALIBRATING', 'ACTIVE'];
      const text = modes[Math.floor(Math.random() * modes.length)];
      return { value: 1, text };
    }
  },
  {
    description: 'CPU Load',
    graphName: 'Load',
    group: 'Performance',
    unitType: E_UNIT_TYPE.E_UNIT_TYPE_PROGRESS,
    paramType: E_PARAM_TYPE.E_PARAM_TYPE_VALUE,
    getValueAndText: () => {
      const load = Math.floor(10 + Math.random() * 80); // 10% - 90%
      return { value: load, text: `${load}%` };
    }
  }
];

function pickRealisticInfoLevel(): E_SYSTEM_INFO_LEVEL {
  const rand = Math.random();
  if (rand < 0.70) {
    return E_SYSTEM_INFO_LEVEL.E_LEVEL_OK;
  } else if (rand < 0.82) {
    return E_SYSTEM_INFO_LEVEL.E_LEVEL_HIGH;
  } else if (rand < 0.90) {
    return E_SYSTEM_INFO_LEVEL.E_LEVEL_VERY_LOW;
  } else if (rand < 0.96) {
    return E_SYSTEM_INFO_LEVEL.E_LEVEL_VERY_HIGH;
  } else {
    return E_SYSTEM_INFO_LEVEL.E_LEVEL_UNKNOWN;
  }
}

/**
 * Generates an array of SystemInfo messages dynamically populated from active model data.
 * Randomly assigns zero, one, or multiple SystemInfo parameters per HMI (sensor).
 */
export function GenerateSystemInfoList(): SystemInfo[] {
  const activeModel = appStore.getActiveModel();
  const sensors = treeService.buildTree();

  // Extract all valid sensor/HMI IDs from model tree or active model instances
  let sensorIds: number[] = [];
  if (sensors && sensors.length > 0) {
    sensorIds = sensors.map(s => s.id);
  } else if (activeModel && activeModel.instances && activeModel.instances.length > 0) {
    const collectHmis = (instances: any[]): number[] => {
      let list: number[] = [];
      for (const inst of instances) {
        const hmi = parseInt(inst.hmi, 10);
        if (!isNaN(hmi)) list.push(hmi);
        if (inst.children?.length) {
          list = list.concat(collectHmis(inst.children));
        }
      }
      return list;
    };
    sensorIds = collectHmis(activeModel.instances);
  }

  // Fallback to default mock sensor IDs if no model sensors exist
  if (sensorIds.length === 0) {
    sensorIds = Array.from({ length: 15 }, (_, i) => i + 1);
  }

  // Check if active model has explicit indications
  const modelIndications = activeModel?.indications || [];

  const systemInfoList: SystemInfo[] = [];

  sensorIds.forEach((sensorId) => {
    // Randomize number of info messages per HMI:
    // 30% chance -> 0 info messages
    // 40% chance -> 1 info message
    // 20% chance -> 2 info messages
    // 10% chance -> 3 info messages
    const rand = Math.random();
    let numInfos = 0;
    if (rand < 0.30) {
      numInfos = 0;
    } else if (rand < 0.70) {
      numInfos = 1;
    } else if (rand < 0.90) {
      numInfos = 2;
    } else {
      numInfos = 3;
    }

    if (numInfos === 0) {
      return; // HMI without info
    }

    // Pick unique parameter templates for this HMI
    const shuffledTemplates = [...PARAMETER_TEMPLATES].sort(() => 0.5 - Math.random());
    const selectedTemplates = shuffledTemplates.slice(0, numInfos);

    selectedTemplates.forEach((template, index) => {
      const infoId = (sensorId * 100) + (index + 1);
      const { value, text } = template.getValueAndText();
      const infoLevel = pickRealisticInfoLevel();

      // If model has specific indications, randomly use an indication name for description
      let description = template.description;
      let graphName = template.graphName;
      if (modelIndications.length > 0 && Math.random() < 0.5) {
        const ind = modelIndications[Math.floor(Math.random() * modelIndications.length)];
        if (ind && ind.name) {
          description = ind.name;
          graphName = ind.name;
        }
      }

      const now = Date.now();
      const uniqueIdWithoutDate = `uuid-info-${sensorId}-${infoId}`;
      const uniqueId = `${uniqueIdWithoutDate}-${now}`;

      systemInfoList.push({
        sensorId,
        value,
        paramType: template.paramType,
        description,
        infoLevel,
        graphName,
        date: now,
        infoId,
        text,
        isNoCommunication: false,
        unitType: template.unitType,
        uniqueId,
        uniqueIdWithoutDate,
        group: template.group,
        isFavorite: Math.random() < 0.15 // 15% chance to be favorite
      });
    });
  });

  console.log(`[SystemInfoGenerator] Generated ${systemInfoList.length} SystemInfo records across ${sensorIds.length} HMIs.`);
  return systemInfoList;
}
