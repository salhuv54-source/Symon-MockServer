import { E_SERVICEABILITY, E_SERVICEABILITY_Timeout } from "../types";

export enum E_PRIMARY_STATE {
    E_PRIMARY_STATE_INVALID = 0,
    E_PRIMARY_STATE_INIT = 1,
    E_PRIMARY_STATE_STANDBY = 2,
    E_PRIMARY_STATE_MAINTENANCE = 3,
    E_PRIMARY_STATE_OPERATE = 4,
    E_PRIMARY_STATE_SHUTDOWN = 5,
    E_PRIMARY_STATE_OFF = 6,
    E_PRIMARY_STATE_ERROR = 7,
    E_PRIMARY_STATE_UNKNOWN = 99,
    E_PRIMARY_STATE_ = "E_PRIMARY_STATE_"
}

export interface SystemState {
    id: number;
    name: string;
    primaryStatus: E_PRIMARY_STATE;
    isDisplayAsSystem: boolean;
    isPowerSystem: boolean;
    secondaryStatus?: string;
    date?: number;
    uniqueId?: string;
    status?: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
    isNoCommunication: boolean;
    order?: number;
    icon?: string;
}

export interface SystemStateCollection {
    [id: number]: SystemState;
}
