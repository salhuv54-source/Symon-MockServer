import { msgHeader } from "./msgsToAgent.interface";

export enum E_EVENT_SIGN {
  E_EVENT_SIGN_OK = 0,
  E_EVENT_SIGN_UNKNOWN = 1,
  E_EVENT_SIGN_FAIL = 2,
  E_EVENT_SIGN_SPARE1 = 3,
  E_EVENT_SIGN_SPARE2 = 4,
  E_EVENT_SIGN_INVALID = 5,
}

export interface FaultEvent {
  hwMapIndex: number;
  id: number;
  eventSign: E_EVENT_SIGN;
}

export enum E_MESSAGE_CODE_FIE {
  E_MESSAGE_GET_FAULT_EXPLANATION = 6015,
  E_MESSAGE_FAULT_EXPLANATION = 1615,
}

export interface GetFaultExplanationMessage {
  msgHdr: msgHeader;
  faultIdentification: FaultIdentification;
}

export interface FaultIdentification {
  hwMapIndex: number;
  id: number;
}

export interface FaultExplanation {
  msgHdr: msgHeader;
  fault: FaultIdentification;
  numEvents: number;
  numOfBlamingEvents: number;
  percentOfEventsToBlame: number;
  events: FaultEvent[];
}

export interface FaultExplanationCollection {
  [uniqueId: string]: FaultExplanationToClient;
}

export interface FaultExplanationEventsCollection {
  [uniqueId: string]: FaultExplanationEventsToClient;
}

export interface FaultExplanationToClient {
  nodeId: number;
  faultId: number;
  faultName: string;
  numOfEvents: number;
  numOfBlamingEvents: number;
  precentOfEventsToBlame: number;
  events: FaultExplanationEventsCollection;
}
export interface FaultExplanationEventsToClient {
  hwMapIndex: number;
  id: number;
  eventName: string;
  eventDescription: string;
  eventSign: E_EVENT_SIGN;
  nodeParentsPath: string;
}
