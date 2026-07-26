export interface DataStatusBuild extends ServerDataStatusBase {
    getStatus?: string;
    getIsDataArrived?: (data: string) => boolean;
    getMessage?: (messgae?: string, isDataRecieved?: boolean) => string;
}

export interface ServerDataStatusBase {
    order: number;
    message?: string;
    dataType?: string;
}

export interface ServerDataStatusToClient extends ServerDataStatusBase {
    isDataReceived: boolean;
    status: string;
}

export interface ServerDataStatusToClientCollection {
    [type: string]: ServerDataStatusToClient;
}

export enum DataStatusType {
    CONNECTED_TO_SERVER = "Connected to server",
    CONNECTED_TO_RABBIT = "Connected to rabbit",
    CONNECTED_TO_DB = "Connected to"
}
