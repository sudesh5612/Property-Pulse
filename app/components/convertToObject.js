export default function convertToSerializeableObject(leanDocument) {
  // Handle null/undefined input
  if (!leanDocument) {
    return leanDocument;
  }

  for (const key of Object.keys(leanDocument)) {
    // Check if the value exists and is an object before accessing its methods
    if (leanDocument[key] && 
        typeof leanDocument[key] === 'object' && 
        leanDocument[key].toJSON && 
        leanDocument[key].toString) {
      leanDocument[key] = leanDocument[key].toString();
    }
  }
  return leanDocument;
}