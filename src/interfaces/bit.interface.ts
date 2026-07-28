import { BitReportInfoFile } from "./bit-report-info-file";
import { FaultCollection } from "./fault.interface";
import { SensorStatusCollection } from "./sensor.interface";

export interface InBitSensorClientData {
  nodeId: number;
  bitOperationType: BitOperationType;
}

export interface InBitSensorClientDataCollection {
  [nodeId: number]: InBitSensorClientData;
}
export enum BitOperationType {
  BIT = "BIT",
  CALIBRATION = "CALIBRATION",
}

export enum BitReportDocTypes {
  REPORT_DOC_TYPE = 0,
  FAULT_DOC_TYPE = 1,
  SERVICEABILITY_DOC_TYPE = 2,
}

export interface BitReports {
  [desc_time: string]: BitReport;
}

export interface BitReport {
  reportId: string;
  type: string;
  uniqueId: string; // needed for saving faulls,serviceability, bitrport in one elastic query
  docType: BitReportDocTypes;
  systemId: number;
  initiatorNodeId: number;
  initiatorNodeName: string;
  mapFileName: string;
  date: number;
  currentInProgressFaults: string[];
  allSensorIdsThatPartake: number[];
  bitReportInfoFileNodeId: number;

  isDeleted?: boolean;
  reportFile?: BitReportInfoFile;
  endTime?: number;
  bitOperationType?: BitOperationType;
  estimatedEndTime?: number;
  commandResultCreationTime?: number;
  commandResultId?: number;

  faults: FaultCollection;
  nodesServiceability: SensorStatusCollection;
}
