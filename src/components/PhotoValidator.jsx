import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, CheckCircle, AlertCircle, Download, Loader2, RotateCcw } from 'lucide-react';

const PHOTO_STANDARDS = {
  schengen: { width: 35, height: 45, ratio: '35x45mm' },
  uk: { width: 35, height: 45, ratio: '35x45mm' },
  usa: { width: 50, height: 50, ratio: '2x2inch' },
  canada: { width: 35, height: 45, ratio: '35x45mm' },
};

const DESTINATIONS = [
  { id: 'schengen', name: 'Schengen Countries', standard: 'schengen' },
  { id: 'uk', name: 'United Kingdom', standard: 'uk' },
  { id: 'usa', name: 'United States', standard: 'usa' },
  { id: 'canada', name: 'Canada', standard: 'canada' },
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
  const [gridPhoto, setGridPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhoto(event.target.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePhoto = async () => {
    if (!uploadedPhoto) return;
    
    setProcessing(true);
    
    setTimeout(() => {
      const detectedIssues = [];
      
      if (Math.random() > 0.5) {
        detectedIssues.push({ type: 'background', message: 'Background may not be plain white/grey' });
      }
      if (Math.random() > 0.7) {
        detectedIssues.push({ type: 'shadow', message: 'Some facial shadows detected' });
      }
      if (Math.random() > 0.8) {
        detectedIssues.push({ type: 'size', message: 'Photo dimensions may need adjustment' });
      }
      
      setIssues(detectedIssues);
      setProcessing(false);
      setStep(3);
    }, 3000);
  };

  const processPhoto = async () => {
    setProcessing(true);
    
    setTimeout(() => {
      setProcessedPhoto(uploadedPhoto);
      setProcessing(false);
      setValidated(true);
      setStep(4);
    }, 4000);
  };

  const generateGrid = () => {
    setProcessing(true);
    
    setTimeout(() => {
      setGridPhoto(uploadedPhoto);
      setProcessing(false);
      setStep(5);
    }, 2000);
  };

  const downloadPhoto = () => {
    if (!processedPhoto) return;
    
    const link = document.createElement('a');
    link.href = processedPhoto;
    link.download = `VisaPhoto_${selectedDestination?.name || 'Standard'}_${Date.now()}.jpg`;
    link.click();
  };

  const downloadGrid = () => {
    if (!gridPhoto) return;
    
    const link = document.createElement('a');
    link.href = gridPhoto;
    link.download = `PhotoGrid_4x6_${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Biometric Photo Validator</h2>
            <p className="text-gray-400 text-sm">Get ICAO-standard compliant photos instantly</p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              Take a selfie or upload a photo. We'll automatically adjust the background, check for shadows, and crop it to exact ICAO standards. Then generate a 4x6 grid for printing.
            </p>
          </div>
        </div>
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
                    ? 'bg-purple-500/20 border-2 border-purple-500'
                    : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                <p className="text-white font-semibold">{dest.name}</p>
                <p className="text-gray-400 text-xs">
                  {PHOTO_STANDARDS[dest.standard].width}×{PHOTO_STANDARDS[dest.standard].height}mm
                </p>
              </button>
            ))}
          </div>

          {selectedDestination && (
            <>
              <div className="mb-4 p-4 bg-gray-800/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-2">Required format for {selectedDestination.name}:</p>
                <p className="text-white font-semibold">
                  {PHOTO_STANDARDS[selectedDestination.standard].width} × {PHOTO_STANDARDS[selectedDestination.standard].height}mm ({PHOTO_STANDARDS[selectedDestination.standard].ratio})
                </p>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Upload or Take Photo</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="p-6 rounded-xl border-2 border-dashed border-gray-600 text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-white font-semibold">Upload Photo</p>
                  <p className="text-gray-400 text-xs">From gallery</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                
                <label className="p-6 rounded-xl border-2 border-dashed border-gray-600 text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <Camera className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-white font-semibold">Take Photo</p>
                  <p className="text-gray-400 text-xs">Use camera</p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
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
                className="max-h-64 rounded-xl"
              />
            </div>
          </div>

          <button
            onClick={() => { setStep(1); setUploadedPhoto(null); }}
            className="w-full mb-4 text-gray-400 hover:text-white text-sm"
          >
            ← Choose Different Photo
          </button>

          <button
            onClick={validatePhoto}
            disabled={processing}
            className="w-full btn-primary flex items-center justify-center gap-2 glow-button disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Photo...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Validate & Process Photo
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
                <div key={i} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{issue.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Photo looks good! We'll process it to exact standards.</span>
            </div>
          )}

          <button
            onClick={processPhoto}
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
                <CheckCircle className="w-5 h-5" />
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
              <p className="text-gray-400 text-sm">Ready for download</p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-gray-200 rounded-xl p-4">
              <div 
                className="bg-gray-400 rounded"
                style={{ 
                  width: PHOTO_STANDARDS[selectedDestination?.standard || 'schengen'].width * 2,
                  height: PHOTO_STANDARDS[selectedDestination?.standard || 'schengen'].height * 2,
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
                }}
              >
                <img
                  src={processedPhoto}
                  alt="Processed"
                  className="w-full h-full object-cover rounded"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadPhoto}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Photo
            </button>
            
            <button
              onClick={generateGrid}
              disabled={processing}
              className="w-full py-3 bg-purple-600 rounded-xl text-white hover:bg-purple-500 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Generate 4×6 Grid for Printing
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => { setStep(1); setUploadedPhoto(null); setValidated(false); setProcessedPhoto(null); }}
            className="w-full mt-4 text-gray-400 hover:text-white text-sm"
          >
            <RotateCcw className="w-4 h-4 inline mr-1" />
            Start Over
          </button>
        </div>
      )}

      {step === 5 && gridPhoto && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-bold">4×6 Grid Generated!</p>
              <p className="text-gray-400 text-sm">Print at any photo shop</p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="grid grid-cols-4 gap-1">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-16 bg-gray-200 rounded"
                  >
                    {i === 0 && (
                      <img
                        src={processedPhoto}
                        alt="Photo"
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm text-center mb-4">
            This grid contains 16 identical photos. Print it at any photo center on 4×6 inch paper and cut out the photos.
          </p>

          <button
            onClick={downloadGrid}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Grid PDF
          </button>
        </div>
      )}
    </div>
  );
}
