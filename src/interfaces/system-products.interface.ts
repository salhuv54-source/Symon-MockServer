export interface ServiceData {
  name: string;
  status: string;
  version: string;
  isVersionStatusMatch: boolean;
  services?: ServiceData[]; // Allow nested services
}

export interface SystemProductNode {
  name: string;
  services?: ServiceData[];
}
