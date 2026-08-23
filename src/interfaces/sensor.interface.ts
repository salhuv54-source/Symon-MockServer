import { BitOperationType, BitReportDocTypes } from "../types";

export interface SensorsCollection {
    [id: number]: Sensor;
}
export interface SensorStatusCollection {
    [id: number]: SensorStatus;
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

export interface SensorStatus {
    node_id: number;
    sensorId?: number;
    systemId?: number;
    rootSystemId?: number;
    systemName?: string;
    nodeFullPath?: string;
    nodeIndexPath?: string;
    uniqueId: string;
    pss_e: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
    fss_e: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
    last_state_change_time: number;
    docType?: BitReportDocTypes;
    bitOperationType?: BitOperationType;
    reportId?: string;
    isDeleted?: boolean;
}


export enum E_SERVICEABILITY {
    E_SERVICEABILITY_OK = 0,
    E_SERVICEABILITY_DEGRADED = 1,
    E_SERVICEABILITY_FAIL = 2,
    E_SERVICEABILITY_UNKNOWN = 3,
    E_SERVICEABILITY_INVALID = 4,
    E_SERVICEABILITY_NOT_APPLICABLE = 5,
    E_SERVICEABILITY_NOT_CONFIG = 6,
    E_SERVICEABILITY_PSS_XOR_FSS = 8
}
export enum E_SERVICEABILITY_Timeout {
    E_SERVICEABILITY_TIMEOUT = 7
}
