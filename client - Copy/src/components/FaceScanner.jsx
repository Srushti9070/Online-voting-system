import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, RefreshCw, Scan } from 'lucide-react';
import { getFaceDescriptor, loadFaceApiModels } from '../utils/faceApiLoader';

const FaceScanner = ({ onScanComplete, label = 'Scan Biometric Face Profile' }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize webcam stream
  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        setLoading(true);
        await loadFaceApiModels();
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setLoading(false);
      } catch (err) {
        console.warn('Webcam permission denied or unavailable:', err.message);
        setError('Webcam access required for facial biometric verification.');
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Perform face descriptor extraction
  const captureAndScan = async () => {
    try {
      setScanning(true);
      setError(null);

      let descriptor = null;

      if (videoRef.current && stream) {
        descriptor = await getFaceDescriptor(videoRef.current);
      }

      if (!descriptor) {
        setScanning(false);
        setError('No face detected in camera view. Ensure your face is centered and well-lit.');
        return;
      }

      setScanning(false);
      setSuccess(true);

      if (onScanComplete) {
        onScanComplete(descriptor);
      }
    } catch (err) {
      setScanning(false);
      setError(err.message || 'Face detection error. Ensure face is centered.');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-brand-border text-center space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-neon flex items-center gap-2">
          <Scan className="w-4 h-4 text-brand-accent animate-pulse" /> {label}
        </h3>
        {success && (
          <span className="flex items-center gap-1 text-xs font-semibold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Biometrics Extracted
          </span>
        )}
      </div>

      {/* Video Viewport Container */}
      <div className="relative w-full h-64 bg-slate-950 rounded-xl overflow-hidden border border-brand-border/60 flex items-center justify-center">
        
        {loading && (
          <div className="text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-brand-neon animate-spin mx-auto" />
            <p className="text-xs text-gray-400 font-mono">Initializing Neural Face AI Models...</p>
          </div>
        )}

        {!loading && stream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        )}

        {!loading && !stream && (
          <div className="text-center space-y-2 px-4">
            <Camera className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-400">Camera offline. Please allow camera permissions in browser.</p>
          </div>
        )}

        {/* HUD Facial Scanning Overlay Box */}
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-brand-neon/40 m-8 rounded-2xl flex items-center justify-center">
          {scanning && (
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-brand-neon to-transparent animate-scan absolute shadow-neon-cyan"></div>
          )}
          <div className="w-4 h-4 border-t-2 border-l-2 border-brand-neon absolute top-2 left-2"></div>
          <div className="w-4 h-4 border-t-2 border-r-2 border-brand-neon absolute top-2 right-2"></div>
          <div className="w-4 h-4 border-b-2 border-l-2 border-brand-neon absolute bottom-2 left-2"></div>
          <div className="w-4 h-4 border-b-2 border-r-2 border-brand-neon absolute bottom-2 right-2"></div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={captureAndScan}
        disabled={loading || scanning}
        className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
          success
            ? 'bg-brand-emerald text-slate-950 hover:bg-emerald-400 shadow-brand-emerald/20'
            : 'bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 hover:from-cyan-400 hover:to-blue-400 shadow-brand-neon/30'
        }`}
      >
        {scanning ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Extracting 128-Float Vector...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Re-Scan Face Landmarks
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            Scan Face & Generate Biometrics
          </>
        )}
      </button>
    </div>
  );
};

export default FaceScanner;
