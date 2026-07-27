export enum Validity {
    E_VALIDITY_VALUE_INVALID,
    E_VALIDITY_VALID,
    E_VALIDITY_NOT_VALID
}

export enum E_PARAM_TYPE {
    E_PARAM_TYPE_INVALID,
    E_PARAM_TYPE_TEXT,
    E_PARAM_TYPE_VALUE,
    E_PARAM_TYPE_BROWSE
}

export enum E_SYSTEM_INFO_LEVEL {
    E_LEVEL_INVALID,
    E_LEVEL_UNKNOWN,
    E_LEVEL_OK,
    E_LEVEL_VERY_LOW,
    E_LEVEL_HIGH,
    E_LEVEL_VERY_HIGH
}

export enum E_SYSTEM_INFO_DISPLAY_LEVEL {
    E_SYSTEM_INFO_DISPLAY_MODE_CARD = "CARD",
    E_SYSTEM_INFO_DISPLAY_MODE_TABLE = "TABLE",
    E_SYSTEM_INFO_DISPLAY_MODE_TABLE_IN_CARD = "TABLE_IN_CARD"
}

export interface SystemInfoCollection {
    [sensorId: number]: ValuesCollection;
}

export interface ValuesCollection {
    [infoId: string]: SystemInfo;
}

export interface SystemInfo {
    sensorId: number;
    value: number;
    paramType: E_PARAM_TYPE;
    description: string;
    infoLevel: E_SYSTEM_INFO_LEVEL;
    graphName: string;
    date: number;
    infoId: number;
    text: string;
    isNoCommunication: boolean;
    unitType: E_UNIT_TYPE;
    uniqueId?: string;
    uniqueIdWithoutDate?: string;
    group?: string;
    isFavorite?: boolean;
}

export enum E_UNIT_TYPE {
    E_UNIT_TYPE_INVALID = 0,
    E_UNIT_TYPE_VOLTAGE = 1,
    E_UNIT_TYPE_CURRENT = 2,
    E_UNIT_TYPE_TEMPERATURE = 3,
    E_UNIT_TYPE_PRESSURE = 4,
    E_UNIT_TYPE_VOLUME = 5,
    E_UNIT_TYPE_LENGTH = 6,
    E_UNIT_TYPE_WEIGHT = 7,
    E_UNIT_TYPE_NUMBER = 8,
    E_UNIT_TYPE_PROGRESS = 9,
    E_UNIT_TYPE_UNKNOWN = 10,
    E_UNIT_TYPE_SPARE1 = 11,
    E_UNIT_TYPE_SPARE2 = 12,
    E_UNIT_TYPE_SPARE3 = 13,
}
