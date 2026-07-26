import { E_SIGN } from "./fault.interface";
import { E_PRIMARY_STATE } from "./system-state.interface";

export interface EventMsg {
    sensorId: number;
    event_id_s32: number;
    node_type_id: number;
    event_class_e: E_EVENT_CLASS;
    date: number;
    status: E_SIGN;
    eventProbability: number;
    reporting_system_e: E_FIE_PROCESS;
    nodeFullPath?: string;
    nodeIndexPath?: string;
    eventName?: string;
    node_serial_number_s32?: number;
    description?: string;
    systemId?: number;
    rootSystemId?: number;
    systemName?: string;
    severity?: string;
    state?: E_PRIMARY_STATE;
    uniqueId?: string;
    uniqueIdWithoutDate?: string;
}

export enum E_EVENT_CLASS {
    E_EVENT_CLASS_INVALID = 0,
    E_EVENT_CLASS_HW_FAULT = 1,
    E_EVENT_CLASS_COMM_PROBLEM = 2,
    E_EVENT_CLASS_SW_PROBLEM = 3,
    E_EVENT_CLASS_CONFIGURATION = 4,
    E_EVENT_CLASS_DATA = 5,
    E_EVENT_CLASS_STATE_CHANGE = 6,
    E_EVENT_CLASS_MBT_FAULT = 7
}

export enum E_FIE_PROCESS {
    E_FIE_PROCESS_INVALID = 0,
    E_FIE_PROCESS_EVENT_SIM = 1,
    E_FIE_PROCESS_HWMAP_SIM = 2,
    E_FIE_PROCESS_RC = 3,
    E_FIE_PROCESS_LCU = 4,
    E_FIE_PROCESS_FIE = 5,
    E_FIE_PROCESS_OC = 6,
    E_FIE_PROCESS_OWS = 7,
    E_FIE_PROCESS_CPS = 8,
    E_FIE_PROCESS_FCU = 9,
    E_FIE_PROCESS_FIE_MANAGER = 10,
    E_FIE_PROCESS_FRD = 11,
    E_FIE_PROCESS_FER = 12,
    E_FIE_PROCESS_MF_STAR = 999
}

export interface EventCollection {
    [eventId_uniq: string]: EventMsg
}
