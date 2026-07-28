import uploadService from '../src/upload-service';
import appStore from '../src/app-store';
import treeService from '../src/tree.service';
import { getEventsAndFaultsForSystem } from '../src/system-log.service';

async function run() {
  const models = uploadService.listAvailableModels();
  if (models.length > 0) {
    const storedName = await uploadService.uploadModel(models[0]);
    const modelData = appStore.getModel(storedName);
    console.log(`Loaded active model: ${modelData?.system.name}`);
  }

  const tree = treeService.buildTree();
  console.log('Tree nodes count:', tree.length);
  const parentWithChildren = tree.find(s => s.childrenIds && s.childrenIds.length > 0);

  if (parentWithChildren) {
    console.log(`Testing getEventsAndFaultsForSystem for parent node ID ${parentWithChildren.id} (${parentWithChildren.name}), children: [${parentWithChildren.childrenIds.join(', ')}]...`);
    const res = getEventsAndFaultsForSystem(parentWithChildren.id);
    console.log(`Node ${parentWithChildren.id} results: ${res.events.length} events, ${res.faults.length} faults`);
  } else {
    console.log('No parent with children found in tree');
  }

  console.log('Test completed successfully!');
}

run();
