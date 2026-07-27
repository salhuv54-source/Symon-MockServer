import {
  FaultIdentification,
  E_EVENT_SIGN,
} from "./fault-explanation.interface";
import { E_SIGN } from "./faults.interface";
import { msgHeader } from "./msgsToAgent.interface";

export enum PROBABILITY_LEVEL {
  PROBABILITY_LEVEL_NONE = 0,
  PROBABILITY_LEVEL_LOW = 1,
  PROBABILITY_LEVEL_MEDIUM = 2,
  PROBABILITY_LEVEL_HIGH = 3,
}

export enum E_MESSAGE_CODE_FIE {
  E_MESSAGE_GET_EVENT_EXPLANATION = 6014,
  E_MESSAGE_EVENT_EXPLANATION = 1614,
}

export interface GetEventExplanationMessage {
  msgHdr: msgHeader;
  eventIdentification: EventIdentification;
}

export interface EventIdentification {
  hwMapIndex: number;
  id: number;
  eventSign: E_EVENT_SIGN;
}

export interface EventExplanation {
  msgHdr: msgHeader;
  ev: EventIdentification;
  numFaults: number;
  faultStat: FaultStatistics[];
}

export interface FaultStatistics {
  faultIdentification: FaultIdentification;
  status: E_SIGN;
  probabilityLevel: PROBABILITY_LEVEL;
  numOfBlamingEvents: number;
  percentOfEventsToBlame: number;
  receivedEventsCounter: number;
  receivedPercent: number;
}

export interface EventExplanationCollection {
  [uniqueId: string]: EventExplanationToClient;
}

export interface EventExplanationFaultsCollection {
  [uniqueId: string]: EventExplanationFaultsToClient;
}

export interface EventExplanationToClient {
  nodeId: number;
  eventId: number;
  eventName: string;
  numOfFaults: number;
  faults: EventExplanationFaultsCollection;
}
export interface EventExplanationFaultsToClient {
  hwMapIndex: number;
  id: number;
  faultName: string;
  faultDescription: string;
  nodeParentsPath: string;
}
