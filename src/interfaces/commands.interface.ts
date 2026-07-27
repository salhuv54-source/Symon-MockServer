import { BitOperationType } from "../types";
import { BitReportInfoFile } from "./bit-report-info-file";
import { E_SERVICEABILITY, E_SERVICEABILITY_Timeout, SensorStatus } from "./sensor.interface";


export enum E_POWER_STATUS {
  INVALID = 0,
  DISABLED = 2,
  IN_PROCESS = 3,
  OFF = 4,
  ON = 5,
  ALL = -1, //for display filter sensors by power status only
}

export interface CommandResultCollection {
  [resultId: number]: CommandResult;
}

export interface CommandOptionCollection {
  [sensorId: number]: SplitCommandOptions;
}

export interface SplitCommandOptions {
  nonPowerCommands: CommandsCollection;
  powerCommands: CommandsCollection;
  powerStatus?: { status: E_POWER_STATUS };
  powerSliderCommand?: CommandOptions;
}

export interface CommandsCollection {
  [uniqueId: string]: CommandOptions;
}

export interface Command {
  sensorId: number;
  commandName: string;
  stationName: string;
  commandId: number;
  commandTimeOutValueInMs: number;
  commandStatus?: CommandStatus;
}

export interface CommandOptions extends Command {
  groupId: E_GROUP_ID;
  updateTime: number;
  additionalParams: Additional_params; //currently unused
}

export interface PowerCommandOption {
  nonOnOffCommands: CommandOptions[];
  onCommand: CommandOptions;
  offCommand: CommandOptions;
}

export interface Additional_params {
  num_of_parameters_u32: number;
  parameters: Parameter[];
}

export interface Parameter {
  parameter_type_e: E_PARAM_TYPE;
  name_u8: string;
  text_u8: string;
  value_f: number;
  description_u8: string;
}

export interface CommandResult extends Command {
  commandResultId: number;
  date: number;
  initiatorFaultId: number | null;
  bitReportInfoFileNodeId?: number;
  isDeleted?: boolean;
  initiatorNodeId?: number;
  creationTimeDateObject?: Date;
  systemName?: string;
  reportId?: string;
  mapFileName?: string;
  reportEndTime?: number;
  reportStatus?: SensorStatus;
  reportDisplayStatus?: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
  reportFile?: BitReportInfoFile;
  bitOperationType?: BitOperationType;
}

export enum CommandStatus {
  E_COMMAND_STATUS_INVALID = 0,
  E_COMMAND_STATUS_ENABLED = 1,
  E_COMMAND_STATUS_DISABLED = 2,
  E_COMMAND_STATUS_IN_PROCESS = 3,
}

export enum E_GROUP_ID {
  "E_GROUP_ID_INVALID" = 0,
  "E_GROUP_ID_BIT" = 1,
  "E_GROUP_ID_CAL" = 2,
  "E_GROUP_ID_STATE" = 3,
  "E_GROUP_ID_PFM" = 4,
  "E_GROUP_ID_ALIGNMENT" = 5,
  "E_GROUP_ID_POWER" = 6,
  "E_GROUP_ID_SPARE3" = 7,
  "E_GROUP_ID_SPARE4" = 8,
  "E_GROUP_ID_SPARE5" = 10,
  "E_GROUP_ID_SPARE6" = 11,
  "E_GROUP_ID_SPARE7" = 12,
  "E_GROUP_ID_SPARE8" = 13,
  "E_GROUP_ID_SPARE9" = 14,
  "E_GROUP_ID_SPARE10" = 15,
}

export enum E_PARAM_TYPE {
  "E_PARAM_TYPE_INVALID" = 0,
  "E_PARAM_TYPE_TEXT" = 1,
  "E_PARAM_TYPE_VALUE" = 2,
  "E_PARAM_TYPE_BROWSE" = 3,
  "E_PARAM_TYPE_ID" = 4,
  "E_PARAM_TYPE_SPARE1" = 5,
  "E_PARAM_TYPE_SPARE2" = 6,
  "E_PARAM_TYPE_REMOVE" = 7,
}
