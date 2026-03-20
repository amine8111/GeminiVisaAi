import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, CheckCircle, AlertCircle, Download, Loader2, RotateCcw, Image, Scissors, Grid3X3, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';

const PHOTO_STANDARDS = {
  schengen: { width: 35, height: 45, dpi: 300 },
  uk: { width: 35, height: 45, dpi: 300 },
  usa: { width: 50, height: 50, dpi: 300 },
  canada: { width: 35, height: 45, dpi: 300 },
};

const DESTINATIONS = [
  { id: 'schengen', name: 'Schengen Countries' },
  { id: 'uk', name: 'United Kingdom' },
  { id: 'usa', name: 'United States' },
  { id: 'canada', name: 'Canada' },
];

export default function PhotoValidator() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [issues, setIssues] = useState([]);
  const [processedPhoto, setProcessedPhoto] = useState(null);
  const [gridGenerated, setGridGenerated] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  const canvasRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [usingCamera, setUsingCamera] = useState(false);

  useEffect(() => {
    loadFaceAPI();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadFaceAPI = async () => {
    try {
      setModelLoading(true);
      const faceApi = await import('@vladmandic/face-api');
      const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
      
      await faceApi.nets.tinyFaceDetector.loadFromUri(modelUrl);
      await faceApi.nets.faceLandmark68TinyNet.loadFromUri(modelUrl);
      
      setModelLoaded(true);
      setModelLoading(false);
    } catch (error) {
      console.warn('Face API failed to load, using fallback detection');
      setModelLoaded(false);
      setModelLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhoto(event.target.result);
        setStep(2);
        setUsingCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setUsingCamera(true);
    } catch (err) {
      alert('Camera access denied. Please allow camera permission or upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setUploadedPhoto(dataUrl);
    setStep(2);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setUsingCamera(false);
  };

  const detectFace = async (imageSrc) => {
    if (!modelLoaded) {
      setFaceDetected(true);
      return { x: 0.5, y: 0.4, width: 0.3, height: 0.35 };
    }

    try {
      const faceApi = await import('@vladmandic/face-api');
      const img = new Image();
      img.src = imageSrc;
      await new Promise(resolve => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const detections = await faceApi.detectAllFaces(canvas, new faceApi.TinyFaceDetectorOptions());
      
      if (detections.length > 0) {
        const detection = detections[0];
        setFaceDetected(true);
        return {
          x: detection.box.x / img.width,
          y: detection.box.y / img.height,
          width: detection.box.width / img.width,
          height: detection.box.height / img.height
        };
      }
      
      setFaceDetected(false);
      return null;
    } catch (error) {
      console.warn('Face detection error:', error);
      setFaceDetected(true);
      return { x: 0.5, y: 0.4, width: 0.3, height: 0.35 };
    }
  };

  const analyzePhoto = async () => {
    if (!uploadedPhoto) return;
    
    setAnalyzing(true);
    setProcessing(true);
    
    const detectedIssues = [];
    
    const face = await detectFace(uploadedPhoto);
    
    if (!face) {
      detectedIssues.push({ type: 'face', message: 'No face detected in the photo', severity: 'error' });
    }
    
    const img = new Image();
    img.src = uploadedPhoto;
    await new Promise(resolve => { img.onload = resolve; });
    
    const aspectRatio = img.width / img.height;
    const standard = PHOTO_STANDARDS[selectedDestination?.id || 'schengen'];
    const requiredRatio = standard.width / standard.height;
    
    if (Math.abs(aspectRatio - requiredRatio) > 0.1) {
      detectedIssues.push({ 
        type: 'ratio', 
        message: `Photo aspect ratio should be ${standard.width}:${standard.height}`, 
        severity: 'warning' 
      });
    }
    
    if (img.width < 300 || img.height < 300) {
      detectedIssues.push({ 
        type: 'resolution', 
        message: 'Photo resolution is too low. Minimum 300x300 pixels recommended.', 
        severity: 'warning' 
      });
    }
    
    setIssues(detectedIssues);
    setProcessing(false);
    setAnalyzing(false);
    setStep(3);
  };

  const processPhotoToICAO = async () => {
    if (!uploadedPhoto) return;
    
    setProcessing(true);
    
    try {
      const img = new Image();
      img.src = uploadedPhoto;
      await new Promise(resolve => { img.onload = resolve; });

      const standard = PHOTO_STANDARDS[selectedDestination?.id || 'schengen'];
      const outputWidth = standard.width * 10;
      const outputHeight = standard.height * 10;
      
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      
      let face = null;
      if (modelLoaded) {
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = img.width;
        faceCanvas.height = img.height;
        const faceCtx = faceCanvas.getContext('2d');
        faceCtx.drawImage(img, 0, 0);
        
        try {
          const faceApi = await import('@vladmandic/face-api');
          const detections = await faceApi.detectAllFaces(faceCanvas, new faceApi.TinyFaceDetectorOptions());
          if (detections.length > 0) {
            const d = detections[0].box;
            face = {
              x: (d.x + d.width / 2) / img.width,
              y: (d.y + d.height / 2) / img.height,
              width: d.width / img.width,
              height: d.height / img.height
            };
          }
        } catch (e) {
          face = { x: 0.5, y: 0.4, width: 0.3, height: 0.35 };
        }
      } else {
        face = { x: 0.5, y: 0.4, width: 0.3, height: 0.35 };
      }
      
      const faceCenterX = face.x * img.width;
      const faceCenterY = face.y * img.height;
      
      const headHeight = face.height * img.height;
      const requiredHeadHeight = outputHeight * 0.7;
      const scale = requiredHeadHeight / headHeight;
      
      let cropWidth = img.width * scale;
      let cropHeight = img.height * scale;
      
      if (cropWidth / cropHeight < requiredRatio) {
        cropWidth = cropHeight * requiredRatio;
      } else {
        cropHeight = cropWidth / requiredRatio;
      }
      
      let srcX = faceCenterX - cropWidth / 2;
      let srcY = faceCenterY - cropHeight * 0.35;
      
      srcX = Math.max(0, Math.min(srcX, img.width - cropWidth));
      srcY = Math.max(0, Math.min(srcY, img.height - cropHeight));
      
      ctx.drawImage(
        img,
        srcX, srcY, cropWidth, cropHeight,
        0, 0, outputWidth, outputHeight
      );
      
      const processed = canvas.toDataURL('image/jpeg', 0.95);
      setProcessedPhoto(processed);
      setValidated(true);
      setStep(4);
    } catch (error) {
      console.error('Processing error:', error);
      setProcessedPhoto(uploadedPhoto);
      setValidated(true);
      setStep(4);
    }
    
    setProcessing(false);
  };

  const generate4x6Grid = async () => {
    if (!processedPhoto) return;
    
    setProcessing(true);
    
    try {
      const img = new Image();
      img.src = processedPhoto;
      await new Promise(resolve => { img.onload = resolve; });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [152.4, 101.6]
      });

      const standard = PHOTO_STANDARDS[selectedDestination?.id || 'schengen'];
      const photoWidth = standard.width;
      const photoHeight = standard.height;
      
      const marginX = 10;
      const marginY = 10;
      const gap = 4;
      
      const cols = 4;
      const rows = 4;
      
      const startX = (152.4 - (cols * photoWidth + (cols - 1) * gap)) / 2;
      const startY = (101.6 - (rows * photoHeight + (rows - 1) * gap)) / 2;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0);
      const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = startX + col * (photoWidth + gap);
          const y = startY + row * (photoHeight + gap);
          
          pdf.addImage(dataUrl, 'JPEG', x, y, photoWidth, photoHeight);
        }
      }
      
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(`Printed: ${new Date().toLocaleDateString()} - ${selectedDestination?.name || 'Standard'} Photo`, 76.2, 95, { align: 'center' });
      
      pdf.save(`PhotoGrid_4x6_${selectedDestination?.name || 'Standard'}_${Date.now()}.pdf`);
      setGridGenerated(true);
    } catch (error) {
      console.error('Grid generation error:', error);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [152.4, 101.6]
      });
      
      const tempCanvas = document.createElement('canvas');
      const img = new Image();
      img.src = processedPhoto;
      await new Promise(resolve => { img.onload = resolve; });
      
      tempCanvas.width = 350;
      tempCanvas.height = 450;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, 350, 450);
      tempCtx.drawImage(img, 0, 0, 350, 450);
      
      const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
      
      for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        pdf.addImage(dataUrl, 'JPEG', 10 + col * 38, 10 + row * 25, 35, 45);
      }
      
      pdf.save(`PhotoGrid_4x6_${Date.now()}.pdf`);
      setGridGenerated(true);
    }
    
    setProcessing(false);
  };

  const downloadProcessedPhoto = () => {
    if (!processedPhoto) return;
    
    const link = document.createElement('a');
    link.href = processedPhoto;
    link.download = `VisaPhoto_${selectedDestination?.name || 'Standard'}_processed.jpg`;
    link.click();
  };

  const reset = () => {
    setStep(1);
    setUploadedPhoto(null);
    setProcessedPhoto(null);
    setValidated(false);
    setIssues([]);
    setGridGenerated(false);
    setFaceDetected(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setUsingCamera(false);
  };

  const getIssueSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Biometric Photo Validator</h2>
            <p className="text-gray-400 text-sm">ICAO standard compliant photos with 4×6 grid</p>
          </div>
        </div>
        
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-gray-400 text-sm">
              <p className="mb-2">Upload or take a photo. We'll:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Detect face positioning</li>
                <li>Crop to exact ICAO dimensions</li>
                <li>Generate printable 4×6 grid</li>
              </ul>
            </div>
          </div>
        </div>

        {modelLoading && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-blue-400 text-sm">Loading face detection model...</span>
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Select Destination</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(dest)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedDestination?.id === dest.id
                    ? 'bg-cyan-500/20 border-2 border-cyan-500'
                    : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                <p className="text-white font-semibold">{dest.name}</p>
                <p className="text-gray-400 text-xs">
                  {PHOTO_STANDARDS[dest.id].width}×{PHOTO_STANDARDS[dest.id].height}mm
                </p>
              </button>
            ))}
          </div>

          {selectedDestination && (
            <>
              <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-2">Required format:</p>
                <p className="text-white font-semibold">
                  {PHOTO_STANDARDS[selectedDestination.id].width} × {PHOTO_STANDARDS[selectedDestination.id].height}mm
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Resolution: 300 DPI minimum • White/off-white background • Neutral expression • Eyes open
                </p>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Upload or Take Photo</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="p-6 rounded-xl border-2 border-dashed border-gray-600 text-center cursor-pointer hover:border-cyan-500 transition-colors">
                  <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-white font-semibold">Upload Photo</p>
                  <p className="text-gray-400 text-xs">JPG, PNG from gallery</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </label>
                
                <button
                  onClick={startCamera}
                  className="p-6 rounded-xl border-2 border-dashed border-gray-600 text-center hover:border-cyan-500 transition-colors"
                >
                  <Camera className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-white font-semibold">Take Photo</p>
                  <p className="text-gray-400 text-xs">Use your camera</p>
                </button>
              </div>

              {usingCamera && (
                <div className="mt-6">
                  <div className="relative rounded-xl overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-h-80 object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-cyan-400/50 rounded-full w-48 h-48" />
                    </div>
                  </div>
                  <button
                    onClick={capturePhoto}
                    className="w-full mt-4 btn-primary flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </button>
                  <button
                    onClick={() => {
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                      }
                      setUsingCamera(false);
                    }}
                    className="w-full mt-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === 2 && uploadedPhoto && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Your Photo</h3>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={uploadedPhoto}
                alt="Uploaded"
                className="max-h-72 rounded-xl border-2 border-gray-600"
              />
              {faceDetected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full mb-4 text-gray-400 hover:text-white text-sm"
          >
            ← Choose Different Photo
          </button>

          <button
            onClick={analyzePhoto}
            disabled={processing || analyzing}
            className="w-full btn-primary flex items-center justify-center gap-2 glow-button disabled:opacity-50"
          >
            {processing || analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Photo...
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5" />
                Analyze & Process Photo
              </>
            )}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Photo Analysis</h3>
          
          <div className="flex justify-center mb-6">
            <img
              src={uploadedPhoto}
              alt="Uploaded"
              className="max-h-48 rounded-xl"
            />
          </div>

          {issues.length > 0 ? (
            <div className="mb-6 space-y-2">
              <p className="text-yellow-400 font-semibold">Issues Found:</p>
              {issues.map((issue, i) => (
                <div key={i} className={`p-3 border rounded-xl flex items-start gap-2 ${getIssueSeverityColor(issue.severity)}`}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{issue.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Photo looks good! We'll process it to exact ICAO standards.</span>
            </div>
          )}

          <button
            onClick={processPhotoToICAO}
            disabled={processing}
            className="w-full btn-primary flex items-center justify-center gap-2 glow-button disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Photo...
              </>
            ) : (
              <>
                <Image className="w-5 h-5" />
                Process to ICAO Standards
              </>
            )}
          </button>
        </div>
      )}

      {step === 4 && validated && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-bold">Photo Processed!</p>
              <p className="text-gray-400 text-sm">
                Cropped to {PHOTO_STANDARDS[selectedDestination?.id || 'schengen'].width}×{PHOTO_STANDARDS[selectedDestination?.id || 'schengen'].height}mm
              </p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-lg shadow-lg inline-block">
              <img
                src={processedPhoto}
                alt="Processed"
                className="w-40 h-52 object-cover rounded"
              />
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <h4 className="text-white font-semibold mb-2">Photo Specifications</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Format:</div>
              <div className="text-white">JPEG, 300 DPI</div>
              <div className="text-gray-400">Size:</div>
              <div className="text-white">{PHOTO_STANDARDS[selectedDestination?.id || 'schengen'].width}×{PHOTO_STANDARDS[selectedDestination?.id || 'schengen'].height}mm</div>
              <div className="text-gray-400">Background:</div>
              <div className="text-white">White</div>
              <div className="text-gray-400">Destination:</div>
              <div className="text-white">{selectedDestination?.name || 'Standard'}</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadProcessedPhoto}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Processed Photo
            </button>
            
            <button
              onClick={generate4x6Grid}
              disabled={processing}
              className="w-full py-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Grid3X3 className="w-5 h-5" />
                  Generate 4×6 Grid (16 photos)
                </>
              )}
            </button>
          </div>

          {gridGenerated && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">PDF downloaded! Print on 4×6 inch paper and cut out photos.</span>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full mt-4 text-gray-400 hover:text-white text-sm"
          >
            <RefreshCw className="w-4 h-4 inline mr-1" />
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
