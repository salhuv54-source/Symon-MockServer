export interface BitReportInfoFile {
    date: number;
    path1: string;
    fileName1: string;
    path2: string;
    fileName2: string;
    id: string;
    reportId: string;
    nodeId: string;
    reportStatus?: E_REPORT_STATUS
}

export enum E_REPORT_STATUS {
    E_REPORT_STATUS_INVALID = 0,
    E_REPORT_STATUS_OK = 1,
    E_REPORT_STATUS_ABORTED = 2,
    E_REPORT_STATUS_TIMEOUR = 3,
    E_REPORT_STATUS_FAILED = 4
}
