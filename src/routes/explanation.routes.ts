import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../interfaces/routes.interface';
import {
  FaultExplanationToClient,
  FaultExplanationEventsCollection,
  E_EVENT_SIGN
} from '../interfaces/fault-explanation.interface';
import {
  EventExplanationToClient,
  EventExplanationFaultsCollection
} from '../interfaces/event-explanation.interface';
import { ServiceabilityExplanationClient } from '../interfaces/serviceability-explanation.interface';

function generateRandomFaultExplanation(uniqueId: string): FaultExplanationToClient {
  const parsedId = parseInt(uniqueId, 10);
  const numericId = isNaN(parsedId) ? Math.floor(Math.random() * 1000) + 1 : parsedId;

  const sampleEvents: FaultExplanationEventsCollection = {
    [`evt_${numericId}_1`]: {
      hwMapIndex: 1,
      id: 101,
      eventName: "Voltage_Spike_Detected",
      eventDescription: "Power line experienced a voltage spike above 24V threshold.",
      eventSign: E_EVENT_SIGN.E_EVENT_SIGN_FAIL,
      nodeParentsPath: "System/Power/Substation"
    },
    [`evt_${numericId}_2`]: {
      hwMapIndex: 2,
      id: 102,
      eventName: "Thermal_Sensor_Overheat",
      eventDescription: "Temperature sensor reported 85°C (warning limit 70°C).",
      eventSign: E_EVENT_SIGN.E_EVENT_SIGN_FAIL,
      nodeParentsPath: "System/Cooling/Chiller"
    },
    [`evt_${numericId}_3`]: {
      hwMapIndex: 3,
      id: 103,
      eventName: "Heartbeat_Timeout",
      eventDescription: "Heartbeat packet missed for over 5000ms.",
      eventSign: E_EVENT_SIGN.E_EVENT_SIGN_OK,
      nodeParentsPath: "System/Network/Gateway"
    }
  };

  const numOfEvents = Object.keys(sampleEvents).length;
  const numOfBlamingEvents = 2;
  const precentOfEventsToBlame = Math.round((numOfBlamingEvents / numOfEvents) * 100);

  return {
    nodeId: numericId,
    faultId: numericId,
    faultName: `Fault_Explanation_${uniqueId}`,
    numOfEvents,
    numOfBlamingEvents,
    precentOfEventsToBlame,
    events: sampleEvents
  };
}

function generateRandomEventExplanation(uniqueId: string): EventExplanationToClient {
  const parsedId = parseInt(uniqueId, 10);
  const numericId = isNaN(parsedId) ? Math.floor(Math.random() * 1000) + 1 : parsedId;

  const sampleFaults: EventExplanationFaultsCollection = {
    [`flt_${numericId}_1`]: {
      hwMapIndex: 1,
      id: 201,
      faultName: "Power_Supply_Failure",
      faultDescription: "Primary power supply unit non-responsive.",
      nodeParentsPath: "System/Power/MainPSU"
    },
    [`flt_${numericId}_2`]: {
      hwMapIndex: 2,
      id: 202,
      faultName: "Sensor_Communication_Loss",
      faultDescription: "RS-485 serial bus communication failed.",
      nodeParentsPath: "System/Sensors/BusController"
    }
  };

  const numOfFaults = Object.keys(sampleFaults).length;

  return {
    nodeId: numericId,
    eventId: numericId,
    eventName: `Event_Explanation_${uniqueId}`,
    numOfFaults,
    faults: sampleFaults
  };
}

function generateRandomServiceabilityExplanation(nodeIdStr: string): ServiceabilityExplanationClient[] {
  const parsedId = parseInt(nodeIdStr, 10);
  const numericId = isNaN(parsedId) ? Math.floor(Math.random() * 1000) + 1 : parsedId;

  return [
    {
      nodeId: numericId,
      nodeName: `Node_${nodeIdStr}_Primary`,
      pssDescription: "Primary SubSystem operating nominally.",
      fssDescription: "Functional SubSystem operational with minor warnings.",
      faultId: numericId
    },
    {
      nodeId: numericId + 1,
      nodeName: `Node_${nodeIdStr}_Secondary`,
      pssDescription: "Secondary SubSystem degraded mode active.",
      fssDescription: "Functional SubSystem reporting voltage instability.",
      faultId: numericId + 100
    }
  ];
}

export default function explanationRoutes(router: Router): void {
  // GET /api/explanation/serviceability/:nodeId
  router.get(
    `${MainRoutes.EXPLANATION}${SubRoutes.SERVICEABILITY}/:nodeId`,
    (req: Request, res: Response) => {
      const nodeId = Array.isArray(req.params.nodeId) ? req.params.nodeId[0] : req.params.nodeId;
      console.log(`[RouteService] GET ${MainRoutes.EXPLANATION}${SubRoutes.SERVICEABILITY}/${nodeId} received`);
      const response = generateRandomServiceabilityExplanation(nodeId);
      res.json(response);
    }
  );

  // GET /api/explanation/fault/:uniqueId
  router.get(
    `${MainRoutes.EXPLANATION}${SubRoutes.FAULT}/:uniqueId`,
    (req: Request, res: Response) => {
      const uniqueId = Array.isArray(req.params.uniqueId) ? req.params.uniqueId[0] : req.params.uniqueId;
      console.log(`[RouteService] GET ${MainRoutes.EXPLANATION}${SubRoutes.FAULT}/${uniqueId} received`);
      const response = generateRandomFaultExplanation(uniqueId);
      res.json(response);
    }
  );

  // GET /api/explanation/event/:uniqueId
  router.get(
    `${MainRoutes.EXPLANATION}${SubRoutes.EVENT}/:uniqueId`,
    (req: Request, res: Response) => {
      const uniqueId = Array.isArray(req.params.uniqueId) ? req.params.uniqueId[0] : req.params.uniqueId;
      console.log(`[RouteService] GET ${MainRoutes.EXPLANATION}${SubRoutes.EVENT}/${uniqueId} received`);
      const response = generateRandomEventExplanation(uniqueId);
      res.json(response);
    }
  );
}
