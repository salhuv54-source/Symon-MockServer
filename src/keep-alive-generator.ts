import * as fs from 'fs';
import * as path from 'path';
import appStore from './app-store';
import { getAssetPath } from './path-utils';

/**
 * Loads the systeminfo.json template, modifies it with the current timestamp and server name,
 * and returns the payload to be sent as keepAlive message.
 */
export function GenerateKeepAlivePayload(): any {
  try {
    const systemInfoPath = getAssetPath('mock-data-jsons', 'agent_messages', 'systeminfo.json');
    if (fs.existsSync(systemInfoPath)) {
      const rawContent = fs.readFileSync(systemInfoPath, 'utf-8');
      const payload = JSON.parse(rawContent);

      const now = new Date();
      const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const sec_01011970_till_midnight_s32 = Math.floor(midnight.getTime() / 1000);
      const time_of_day_in_millisec_s32 = Date.now() - midnight.getTime();

      const activeModel = appStore.getActiveModel();
      const serverName = activeModel?.system?.name || 'MockServer';

      // Set msg_hdr.date_time to UTC MS now (Date.now())
      if (payload.properties && payload.properties.msg_hdr) {
        payload.properties.msg_hdr.date_time = Date.now();
      }

      // Update system_info array
      if (payload.properties && payload.properties.systems_info && Array.isArray(payload.properties.systems_info.system_info)) {
        payload.properties.systems_info.system_info.forEach((item: any) => {
          item.value_description_u8 = serverName;
          item.text_u8 = serverName;
          item.update_time = {
            sec_01011970_till_midnight_s32: sec_01011970_till_midnight_s32,
            time_of_day_in_millisec_s32: time_of_day_in_millisec_s32
          };
        });
      }

      return payload;
    }
  } catch (err) {
    console.error('[KeepAliveGenerator] Error preparing keepAlive message from systeminfo.json template:', (err as Error).message);
  }
  return { message: 'Sending here keepAlive!' }; // Fallback
}
