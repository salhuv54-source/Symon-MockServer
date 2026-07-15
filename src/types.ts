// Types for the model data parsed from FSX files

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

export enum SocketEventName {
  eventsChange = 'eventsChange',
  faultsChange = 'faultsChange',
  alertsChange = 'alertsChange',
  toDeleteAlerts = 'toDeleteAlerts',
  systemsUnreadAlertsCount = 'systemsUnreadAlertsCount',
  userCommandsChange = 'userCommandsChange',
  commandResultTimeFilterChange = 'commandResultTimeFilterChange',
  startUpInBitSensors = 'startUpInBitSensors',
  graphInfoTimeFilterChange = 'graphInfoTimeFilterChange',
  treeChange = 'treeChange',
  serviceability = 'serviceability',
  clientVersion = 'clientVersion',
  serverHealth = 'serverHealth',
  mapsSelectionNames = 'mapsSelectionNames',
  systemStateChange = 'systemStateChange',
  commandOptions = 'commandOptions',
  sensorInBit = 'sensorInBit',
  systemInfo = 'systemInfo',
  keepAlive = 'keepAlive',
  communicationStatus = 'communicationStatus',
  graphInfo = 'graphInfo',
  treeMapOfflineServiceability = 'treeMapOfflineServiceability',
  bitReport = 'bitReport',
  commandsResults = 'commandsResults',
  systemLogTimeFilterChange = 'systemLogTimeFilterChange',
  treeMapFilterChange = 'treeMapFilterChange',
  serverConfigToClient = 'serverConfigToClient',
  clientsPeriodicalOnlineDataRemovelFromStore = 'clientsPeriodicalOnlineDataRemovelFromStore',
  updateNodeVisibility = 'updateNodeVisibility',
}

export enum MainRoutes {
  LOGGER = '/api/log',
  GET_ALL_SYSTEM_LOG = "/api/system-log",
  GET_FAULTS = "/api/faults",
  COMMANDS = "/api/commands",
  SERVER_POLYGONS = '/api/polygons',
  SERVER_MAPS = '/api/maps',
  SERVER_BIT_REPORT_FILES = '/api/bit-report-files',
  LOGIN = '/api/login',
  ALERTS = '/api/alerts',
  ESDUMP = '/api/esdump',
  HEALTH = '/health',
  VERSION = '/version',
  EXPLANATION = '/api/explanation',
  SYSTEM_INFO_LIST = '/api/system-info-list',
  DASHBOARD = '/api/dashboard',
  SYSTEM_PRODUCTS = '/api/system-products',
  FILE_BROWSER_TREE = '/file-tree',
  MAGIC_CHAT_INFO = '/api/magic-chat-info',
  CALIBRATION = '/api/calibration',
}

export enum SubRoutes {
  MAIN = '/',
  RUN_COMMAND = '/run',
  BIT = '/bit',
  TREE = '/tree',
  SYSTEM_INFO = '/system-info',
  DYNAMIC_DIAGRAM = '/dynamic-diagram',
  VALIDATE_TOKEN = 'validateToken',
  BIT_REPORT_LOG_CLICK = '/bit-report-log-click',
  CALIBRATION_LOAD = '/calibration-load',
  CALIBRATION_DELETE = '/calibration-delete',
  BIT_REPORT_TREE_MAP_CLICK = '/bit-report-tre-map-click',
  MULTI_EXPORT = '/multiexport',
  MULTI_IMPORT = '/multiimport',
  MULTI_DELETE = '/multidelete',
  IS_ALIVE = '/isalive',
  IS_READY = '/isready',
  IS_STARTED = '/isstarted',
  METRICS = '/metrics',
  VERSION = '/version',
  SERVICEABILITY = '/serviceability',
  FAULT = '/fault',
  EVENT = '/event',
  UPDATE_FAVORITE = '/updateFavorite',
  SYMON_DATA_MAPPER = '/symon-data-mapper',
  PRODUCTS = '/products',
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

export interface SensorsCollection {
  [id: number]: Sensor;
}
export interface Sensor {
  id: number;
  name: string;
  parentsIds: number[];
  childrenIds: number[];
  isHidden: boolean;
  isDisplayAsSystem: boolean;
  powerParentsIds: number[];
  powerChildrenIds: number[];
  isPowerSensor: boolean;
  isPowerSupplier: boolean;
  level: number;
  nodeType?: string;
  nodeIndexPath?: string;
  order: number;
  icon?: string;
}
