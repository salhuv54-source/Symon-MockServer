import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import {
  ModelData,
  ModelSystem,
  ModelNode,
  ModelSupplier,
  ModelIndication,
  ModelEvent,
  ModelFault,
  PropagationRule,
  PropagationMoon,
  DistributionRule,
  ModelInstance,
  ModelSupplierInstance,
} from './types';

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseNodes(parentElement: any): ModelNode[] {
  const nodes: ModelNode[] = [];
  const rawNodes = parentElement?.['Node'];
  if (!rawNodes) return nodes;
  const nodeList = Array.isArray(rawNodes) ? rawNodes : [rawNodes];
  for (const n of nodeList) {
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
}

function parseInstances(parentElement: any): ModelInstance[] {
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
}

function parsePropagationRules(rulesElement: any): PropagationRule[] {
  const rules: PropagationRule[] = [];
  const rawRules = rulesElement?.['Rule'];
  if (!rawRules) return rules;
  const list = Array.isArray(rawRules) ? rawRules : [rawRules];
  for (const rule of list) {
    const moons: PropagationMoon[] = [];
    const moonList = toArray(rule['Moon']);
    for (const m of moonList) {
      moons.push({
        type: m['@_Type'] ?? '',
        source: m['@_Source'] ?? '',
        target: m['@_Target'] ?? '',
        count: m['@_Count'] ?? '',
      });
    }
    rules.push({ tti: rule['@_TTI'] ?? '', moons });
  }
  return rules;
}

export async function loadModelFromFile(filePath: string): Promise<ModelData> {
  let xmlContent = fs.readFileSync(filePath, 'utf-8');

  // Strip BOM if present
  if (xmlContent.charCodeAt(0) === 0xFEFF) {
    xmlContent = xmlContent.slice(1);
  }

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

  // System attributes are directly on the element (not under ':@')
  const modelSystem: ModelSystem = {
    name: system['@_Name'] ?? '',
    id: system['@_Id'] ?? '',
    ffConvertFile: system['@_FFConvertFile'] ?? '',
    schemaVer: system['@_SchemaVer'] ?? '',
    dataVer: system['@_DataVer'] ?? '',
    softwareVersion: system['@_SoftwareVersion'] ?? '',
    releaseTimeTag: system['@_ReleaseTimeTag'] ?? '',
  };

  const nodeTypes = parseNodes(system['NodeTypes']);
  const nodeTypeSuppliers: ModelSupplier[] = toArray(system['NodeTypeSuppliers']?.['Supplier']).map((s: any) => ({
    name: s['@_Name'] ?? '',
    nti: s['@_NTI'] ?? '',
    fatherNTI: s['@_FatherNTI'] ?? '',
  }));
  const indications: ModelIndication[] = toArray(system['Indications']?.['Indication']).map((ind: any) => ({
    name: ind['@_Name'] ?? '',
  }));
  const events: ModelEvent[] = toArray(system['Events']?.['Event']).map((ev: any) => ({
    id: ev['@_ID'] ?? '',
    name: ev['@_Name'] ?? '',
    desc: ev['@_Desc'] ?? '',
    nti: ev['@_NTI'] ?? '',
    acquitParent: ev['@_AcquitParent'] ?? '',
    severity: ev['@_Severity'] ?? '',
    notification: ev['@_Notification'] ?? '',
  }));
  const faults: ModelFault[] = toArray(system['Faults']?.['Fault']).map((f: any) => ({
    id: f['@_ID'] ?? '',
    name: f['@_Name'] ?? '',
    desc: f['@_Desc'] ?? '',
    nti: f['@_NTI'] ?? '',
    severity: f['@_Severity'] ?? '',
    notification: f['@_Notification'] ?? '',
    faultAccusalPercent: f['@_FaultAccusalPercent'] ?? '',
  }));
  const propagationRules = parsePropagationRules(system['PropagationRules']);
  const distributionRules: DistributionRule[] = toArray(system['DistributionRules']?.['Rule']).map((r: any) => ({
    eventID: r['@_EventID'] ?? '',
    faultID: r['@_FaultID'] ?? '',
    refSystemName: r['@_RefSystemName'] ?? '',
    lpf: r['@_LPF'] ?? '',
    eventNTI: r['@_EventNTI'] ?? '',
    faultNTI: r['@_FaultNTI'] ?? '',
  }));
  const instances = parseInstances(system['Instances']);
  const supplierInstances: ModelSupplierInstance[] = toArray(system['Suppliers']?.['Supplier']).map((s: any) => ({
    name: s['@_Name'] ?? '',
    hmi: s['@_HMI'] ?? '',
    father: s['@_Father'] ?? '',
    tti: s['@_TTI'] ?? '',
  }));

  return {
    system: modelSystem,
    nodeTypes,
    nodeTypeSuppliers,
    indications,
    events,
    faults,
    propagationRules,
    distributionRules,
    instances,
    supplierInstances,
  };
}