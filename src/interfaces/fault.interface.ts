import { BitOperationType, BitReportDocTypes } from "../types";
import { E_SERVICEABILITY } from "./sensor.interface";
import { E_PRIMARY_STATE } from "./system-state.interface";

export interface SingleFault {
    sensorId: number;
    faultId: number;
    probability: number;
    status: E_SIGN;
    date: number;
    uniqueIdWithoutDate: string;
    uniqueId: string;
    AlternativeToUniqueId: number;
    nodeFullPath?: string;
    nodeIndexPath?: string;
    faultName?: string;
    fieUniqueId?: number;
    description?: string;
    systemId?: number;
    rootSystemId?: number;
    systemName?: string;
    serviceability?: E_SERVICEABILITY;
    severity?: string;
    state?: E_PRIMARY_STATE;
    docType?: BitReportDocTypes;
    bitOperationType?: BitOperationType;
    reportId?: string;
    source?: string;
}

export interface BitFault extends SingleFault {
    faultDtatusDescription: string;
    nodeName: string;
}

export interface FaultCollection {
    [faultUniqID: string]: SingleFault;
}

export enum E_SIGN {
    E_SIGN_OK,
    E_SIGN_UNKNOWN,
    E_SIGN_PRIMARY,
    E_SIGN_ALTERNATIVE,
    E_SIGN_NOT_APPLICABLE,
    E_SIGN_INVALID
}
