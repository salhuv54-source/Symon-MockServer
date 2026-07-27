import { Additional_params, CommandStatus, E_GROUP_ID } from "./commands.interface";

export interface CommandMsgToAgent {
  msg_name: string;
  msg_id: number;
  msg_library_name: string;
  properties: {
    msg_hdr: msgHeader;
    systems_commands: {
      node_id: number;
      n_repetitions: n_repetitions;
      system_commands: system_command[];
    };
  };
}

export interface n_repetitions {
  n_repetitions_u32: number;
  spare1_u32: number;
}

export interface system_command {
  command_id_u32: number;
  command_name_u8: string;
  group_id_e: E_GROUP_ID;
  station_name_u8: string;
  command_status_e: CommandStatus;
  additional_params: Additional_params;
}

export interface msgHeader {
  message_code_e: number;
  message_length_u32: number;
  date_time: TimeToAgent;
  message_number_u32: number;
  source_process_id_e: E_PROCESS_SYMON;
  destination_process_id_e: E_PROCESS_SYMON;
  spare1_u8: number;
  spare2_u8: number;
  spare3_u8: number;
  spare4_u8: number;
}

export interface TimeToAgent {
  sec_01011970_till_midnight_s32: number;
  time_of_day_in_millisec_s32: number;
}

export enum E_MESSAGE_CODE_SYMON {
  E_MESSAGE_CODE_SYMON_INVALID = 0,
  E_MESSAGE_CODE_SYMON_COMMANDS = 480,
  E_MESSAGE_CODE_SYMON_SYSTEM_INFO = 481,
  E_MESSAGE_CODE_SYMON_SYSTEM_ALERT = 482,
  E_MESSAGE_CODE_SYMON_SYSTEM_STATE_REPORT = 484,
  E_MESSAGE_CODE_SYMON_FIE_EventMessage = 485,
  E_MESSAGE_CODE_SYMON_FIE_SystemHwMapMessage = 486,
  E_MESSAGE_CODE_SYMON_TABLES = 487,
  E_MESSAGE_CODE_SYMON_TABLE_ELEMENT_UPDATE = 488,
  E_MESSAGE_CODE_SYMON_COMMUNICATION_STATUS = 490,
}

export enum E_PROCESS_SYMON {
  E_PROCESS_SYMON_INVALID = 0,
  E_PROCESS_SYMON_AGENT_1 = 601,
  E_PROCESS_SYMON_AGENT_2 = 602,
  E_PROCESS_SYMON_AGENT_3 = 603,
  E_PROCESS_SYMON_AGENT_4 = 604,
  E_PROCESS_SYMON_AGENT_5 = 605,
  E_PROCESS_SYMON_AGENT_6 = 606,
  E_PROCESS_SYMON_AGENT_7 = 607,
  E_PROCESS_SYMON_AGENT_8 = 608,
  E_PROCESS_SYMON_AGENT_9 = 609,
  E_PROCESS_SYMON_AGENT_10 = 610,
  E_PROCESS_SYMON_AGENT_11 = 611,
  E_PROCESS_SYMON_AGENT_12 = 612,
  E_PROCESS_SYMON_AGENT_13 = 613,
  E_PROCESS_SYMON_AGENT_14 = 614,
  E_PROCESS_SYMON_AGENT_15 = 615,
  E_PROCESS_SYMON_AGENT_16 = 616,
  E_PROCESS_SYMON_AGENT_17 = 617,
  E_PROCESS_SYMON_AGENT_18 = 618,
  E_PROCESS_SYMON_AGENT_19 = 619,
  E_PROCESS_SYMON_AGENT_20 = 620,
  E_PROCESS_SYMON_AGENT_21 = 621,
  E_PROCESS_SYMON_AGENT_22 = 622,
  E_PROCESS_SYMON_AGENT_23 = 623,
  E_PROCESS_SYMON_AGENT_24 = 624,
  E_PROCESS_SYMON_AGENT_25 = 625,
  E_PROCESS_SYMON_AGENT_26 = 626,
  E_PROCESS_SYMON_AGENT_27 = 627,
  E_PROCESS_SYMON_AGENT_28 = 628,
  E_PROCESS_SYMON_AGENT_29 = 629,
  E_PROCESS_SYMON_AGENT_30 = 630,
  E_PROCESS_SYMON_MTC = 640,
  E_PROCESS_SYMON_FIE = 641,
  E_PROCESS_SYMON_IT_MANAGER = 642,
}
