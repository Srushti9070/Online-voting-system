/**
 * Computes the Euclidean Distance between two 128-element biometric face descriptor vectors.
 * Lower distance indicates higher facial match similarity.
 * 
 * @param {Array<number>} desc1 Saved face descriptor from database
 * @param {Array<number>} desc2 Live scanned face descriptor from webcam
 * @returns {number} Euclidean distance float
 */
const computeEuclideanDistance = (desc1, desc2) => {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) {
    throw new Error('Invalid face descriptor dimension arrays');
  }

  let sumSquare = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sumSquare += diff * diff;
  }

  return Math.sqrt(sumSquare);
};

/**
 * Strict Biometric Face Verification Engine
 * Compares live facial scan descriptor against registered database descriptor.
 * Cutoff threshold: 0.45 for high security matching.
 * 
 * @param {Array<number>} registeredDescriptor Stored database descriptor
 * @param {Array<number>} liveDescriptor Live webcam descriptor
 * @param {number} threshold Strict distance cutoff (default: 0.45)
 */
const verifyFaceMatch = (registeredDescriptor, liveDescriptor, threshold = 0.45) => {
  const distance = computeEuclideanDistance(registeredDescriptor, liveDescriptor);
  const isMatch = distance < threshold;
  const confidenceScore = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));

  return {
    isMatch,
    distance,
    confidenceScore,
    message: isMatch
      ? 'Biometric Face Verification Passed'
      : `Biometric Face Mismatch! Scanned face distance (${distance.toFixed(3)}) exceeds security threshold (${threshold}). Access Denied.`
  };
};

module.exports = {
  computeEuclideanDistance,
  verifyFaceMatch
};
