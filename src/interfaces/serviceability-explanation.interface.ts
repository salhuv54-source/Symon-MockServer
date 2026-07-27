import { msgHeader } from "./msgsToAgent.interface";
import { E_SERVICEABILITY, E_SERVICEABILITY_Timeout } from "./sensor.interface";

export interface ServiceabilityExplanationClient {
  nodeId: number;
  nodeName: string;
  pssDescription: string;
  fssDescription: string;
  faultId: number;
}
export interface SymonServiceabilityExplanationData {
  order: number;
  nodeId: number;
  pss_e: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
  fss_e: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
  noFaultsDefined: boolean;
  pssServiceabilitySetBy: SERVICEABILITY_SET_BY;
  fssServiceabilitySetBy: SERVICEABILITY_SET_BY;
  faultSeverity: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
  isNodePhysical: boolean;
  pssFailReasonNodeId: number;
  pssFailReasonFaultId: number;
  fssFailReasonNodeId: number;
  fssFailReasonFaultId: number;
}

export interface HwMapNodeStruct {
  node_id: number;
  pss_e: E_SERVICEABILITY;
  fss_e: E_SERVICEABILITY;
  last_state_change_time: number;
}

export enum SERVICEABILITY_SET_BY {
  SERVICEABILITY_SET_BY_DEFAULT = 0,
  SERVICEABILITY_SET_BY_FAULT = 1,
  SERVICEABILITY_SET_BY_RULE = 2,
}

export enum PROPAGATION_RULE {
  PROPAGATION_RULE_NOT_DEFINED = 0,
  PROPAGATION_RULE_NOT_SATISFIED = 1,
  PROPAGATION_RULE_NODE_TYPE = 2,
  PROPAGATION_RULE_DEPENDENCY_GROUP = 3,
  PROPAGATION_RULE_COMPLICATE = 4,
}

export interface WorstFault {
  noFaultsDefined: boolean;
  faultId: number;
  faultSeverity: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
}

export interface WorstRule {
  ruleType: PROPAGATION_RULE;
  description: string;
  worstSupplierHmi: number;
  ruleResult: E_SERVICEABILITY | E_SERVICEABILITY_Timeout;
}

export enum E_MESSAGE_CODE_FIE {
  E_MESSAGE_GET_SERVICEABILITY_EXPLANATION = 6016,
  E_MESSAGE_SERVICEABILITY_EXPLANATION = 1616,
}

export interface GetServiceabilityExplanation {
  msgHdr: msgHeader;
  nodeHwMapIndex: number;
}

export interface ServiceabilityExplanation {
  msgHdr: msgHeader;
  node: HwMapNodeStruct;
  isNodePhysical: boolean;
  pssServiceabilitySetBy: SERVICEABILITY_SET_BY;
  fssServiceabilitySetBy: SERVICEABILITY_SET_BY;
  worstFault: WorstFault;
  worstPssRule: WorstRule;
  worstFssRule: WorstRule;
  propagateUnknown: boolean;
}

export interface ServiceabilityExplanationCollection {
  [nodeId: string]: SymonServiceabilityExplanationResponse;
}

export interface SymonServiceabilityExplanationResponse {
  nodeId: number;
  data: ServiceabilityExplanationClient[];
}
