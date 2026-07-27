import * as fs from 'fs';
import * as path from 'path';
import appStore from './app-store';
import { ModelInstance, BitReportDocTypes, BitOperationType } from './types';
import { EventMsg, E_EVENT_CLASS, E_FIE_PROCESS } from './interfaces/event.interface';
import { SingleFault, E_SIGN } from './interfaces/fault.interface';
import { E_PRIMARY_STATE } from './interfaces/system-state.interface';
import { E_SERVICEABILITY } from './interfaces/sensor.interface';

interface EnrichedInstance {
  inst: ModelInstance;
  fullPath: string;
  indexPath: string;
}

const collectAllInstances = (instances: ModelInstance[]): EnrichedInstance[] => {
  const result: EnrichedInstance[] = [];
  function traverse(list: ModelInstance[], parentFullPath: string, parentIndexPath: string) {
    for (const inst of list) {
      const currentFullPath = parentFullPath ? `${parentFullPath}/${inst.name}` : `/${inst.name}`;
      const currentIndexPath = parentIndexPath ? `${parentIndexPath}/${inst.hmi}` : `/${inst.hmi}`;
      result.push({
        inst,
        fullPath: currentFullPath,
        indexPath: currentIndexPath
      });
      if (inst.children && inst.children.length > 0) {
        traverse(inst.children, currentFullPath, currentIndexPath);
      }
    }
  }
  traverse(instances, '', '');
  return result;
};

export function getAllModelEvents(): EventMsg[] {
  const activeModel = appStore.getActiveModel();
  const eventPayload: EventMsg[] = [];

  if (activeModel && activeModel.events && activeModel.events.length > 0 && activeModel.instances && activeModel.instances.length > 0) {
    const flatInstances = collectAllInstances(activeModel.instances);
    const matches: Array<{ evt: any; enriched: EnrichedInstance }> = [];

    const rootSystemId = (activeModel.instances && activeModel.instances.length > 0)
      ? (parseInt(activeModel.instances[0].hmi, 10) || parseInt(activeModel.system.id, 10) || 1)
      : (parseInt(activeModel.system.id, 10) || 1);

    activeModel.events.forEach(evt => {
      flatInstances.forEach(enriched => {
        if (evt.nti === enriched.inst.nti) {
          matches.push({ evt, enriched });
        }
      });
    });

    matches.forEach(({ evt, enriched }) => {
      const inst = enriched.inst;
      const reportingSystem = parseInt(activeModel.system.id, 10) || 1;
      const eventId = parseInt(evt.id, 10) || 0;
      const nodeTypeId = parseInt(evt.nti, 10) || 0;

      const eventClasses = [
        E_EVENT_CLASS.E_EVENT_CLASS_HW_FAULT,
        E_EVENT_CLASS.E_EVENT_CLASS_COMM_PROBLEM,
        E_EVENT_CLASS.E_EVENT_CLASS_SW_PROBLEM,
        E_EVENT_CLASS.E_EVENT_CLASS_CONFIGURATION,
        E_EVENT_CLASS.E_EVENT_CLASS_DATA,
        E_EVENT_CLASS.E_EVENT_CLASS_STATE_CHANGE
      ];
      const eventClass = evt.severity === 'NG' ? E_EVENT_CLASS.E_EVENT_CLASS_SW_PROBLEM : E_EVENT_CLASS.E_EVENT_CLASS_COMM_PROBLEM;
      const serialNumber = parseInt(inst.sn, 10) || 1;
      const hwMapIndex = parseInt(inst.hmi, 10);
      const status = E_SIGN.E_SIGN_PRIMARY;
      const eventProbability = 0.85;

      eventPayload.push({
        sensorId: hwMapIndex,
        event_id_s32: eventId,
        node_type_id: nodeTypeId,
        event_class_e: eventClass,
        date: Date.now() - Math.floor(Math.random() * 86400000),
        status: status,
        eventProbability: eventProbability,
        reporting_system_e: reportingSystem as E_FIE_PROCESS,
        node_serial_number_s32: serialNumber,
        eventName: evt.name,
        description: evt.desc,
        severity: evt.severity,
        systemId: hwMapIndex,
        rootSystemId: rootSystemId,
        systemName: activeModel.system.name,
        nodeFullPath: enriched.fullPath,
        nodeIndexPath: enriched.indexPath,
        state: E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
        uniqueId: `uuid-${hwMapIndex}-${Date.now()}`,
        uniqueIdWithoutDate: `uuid-${hwMapIndex}-${eventId}`
      });
    });
  }

  // Fallback: Read eventmsg.json if no model matches were found
  if (eventPayload.length === 0) {
    const eventMsgPath = path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'fie_messages', 'eventmsg.json');
    if (fs.existsSync(eventMsgPath)) {
      const rawContent = fs.readFileSync(eventMsgPath, 'utf-8');
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          const evt = item.properties?.evt || {};
          const hwMapIndex = evt.hw_map_index || 1;
          const eventId = evt.event_id_s32 || 1;
          eventPayload.push({
            sensorId: hwMapIndex,
            event_id_s32: eventId,
            node_type_id: evt.node_type_id || 1,
            event_class_e: evt.event_class_e || E_EVENT_CLASS.E_EVENT_CLASS_SW_PROBLEM,
            date: Date.now() - Math.floor(Math.random() * 86400000),
            status: evt.sign_e === 1 ? E_SIGN.E_SIGN_PRIMARY : E_SIGN.E_SIGN_ALTERNATIVE,
            eventProbability: evt.eventProbability || 0.5,
            reporting_system_e: evt.reporting_system_e || E_FIE_PROCESS.E_FIE_PROCESS_EVENT_SIM,
            node_serial_number_s32: evt.node_serial_number_s32 || 1,
            nodeFullPath: `/FallbackNode/Sensor_${hwMapIndex}`,
            nodeIndexPath: `/${hwMapIndex}`,
            eventName: `FALLBACK_EVENT_${eventId}`,
            description: `Fallback event description for ID ${eventId}`,
            systemId: hwMapIndex,
            rootSystemId: 1,
            systemName: "FallbackSystem",
            severity: "NG",
            state: E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
            uniqueId: `uuid-fallback-${hwMapIndex}-${Date.now()}`,
            uniqueIdWithoutDate: `uuid-fallback-${hwMapIndex}-${eventId}`
          });
        });
      }
    }
  }

  return eventPayload;
}

export function getAllModelFaults(): SingleFault[] {
  const activeModel = appStore.getActiveModel();
  const faultPayload: SingleFault[] = [];

  if (activeModel && activeModel.faults && activeModel.faults.length > 0 && activeModel.instances && activeModel.instances.length > 0) {
    const flatInstances = collectAllInstances(activeModel.instances);
    const matches: Array<{ fault: any; enriched: EnrichedInstance }> = [];

    const rootSystemId = (activeModel.instances && activeModel.instances.length > 0)
      ? (parseInt(activeModel.instances[0].hmi, 10) || parseInt(activeModel.system.id, 10) || 1)
      : (parseInt(activeModel.system.id, 10) || 1);

    activeModel.faults.forEach(fault => {
      flatInstances.forEach(enriched => {
        if (fault.nti === enriched.inst.nti) {
          matches.push({ fault, enriched });
        }
      });
    });

    matches.forEach(({ fault, enriched }, index) => {
      const inst = enriched.inst;
      const faultId = parseInt(fault.id, 10) || 0;
      const hwMapIndex = parseInt(inst.hmi, 10);
      const uniqueIdNum = parseInt(`${hwMapIndex}${faultId}`, 10) || (hwMapIndex + faultId);

      faultPayload.push({
        sensorId: hwMapIndex,
        faultId: faultId,
        probability: 0.9,
        status: E_SIGN.E_SIGN_PRIMARY,
        date: Date.now() - Math.floor(Math.random() * 86400000),
        uniqueIdWithoutDate: `uuid-fault-${hwMapIndex}-${faultId}`,
        uniqueId: `uuid-fault-${hwMapIndex}-${Date.now()}-${index}`,
        AlternativeToUniqueId: -1,
        nodeFullPath: enriched.fullPath,
        nodeIndexPath: enriched.indexPath,
        faultName: fault.name,
        fieUniqueId: uniqueIdNum,
        description: fault.desc,
        systemId: hwMapIndex,
        rootSystemId: rootSystemId,
        systemName: activeModel.system.name,
        serviceability: E_SERVICEABILITY.E_SERVICEABILITY_OK,
        severity: fault.severity,
        state: E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
        docType: BitReportDocTypes.FAULT_DEC_TYPE,
        bitOperationType: BitOperationType.BIT,
        reportId: `rep-${Math.floor(Math.random() * 10000)}`,
        source: `Model_Fault_${faultId}`
      });
    });
  }

  // Fallback: Read occurredFaults.json if no model matches were found
  if (faultPayload.length === 0) {
    const fallbackPath = path.resolve(__dirname, '..', 'assets', 'mock-data-jsons', 'fie_messages', 'occurredFaults.json');
    if (fs.existsSync(fallbackPath)) {
      const rawContent = fs.readFileSync(fallbackPath, 'utf-8');
      const parsed = JSON.parse(rawContent);
      if (parsed && Array.isArray(parsed.faultMessages)) {
        parsed.faultMessages.forEach((msg: any) => {
          const node_id = msg.node?.node_id || 1;
          if (Array.isArray(msg.faults)) {
            msg.faults.forEach((f: any, idx: number) => {
              const hwMapIndex = f.hw_map_index || node_id;
              const faultId = f.faultId || 1;
              faultPayload.push({
                sensorId: hwMapIndex,
                faultId: faultId,
                probability: f.probability || 0.5,
                status: f.faultStatus === 2 ? E_SIGN.E_SIGN_PRIMARY : E_SIGN.E_SIGN_ALTERNATIVE,
                date: Date.now() - Math.floor(Math.random() * 86400000),
                uniqueIdWithoutDate: `uuid-fault-fallback-${hwMapIndex}-${faultId}`,
                uniqueId: `uuid-fault-fallback-${hwMapIndex}-${Date.now()}-${idx}`,
                AlternativeToUniqueId: f.AlternativeToUniqueId || -1,
                nodeFullPath: `/FallbackNode/Sensor_${hwMapIndex}`,
                nodeIndexPath: `/${hwMapIndex}`,
                faultName: `FALLBACK_FAULT_${faultId}`,
                fieUniqueId: f.UniqueId || (hwMapIndex + faultId),
                description: `Fallback fault description for ID ${faultId}`,
                systemId: hwMapIndex,
                rootSystemId: 1,
                systemName: "FallbackSystem",
                serviceability: msg.node?.pss_e || E_SERVICEABILITY.E_SERVICEABILITY_OK,
                severity: "NG",
                state: E_PRIMARY_STATE.E_PRIMARY_STATE_OPERATE,
                docType: BitReportDocTypes.FAULT_DEC_TYPE,
                bitOperationType: BitOperationType.BIT,
                reportId: `rep-fallback-${hwMapIndex}`,
                source: "Fallback_File"
              });
            });
          }
        });
      }
    }
  }

  return faultPayload;
}

/**
 * Returns the events and faults connected to a specific SelectedSystemId.
 */
export function getEventsAndFaultsForSystem(selectedSystemIdInput: any): { events: EventMsg[]; faults: SingleFault[] } {
  let selectedId: number | null = null;

  if (typeof selectedSystemIdInput === 'number') {
    selectedId = selectedSystemIdInput;
  } else if (typeof selectedSystemIdInput === 'string' && selectedSystemIdInput.trim() !== '') {
    const parsed = parseInt(selectedSystemIdInput, 10);
    if (!isNaN(parsed)) {
      selectedId = parsed;
    }
  }

  const allEvents = getAllModelEvents();
  const allFaults = getAllModelFaults();

  if (selectedId === null || selectedId === 0) {
    return { events: allEvents, faults: allFaults };
  }

  const matchesSelectedId = (item: { sensorId?: number; systemId?: number; nodeIndexPath?: string }): boolean => {
    if (item.sensorId === selectedId) return true;
    if (item.systemId === selectedId) return true;
    if (item.nodeIndexPath) {
      const parts = item.nodeIndexPath.split('/').map(p => parseInt(p, 10)).filter(n => !isNaN(n));
      if (parts.includes(selectedId!)) return true;
    }
    return false;
  };

  const filteredEvents = allEvents.filter(matchesSelectedId);
  const filteredFaults = allFaults.filter(matchesSelectedId);

  return { events: filteredEvents, faults: filteredFaults };
}
