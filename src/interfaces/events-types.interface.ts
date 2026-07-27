export interface EventsTypesList {
  [uniqueId: string]: EventType;
}

export interface EventType {
  uniqueId: string;
  hwMapIndex: number;
  eventId: number;
  descriptionName: string;
  descriptionContent: string;
  severity?: string;
}
