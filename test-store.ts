import appStore from './src/app-store';
import uploadService from './src/upload-service';

async function main() {
  await uploadService.uploadModel('System1_Export');
  const model = appStore.getModel('System1');
  
  console.log('=== Model loaded in store ===');
  console.log('System name:', model!.system.name);
  console.log('System id:', model!.system.id);
  console.log('Top-level node type names:', model!.nodeTypes.map((n: any) => n.name + ' (NTI=' + n.nti + ', children=' + (n.children?.length || 0) + ')').join(', '));
  console.log('Events:', model!.events.length);
  console.log('Faults:', model!.faults.length);
  console.log('Propagation rules:', model!.propagationRules.length);
  console.log('Distribution rules:', model!.distributionRules.length);
  console.log('Supplier instances:', model!.supplierInstances.length);
  
  console.log('\n=== Hierarchy ===');
  function printTree(nodes: any[], indent = '') {
    for (const n of nodes) {
      console.log(indent + n.name + ' (NTI=' + n.nti + ', TTI=' + n.tti + ')');
      if (n.children?.length) printTree(n.children, indent + '  ');
    }
  }
  printTree(model!.nodeTypes);
  
  console.log('\n=== Instance Tree ===');
  function printInstances(instances: any[], indent = '') {
    for (const inst of instances) {
      console.log(indent + inst.name + ' (HMI=' + inst.hmi + ', NTI=' + inst.nti + ')');
      if (inst.children?.length) printInstances(inst.children, indent + '  ');
    }
  }
  printInstances(model!.instances);
  
  console.log('\nStore has model "System1":', appStore.hasModel('System1'));
  console.log('All model names:', appStore.getModelNames());
}

main().catch(console.error);