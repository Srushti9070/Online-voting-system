import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;

/**
 * Loads the face-api neural network models for face detection, 68-point landmarks, and 128-float feature vector extraction.
 */
export const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;

  try {
    // Official hosted models CDN fallback URL
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

    console.log('⏳ Loading Face AI Biometric Models...');
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('✅ Face AI Biometric Models Loaded Successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to load Face API models:', error.message);
    throw new Error('Biometric AI model initialization failed. Please check network connection.');
  }
};

/**
 * Detects a face in a canvas/video element and extracts its 128-float landmark descriptor array.
 */
export const getFaceDescriptor = async (inputElement) => {
  await loadFaceApiModels();

  const detection = await faceapi
    .detectSingleFace(inputElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return null;
  }

  // Return standard JS number array (128 floats)
  return Array.from(detection.descriptor);
};
