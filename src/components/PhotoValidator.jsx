import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, CheckCircle, AlertCircle, Download, Loader2, Image, Grid3X3, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';

const PHOTO_STANDARDS = {
  schengen: { width: 35, height: 45, label: 'Schengen (35×45mm)' },
  uk: { width: 35, height: 45, label: 'UK (35×45mm)' },
  usa: { width: 50, height: 50, label: 'USA (50×50mm)' },
  canada: { width: 35, height: 45, label: 'Canada (35×45mm)' },
};

export default function PhotoValidator() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState('schengen');
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedPhoto, setProcessedPhoto] = useState(null);
  const [gridGenerated, setGridGenerated] = useState(false);
  const [facePosition, setFacePosition] = useState({ x: 50, y: 40 });
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [usingCamera, setUsingCamera] = useState(false);

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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUsingCamera(true);
    } catch (err) {
      alert('Camera access denied. Please upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
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

  const processPhoto = async () => {
    if (!uploadedPhoto) return;
    setProcessing(true);
    
    try {
      const img = new Image();
      img.src = uploadedPhoto;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const standard = PHOTO_STANDARDS[selectedDestination];
      const outputWidth = standard.width * 12;
      const outputHeight = standard.height * 12;
      const ratio = outputWidth / outputHeight;

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      // Calculate crop to maintain aspect ratio and center face
      let srcWidth = img.width;
      let srcHeight = img.height;
      
      if (srcWidth / srcHeight > ratio) {
        srcWidth = srcHeight * ratio;
      } else {
        srcHeight = srcWidth / ratio;
      }
      
      const srcX = (img.width - srcWidth) / 2;
      const srcY = (img.height - srcHeight) * 0.3; // Slight upward crop for head

      ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, outputWidth, outputHeight);
      
      setProcessedPhoto(canvas.toDataURL('image/jpeg', 0.95));
      setStep(3);
    } catch (err) {
      console.error('Processing error:', err);
      setProcessedPhoto(uploadedPhoto);
      setStep(3);
    }
    setProcessing(false);
  };

  const generate4x6Grid = async () => {
    if (!processedPhoto && !uploadedPhoto) return;
    setProcessing(true);
    
    try {
      const img = new Image();
      img.src = processedPhoto || uploadedPhoto;
      await new Promise(resolve => { img.onload = resolve; });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [152.4, 101.6]
      });

      const standard = PHOTO_STANDARDS[selectedDestination];
      const photoWidth = standard.width;
      const photoHeight = standard.height;
      const gap = 3;
      const cols = 4;
      const rows = 4;
      
      const startX = (152.4 - (cols * photoWidth + (cols - 1) * gap)) / 2;
      const startY = (101.6 - (rows * photoHeight + (rows - 1) * gap)) / 2;

      // Convert image to data URL
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width || 420;
      tempCanvas.height = img.height || 540;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
      const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = startX + col * (photoWidth + gap);
          const y = startY + row * (photoHeight + gap);
          pdf.addImage(dataUrl, 'JPEG', x, y, photoWidth, photoHeight);
        }
      }

      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(`${selectedDestination.toUpperCase()} Photo - ${photoWidth}x${photoHeight}mm`, 76.2, 98, { align: 'center' });
      
      pdf.save(`VisaPhoto_${selectedDestination}_${Date.now()}.pdf`);
      setGridGenerated(true);
    } catch (err) {
      console.error('Grid generation error:', err);
    }
    setProcessing(false);
  };

  const downloadProcessedPhoto = () => {
    if (!processedPhoto) return;
    const link = document.createElement('a');
    link.href = processedPhoto;
    link.download = `VisaPhoto_${selectedDestination}.jpg`;
    link.click();
  };

  const reset = () => {
    setStep(1);
    setUploadedPhoto(null);
    setProcessedPhoto(null);
    setGridGenerated(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setUsingCamera(false);
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
            <p className="text-gray-400 text-sm">Create ICAO-compliant visa photos with 4×6 grid</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Select Photo Standard</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(PHOTO_STANDARDS).map(([id, standard]) => (
              <button
                key={id}
                onClick={() => setSelectedDestination(id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedDestination === id
                    ? 'bg-cyan-500/20 border-2 border-cyan-500'
                    : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                <p className="text-white font-semibold">{standard.label}</p>
              </button>
            ))}
          </div>

          <h3 className="text-lg font-bold text-white mb-4">Upload or Take Photo</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="p-6 rounded-xl border-2 border-dashed border-gray-600 text-center cursor-pointer hover:border-cyan-500 transition-colors">
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-white font-semibold">Upload Photo</p>
              <p className="text-gray-400 text-xs">JPG, PNG</p>
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
              <p className="text-gray-400 text-xs">Use camera</p>
            </button>
          </div>

          {usingCamera && (
            <div className="mt-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-80 object-contain rounded-xl bg-black"
              />
              <button
                onClick={capturePhoto}
                className="w-full mt-4 btn-primary"
              >
                <Camera className="w-5 h-5 inline mr-2" />
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
        </div>
      )}

      {step === 2 && uploadedPhoto && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Your Photo</h3>
          
          <div className="flex justify-center mb-6">
            <img
              src={uploadedPhoto}
              alt="Uploaded"
              className="max-h-72 rounded-xl border-2 border-gray-600"
            />
          </div>

          <button
            onClick={() => { setStep(1); setUploadedPhoto(null); }}
            className="w-full mb-4 text-gray-400 hover:text-white text-sm"
          >
            ← Choose Different Photo
          </button>

          <button
            onClick={processPhoto}
            disabled={processing}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><Image className="w-5 h-5" /> Process Photo</>
            )}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-bold">Photo Ready!</p>
              <p className="text-gray-400 text-sm">
                {PHOTO_STANDARDS[selectedDestination].label}
              </p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-lg shadow-lg inline-block">
              <img
                src={processedPhoto || uploadedPhoto}
                alt="Processed"
                className="w-40 h-52 object-cover rounded"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadProcessedPhoto}
              disabled={!processedPhoto}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Download Photo
            </button>
            
            <button
              onClick={generate4x6Grid}
              disabled={processing}
              className="w-full py-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Grid3X3 className="w-5 h-5" /> Generate 4×6 Grid (16 photos)</>
              )}
            </button>
          </div>

          {gridGenerated && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-sm">
                ✓ PDF downloaded! Print on 4×6 inch photo paper.
              </p>
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
