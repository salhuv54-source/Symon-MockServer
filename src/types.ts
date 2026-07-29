// Types for the model data parsed from FSX files

import { Router } from "express";

export * from './interfaces/routes.interface';
export * from './interfaces/socket-events.interface';
export * from './interfaces/bit.interface';

export interface ModelSystem {
  name: string;
  id: string;
  ffConvertFile: string;
  schemaVer: string;
  dataVer: string;
  softwareVersion: string;
  releaseTimeTag: string;
}

export interface ModelNode {
  nti: string;
  ti: string;
  tti: string;
  name: string;
  isPhysical: string;
  isCritical: string;
  initFss: string;
  initPss: string;
  ntt: string;
  children?: ModelNode[];
}

export interface ModelSupplier {
  name: string;
  nti: string;
  fatherNTI: string;
}

export interface ModelIndication {
  name: string;
}

export interface ModelEvent {
  id: string;
  name: string;
  desc: string;
  nti: string;
  acquitParent: string;
  severity: string;
  notification: string;
}

export interface ModelFault {
  id: string;
  name: string;
  desc: string;
  nti: string;
  severity: string;
  notification: string;
  faultAccusalPercent: string;
}

export interface PropagationMoon {
  type: string;
  source: string;
  target: string;
  count: string;
}

export interface PropagationRule {
  tti: string;
  moons: PropagationMoon[];
}

export interface DistributionRule {
  eventID: string;
  faultID: string;
  refSystemName: string;
  lpf: string;
  eventNTI: string;
  faultNTI: string;
}

export interface ModelInstance {
  name: string;
  sn: string;
  hmi: string;
  nti: string;
  initPss?: string;
  children?: ModelInstance[];
}

export interface ModelSupplierInstance {
  name: string;
  hmi: string;
  father: string;
  tti: string;
}

export interface ModelData {
  system: ModelSystem;
  nodeTypes: ModelNode[];
  nodeTypeSuppliers: ModelSupplier[];
  indications: ModelIndication[];
  events: ModelEvent[];
  faults: ModelFault[];
  propagationRules: PropagationRule[];
  distributionRules: DistributionRule[];
  instances: ModelInstance[];
  supplierInstances: ModelSupplierInstance[];
}

enum NotConfigurableDataType {
  ATTRIBUTES = "ATTRIBUTES",
  COMMAND_OPTIONS = "COMMAND_OPTIONS",
  EVENT = "EVENT",
  EVENT_TYPE_LIST = "EVENT_TYPE_LIST",
  FAULT = "FAULT",
  FAULT_TYPE_LIST = "FAULT_TYPE_LIST",
  SENSOR_TREE = "SENSOR_TREE",
  SERVICEABILITY = "SERVICEABILITY",
  SYSTEM_INFO = "SYSTEM_INFO",
  SYSTEM_STATE = "SYSTEM_STATE",
  SYMON_VERSION_ABOUT = "SYMON_VERSION_ABOUT",
  HEALTH = "HEALTH",
  MAPS_SELECTION_NAMES = "MAPS_SELECTION_NAMES",
  KEEP_ALIVE = "KEEP_ALIVE",
  MODEL_HIDDEN_NODES = "MODEL_HIDDEN_NODES"
}

enum ConfigurableDataType {
  ALERT = "ALERT",
  BIT_REPORT = "BIT_REPORT",
  BIT_COMMAND_RESULT = "BIT_COMMAND_RESULT",
  USER_COMMAND = "USER_COMMAND",
  STATION_NAMES = "STATION_NAMES",
  BIT_REPORT_INFO_FILE = "BIT_REPORT_INFO_FILE"
}

export const DataType = {
  ...NotConfigurableDataType,
  ...ConfigurableDataType
}

export type DataType =
  | NotConfigurableDataType
  | ConfigurableDataType;
