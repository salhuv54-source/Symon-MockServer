import { DataStatusType } from "./DataStatusBuild.interface";

export interface KeepAliveLastMessage {
  siteName: string;
  lastUpdateTime: number;
}

export interface KeepAliveLastMessagesCollection {
  [type: string]: KeepAliveLastMessage;
}
export interface KeepAlive {
  siteName: string;
  date: number;
  status: DataStatusType;
  isNoCommunication: boolean;
}

export interface KeepAliveBySiteCollection {
  [type: string]: KeepAlive;
}
