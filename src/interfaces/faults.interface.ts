import { BitOperationType, BitReportDocTypes } from "../types";
import { E_SERVICEABILITY } from "./sensor.interface";
import { E_PRIMARY_STATE } from "./system-state.interface";

//status of fault
export enum E_SIGN {
  E_SIGN_OK,
  E_SIGN_UNKNOWN,
  E_SIGN_PRIMARY,
  E_SIGN_ALTERNATIVE,
  E_SIGN_NOT_APPLICABLE,
  E_SIGN_INVALID,
}

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
  fieUniqueId: number;
  description?: string;
  systemId?: number;
  rootSystemId?: number;
  systemName?: string;
  serviceability?: E_SERVICEABILITY;
  severity?: string;
  state?: E_PRIMARY_STATE;
  // sruType?: string;
  // lruType?: string;
  // subsystemType?: string;
  // vehicleType?: string;
  // systemType?: string;
  docType?: BitReportDocTypes;
  bitOperationType?: BitOperationType;
  reportId?: string;
  source?: string;
}

export interface BitFault extends SingleFault {
  faultStatusDescription: string;
  nodeName: string;
}

// export interface NodeFaultDetails {
//     [faultID: number]: SingleFault;
// }
//
// export interface NodeFaultCollection {
//     [nodeID: number]: NodeFaultDetails;
// }

export interface FaultCollection {
  [faultUniqeID: string]: SingleFault;
}
