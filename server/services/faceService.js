/**
 * Computes the Euclidean Distance between two 128-element biometric face descriptor vectors.
 * Lower distance indicates higher facial match similarity.
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

/**
 * Searches the database of all registered users to check if a face vector already belongs to ANY voter.
 * Prevents 1 person from registering multiple Voter IDs with the same face.
 * 
 * @param {Array<number>} targetDescriptor Face vector to search
 * @param {Array<object>} allUsers List of users with faceDescriptor fields
 * @param {number} threshold Match distance cutoff (0.45)
 */
const findMatchingUserByFace = (targetDescriptor, allUsers = [], threshold = 0.45) => {
  for (const user of allUsers) {
    if (user.faceDescriptor && Array.isArray(user.faceDescriptor) && user.faceDescriptor.length === targetDescriptor.length) {
      const dist = computeEuclideanDistance(user.faceDescriptor, targetDescriptor);
      if (dist < threshold) {
        return { matched: true, user, distance: dist };
      }
    }
  }
  return { matched: false };
};

module.exports = {
  computeEuclideanDistance,
  verifyFaceMatch,
  findMatchingUserByFace,
};
