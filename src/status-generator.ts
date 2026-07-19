import { 
  SensorStatus, 
  E_SERVICEABILITY, 
  E_SERVICEABILITY_Timeout, 
  BitReportDocTypes, 
  BitOperationType 
} from './types';

/**
 * Generates an array of randomized SensorStatus objects.
 * We generate statuses for a list of node IDs or a range from 1 to maxNodeId.
 */
export function GenerateSensorsStatus(nodeIdsOrMax: number | number[] = 25): SensorStatus[] {
  const statuses: SensorStatus[] = [];
  const nodeIds: number[] = [];

  if (Array.isArray(nodeIdsOrMax)) {
    nodeIds.push(...nodeIdsOrMax);
  } else {
    for (let id = 1; id <= nodeIdsOrMax; id++) {
      nodeIds.push(id);
    }
  }

  const serviceabilities = [
    E_SERVICEABILITY.E_SERVICEABILITY_OK,
    E_SERVICEABILITY.E_SERVICEABILITY_DEGRADED,
    E_SERVICEABILITY.E_SERVICEABILITY_FAIL,
    E_SERVICEABILITY.E_SERVICEABILITY_UNKNOWN,
    E_SERVICEABILITY.E_SERVICEABILITY_INVALID,
    E_SERVICEABILITY.E_SERVICEABILITY_NOT_APPLICABLE,
    E_SERVICEABILITY.E_SERVICEABILITY_NOT_CONFIG,
    E_SERVICEABILITY.E_SERVICEABILITY_PSS_XOR_FSS,
    E_SERVICEABILITY_Timeout.E_SERVICEABILITY_TIMEOUT
  ];

  // Helper to pick random item with realistic probability (skewed towards OK)
  const pickRealisticServiceability = () => {
    const rand = Math.random();
    if (rand < 0.75) {
      return E_SERVICEABILITY.E_SERVICEABILITY_OK; // 75% chance of OK
    } else if (rand < 0.85) {
      return E_SERVICEABILITY.E_SERVICEABILITY_DEGRADED; // 10% chance of degraded
    } else if (rand < 0.92) {
      return E_SERVICEABILITY.E_SERVICEABILITY_FAIL; // 7% chance of fail
    } else {
      const index = Math.floor(Math.random() * serviceabilities.length);
      return serviceabilities[index];
    }
  };

  for (const id of nodeIds) {
    statuses.push({
      node_id: id,
      uniqueId: `uuid-${id}-${Math.floor(100000 + Math.random() * 900000)}`,
      pss_e: pickRealisticServiceability(),
      fss_e: pickRealisticServiceability(),
      last_state_change_time: Date.now() - Math.floor(Math.random() * 3600000 * 24), // up to 24 hours ago
      docType: BitReportDocTypes.SERVICEABILITY_DOC_TYPE,
      bitOperationType: Math.random() < 0.5 ? BitOperationType.BIT : BitOperationType.CALIBRATION,
      reportId: `rep-${Math.floor(1000 + Math.random() * 9000)}`,
      isDeleted: false
    });
  }

  return statuses;
}
