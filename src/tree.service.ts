import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { Sensor, SensorsCollection } from './interfaces/sensor.interface';
import { ModelData, ModelInstance, ModelNode, SocketEventName } from './types';
import { loadModelFromFile } from './model-loader';
import appStore from './app-store';

export interface UserAttributeRecord {
  hidden?: boolean;
  powerSupplier?: boolean;
  displayAsSystem?: boolean;
  [key: string]: any;
}

export class TreeService {
  private defaultModelPath = path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'model', 'System1_Export.fsx');
  private defaultAttrPath = path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'model', 'System1_UAttr.xml');

  /**
   * Helper function to safely convert values/collections to arrays
   */
  public toArray<T>(value: any): T[] {
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
  private findNttByNti(nodeTypes: ModelNode[], nti: string): string {
    if (!nodeTypes || !Array.isArray(nodeTypes)) return '';
    for (const nt of nodeTypes) {
      if (nt.nti === nti) return nt.ntt;
      if (nt.children) {
        const found = this.findNttByNti(nt.children, nti);
        if (found) return found;
      }
    }
    return '';
  }

  /**
   * Determines a suitable icon for a node based on its level and name.
   */
  private getIconForNode(level: number, name: string): string {
    if (level === 0) return 'dns';
    if (level === 1) return 'settings';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('temp') || lowerName.includes('thermostat')) return 'thermostat';
    if (lowerName.includes('volt') || lowerName.includes('current') || lowerName.includes('power') || lowerName.includes('ps')) return 'bolt';
    return 'lens';
  }

  /**
   * Parses the UAttr.xml user attributes file and returns a map of HMI -> UserAttributeRecord
   */
  public parseUserAttributes(attrFilePath?: string): Map<number, UserAttributeRecord> {
    const attrMap = new Map<number, UserAttributeRecord>();
    const filePath = attrFilePath || this.getAttributesFilePath();

    if (!filePath || !fs.existsSync(filePath)) {
      console.log(`[TreeService] User attributes file not found at: ${filePath || 'N/A'}`);
      return attrMap;
    }

    try {
      console.log(`[TreeService] Parsing user attributes from: ${filePath}`);
      const xmlContent = fs.readFileSync(filePath, 'utf-8');
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        isArray: (tagName) => ['NodeInstance', 'Attribute', 'NodeType'].includes(tagName)
      });
      const parsed = parser.parse(xmlContent);

      const nodeInstances = parsed.UserAttributes?.NodeInstanceAttributes?.NodeInstance || [];
      for (const ni of nodeInstances) {
        const hmiStr = ni['@_HMI'];
        const hmi = parseInt(hmiStr, 10);
        if (isNaN(hmi)) continue;

        const record: UserAttributeRecord = {};
        const attrs = ni.Attribute || [];
        for (const attr of attrs) {
          const name = attr['@_Name'];
          const value = String(attr['@_Value'] || '');
          const isYes = value.toLowerCase().startsWith('yes') || value.toLowerCase() === 'true';

          if (name === 'Hidden') {
            record.hidden = isYes;
          } else if (name === 'PowerSupplier') {
            record.powerSupplier = isYes;
          } else if (name === 'DisplayAsSystem') {
            record.displayAsSystem = isYes;
          }
        }
        attrMap.set(hmi, record);
      }
      console.log(`[TreeService] Parsed attributes for ${attrMap.size} node instances.`);
    } catch (err) {
      console.error(`[TreeService] Error parsing user attributes XML:`, (err as Error).message);
    }

    return attrMap;
  }

  /**
   * Resolves the attribute file path corresponding to the active model or default assets.
   */
  public getAttributesFilePath(modelFileName?: string): string | null {
    const candidates = [
      path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'model', 'System1_UAttr.xml'),
      path.resolve(__dirname, '..', 'assets', 'model', 'System1_UAttr.xml'),
      path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'fie_messages', 'attributes.xml'),
    ];

    if (modelFileName) {
      const baseName = modelFileName.replace(/\.(fsx|xml)$/, '');
      candidates.unshift(
        path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'model', `${baseName}_UAttr.xml`),
        path.resolve(__dirname, '..', 'assets', 'model', `${baseName}_UAttr.xml`)
      );
    }

    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        return cand;
      }
    }
    return null;
  }

  /**
   * Builds the flat sensor tree with model file and UAttr.xml user attributes applied.
   */
  public async buildTreeAsync(modelFilePath?: string, attrFilePath?: string): Promise<Sensor[]> {
    let modelData: ModelData | undefined = appStore.getActiveModel();

    if (!modelData && modelFilePath && fs.existsSync(modelFilePath)) {
      modelData = await loadModelFromFile(modelFilePath);
    }

    if (!modelData) {
      const fallbackPath = fs.existsSync(this.defaultModelPath)
        ? this.defaultModelPath
        : path.resolve(__dirname, '..', 'assets', 'model', 'System1_Export.fsx');

      if (fs.existsSync(fallbackPath)) {
        modelData = await loadModelFromFile(fallbackPath);
      }
    }

    return this.buildTreeFromModel(modelData, attrFilePath);
  }

  /**
   * Synchronously builds the flat sensor tree using current active model or default files.
   */
  public buildTree(modelFilePath?: string, attrFilePath?: string): Sensor[] {
    let modelData: ModelData | undefined = appStore.getActiveModel();

    if (!modelData && modelFilePath && fs.existsSync(modelFilePath)) {
      modelData = this.loadModelDataSync(modelFilePath);
    }

    if (!modelData) {
      const fallbackPath = fs.existsSync(this.defaultModelPath)
        ? this.defaultModelPath
        : path.resolve(__dirname, '..', 'assets', 'model', 'System1_Export.fsx');

      if (fs.existsSync(fallbackPath)) {
        modelData = this.loadModelDataSync(fallbackPath);
      }
    }

    return this.buildTreeFromModel(modelData, attrFilePath);
  }

  /**
   * Synchronous helper to load ModelData from .fsx XML file
   */
  private loadModelDataSync(filePath: string): ModelData {
    let xmlContent = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (tagName: string) =>
        ['Node', 'Supplier', 'Indication', 'Event', 'Fault', 'Rule', 'Moon', 'Instance'].includes(tagName),
    });

    const parsed = parser.parse(xmlContent);
    const system = parsed['System'];
    if (!system) {
      throw new Error(`Could not find root <System> element in ${filePath}`);
    }

    const parseNodes = (parentElement: any): ModelNode[] => {
      const nodes: ModelNode[] = [];
      const rawNodes = parentElement?.['Node'];
      if (!rawNodes) return nodes;
      const list = Array.isArray(rawNodes) ? rawNodes : [rawNodes];
      for (const n of list) {
        nodes.push({
          nti: n['@_NTI'] ?? '',
          ti: n['@_TI'] ?? '',
          tti: n['@_TTI'] ?? '',
          name: n['@_Name'] ?? '',
          isPhysical: n['@_IsPhysical'] ?? '',
          isCritical: n['@_IsCritical'] ?? '',
          initFss: n['@_InitFss'] ?? '',
          initPss: n['@_InitPss'] ?? '',
          ntt: n['@_NTT'] ?? '',
          children: parseNodes(n),
        });
      }
      return nodes;
    };

    const parseInstances = (parentElement: any): ModelInstance[] => {
      const instances: ModelInstance[] = [];
      const rawInstances = parentElement?.['Instance'];
      if (!rawInstances) return instances;
      const list = Array.isArray(rawInstances) ? rawInstances : [rawInstances];
      for (const inst of list) {
        instances.push({
          name: inst['@_Name'] ?? '',
          sn: inst['@_SN'] ?? '',
          hmi: inst['@_HMI'] ?? '',
          nti: inst['@_NTI'] ?? '',
          initPss: inst['@_InitPss'],
          children: parseInstances(inst),
        });
      }
      return instances;
    };

    return {
      system: {
        name: system['@_Name'] ?? '',
        id: system['@_Id'] ?? '',
        ffConvertFile: system['@_FFConvertFile'] ?? '',
        schemaVer: system['@_SchemaVer'] ?? '',
        dataVer: system['@_DataVer'] ?? '',
        softwareVersion: system['@_SoftwareVersion'] ?? '',
        releaseTimeTag: system['@_ReleaseTimeTag'] ?? '',
      },
      nodeTypes: parseNodes(system['NodeTypes']),
      nodeTypeSuppliers: this.toArray(system['NodeTypeSuppliers']?.['Supplier']).map((s: any) => ({
        name: s['@_Name'] ?? '',
        nti: s['@_NTI'] ?? '',
        fatherNTI: s['@_FatherNTI'] ?? '',
      })),
      indications: this.toArray(system['Indications']?.['Indication']).map((ind: any) => ({
        name: ind['@_Name'] ?? '',
      })),
      events: this.toArray(system['Events']?.['Event']).map((ev: any) => ({
        id: ev['@_ID'] ?? '',
        name: ev['@_Name'] ?? '',
        desc: ev['@_Desc'] ?? '',
        nti: ev['@_NTI'] ?? '',
        acquitParent: ev['@_AcquitParent'] ?? '',
        severity: ev['@_Severity'] ?? '',
        notification: ev['@_Notification'] ?? '',
      })),
      faults: this.toArray(system['Faults']?.['Fault']).map((f: any) => ({
        id: f['@_ID'] ?? '',
        name: f['@_Name'] ?? '',
        desc: f['@_Desc'] ?? '',
        nti: f['@_NTI'] ?? '',
        severity: f['@_Severity'] ?? '',
        notification: f['@_Notification'] ?? '',
        faultAccusalPercent: f['@_FaultAccusalPercent'] ?? '',
      })),
      propagationRules: [],
      distributionRules: [],
      instances: parseInstances(system['Instances']),
      supplierInstances: this.toArray(system['Suppliers']?.['Supplier']).map((s: any) => ({
        name: s['@_Name'] ?? '',
        hmi: s['@_HMI'] ?? '',
        father: s['@_Father'] ?? '',
        tti: s['@_TTI'] ?? '',
      })),
    };
  }

  /**
   * Constructs flat tree from ModelData and applies UAttr.xml attributes
   */
  public buildTreeFromModel(modelData?: ModelData, attrFilePath?: string): Sensor[] {
    if (!modelData || !modelData.instances || modelData.instances.length === 0) {
      console.warn('[TreeService] No model data available to build tree.');
      return [];
    }

    const userAttrsMap = this.parseUserAttributes(attrFilePath);
    const sensors: SensorsCollection = {};

    this.buildFromInstances(modelData.instances, modelData, null, 0, '', sensors, userAttrsMap);

    // Apply power routing from supplierInstances
    if (modelData.supplierInstances) {
      modelData.supplierInstances.forEach(s => {
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

    const flatTreeArray = this.toArray<Sensor>(sensors);
    console.log(`[TreeService] Built tree from model "${modelData.system.name}" with ${flatTreeArray.length} sensors.`);
    return flatTreeArray;
  }

  /**
   * Recursively converts ModelInstance tree to Sensor nodes applying user attributes.
   */
  private buildFromInstances(
    instances: ModelInstance[],
    model: ModelData,
    parentId: number | null,
    level: number,
    parentIndexPath: string,
    sensors: SensorsCollection,
    userAttrsMap: Map<number, UserAttributeRecord>
  ): void {
    instances.forEach((inst, index) => {
      const id = parseInt(inst.hmi, 10);
      if (isNaN(id)) return;

      const childrenIds = (inst.children || []).map(child => parseInt(child.hmi, 10)).filter(cid => !isNaN(cid));
      const nodeIndexPath = parentIndexPath ? `${parentIndexPath}/${id}` : `/${id}`;

      const ntt = this.findNttByNti(model.nodeTypes, inst.nti);

      let isPowerSupplier = model.supplierInstances.some(s => s.hmi === inst.hmi) || level === 0;
      let isHidden = false;
      let isDisplayAsSystem = level <= 1 || ntt === "System" || ntt === "Sub System";

      // Override properties if specified in UAttr.xml for this node instance (HMI)
      const userAttr = userAttrsMap.get(id);
      if (userAttr) {
        if (userAttr.hidden !== undefined) {
          isHidden = userAttr.hidden;
        }
        if (userAttr.powerSupplier !== undefined) {
          isPowerSupplier = userAttr.powerSupplier;
        }
        if (userAttr.displayAsSystem !== undefined) {
          isDisplayAsSystem = userAttr.displayAsSystem;
        }
      }

      const icon = this.getIconForNode(level, inst.name);
      const parentsIds = parentId !== null ? [parentId] : [];
      const powerParentsIds = [...parentsIds];
      const powerChildrenIds = [...childrenIds];

      sensors[id] = {
        id,
        name: inst.name,
        parentsIds,
        childrenIds,
        isHidden,
        isDisplayAsSystem,
        powerParentsIds,
        powerChildrenIds,
        isPowerSensor: level > 0,
        isPowerSupplier,
        level,
        nodeType: ntt || (level === 0 ? "System" : level === 1 ? "Subsystem" : "Sensor"),
        nodeIndexPath,
        order: index + 1,
        icon
      };

      if (inst.children && inst.children.length > 0) {
        this.buildFromInstances(inst.children, model, id, level + 1, nodeIndexPath, sensors, userAttrsMap);
      }
    });
  }

  /**
   * Emits the tree message exactly as sent from tree.service using socketService.
   */
  public emitTree(sensorsTree?: Sensor[]): Sensor[] {
    const tree = sensorsTree || this.buildTree();
    console.log(`[TreeService] Emitting "${SocketEventName.treeChange}" event with ${tree.length} nodes...`);
    try {
      const socketService = require('./socket-service').default;
      if (socketService && typeof socketService.broadcast === 'function') {
        socketService.broadcast(SocketEventName.treeChange, tree);
      }
    } catch (err) {
      console.error('[TreeService] Failed to broadcast treeChange event:', (err as Error).message);
    }
    return tree;
  }

  /**
   * Builds the tree and emits it to all connected clients.
   */
  public buildAndEmitTree(modelFilePath?: string, attrFilePath?: string): Sensor[] {
    const tree = this.buildTree(modelFilePath, attrFilePath);
    return this.emitTree(tree);
  }
}

const treeService = new TreeService();
export default treeService;
