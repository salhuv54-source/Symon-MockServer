import { E_SERVICEABILITY } from "./sensor.interface";

export interface FaultsTypesList {
  [uniqueId: string]: FaultsType;
}

export interface FaultsType {
  uniqueId: string;
  hwMapIndex: number;
  faultId: number;
  descriptionContent: string;
  descriptionName: string;
  serviceability?: E_SERVICEABILITY;
  severity?: string;
}
