import { GenerateMapsSelectionCollection } from '../src/maps-selection-generator';

const result = GenerateMapsSelectionCollection();
console.log('GenerateMapsSelectionCollection Output:');
console.log(JSON.stringify(result, null, 2));

if (result.SERVICEABILITY_MAP_TYPE && result.SERVICEABILITY_MAP_TYPE.mapsSelectionsNames) {
  console.log('\nSuccess! SERVICEABILITY_MAP_TYPE mapsSelectionsNames:', result.SERVICEABILITY_MAP_TYPE.mapsSelectionsNames);
} else {
  console.error('\nFailure: Invalid MapsSelectionCollection output!');
  process.exit(1);
}
