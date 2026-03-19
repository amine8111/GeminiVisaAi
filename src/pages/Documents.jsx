import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, ChevronRight, Camera, X, FileText, Download, Loader2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';

const DOCUMENT_TYPES = [
  { id: 'passport', label: 'Passport', icon: '🛂', color: 'blue' },
  { id: 'travel_insurance', label: 'Travel Insurance', icon: '🏥', color: 'green' },
  { id: 'employment', label: 'Employment Proof', icon: '💼', color: 'purple' },
  { id: 'bank_statement', label: 'Bank Statement', icon: '🏦', color: 'yellow' },
  { id: 'flight_ticket', label: 'Flight Ticket', icon: '✈️', color: 'red' },
  { id: 'hotel_booking', label: 'Hotel Booking', icon: '🏨', color: 'cyan' },
  { id: 'photo', label: 'Passport Photo', icon: '📸', color: 'pink' },
  { id: 'other', label: 'Other Document', icon: '📄', color: 'gray' },
];

export default function Documents() {
  const navigate = useNavigate();
  const { updateDocument } = useApp();
  const [documents, setDocuments] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [scannedImages, setScannedImages] = useState([]);
  const [currentDocType, setCurrentDocType] = useState('passport');
  const [cameraActive, setCameraActive] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setShowScanner(true);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setScannedImages(prev => [...prev, { id: Date.now(), data: imageData, type: currentDocType }]);
  };

  const removeImage = (id) => {
    setScannedImages(prev => prev.filter(img => img.id !== id));
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setShowScanner(false);
    setCameraActive(false);
  };

  const addFromGallery = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScannedImages(prev => [...prev, { 
          id: Date.now() + Math.random(), 
          data: event.target.result, 
          type: currentDocType 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const markAsUploaded = (docId) => {
    setDocuments(prev => ({ ...prev, [docId]: true }));
    updateDocument(docId);
  };

  const generatePDF = async () => {
    if (scannedImages.length === 0) return;
    
    setGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      pdf.setFontSize(20);
      pdf.setTextColor(99, 102, 241);
      pdf.text('VisaAI - Scanned Documents', pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      pdf.line(margin, 35, pageWidth - margin, 35);
      
      let yPosition = 45;
      const imgWidth = pageWidth - (margin * 2);
      const imgMaxHeight = pageHeight - 40;
      
      const groupedByType = {};
      scannedImages.forEach(img => {
        if (!groupedByType[img.type]) groupedByType[img.type] = [];
        groupedByType[img.type].push(img);
      });
      
      for (const [docType, images] of Object.entries(groupedByType)) {
        const docInfo = DOCUMENT_TYPES.find(d => d.id === docType);
        const docLabel = docInfo ? docInfo.label : docType;
        
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(50);
        pdf.text(`${docLabel} (${images.length} page${images.length > 1 ? 's' : ''})`, margin, yPosition);
        yPosition += 8;
        
        for (const img of images) {
          const imgData = img.data;
          const imgProps = pdf.getImageProperties(imgData);
          let imgH = (imgProps.height * imgWidth) / imgProps.width;
          
          if (imgH > imgMaxHeight) {
            imgH = imgMaxHeight;
          }
          
          if (yPosition + imgH > pageHeight - margin) {
            pdf.addPage();
            yPosition = 20;
          }
          
          try {
            pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgH);
            yPosition += imgH + 10;
          } catch (e) {
            console.error('Error adding image:', e);
          }
        }
        
        yPosition += 10;
      }
      
      pdf.save(`VisaAI_Scanned_Documents_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error generating PDF');
    }
    
    setGeneratingPDF(false);
  };

  const getScore = () => {
    return Object.keys(documents).length * 5;
  };

  return (
    <div className="min-h-screen ai-bg grid-pattern pt-24 pb-12 px-4">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Document Scanner</h1>
          <p className="text-gray-400">Scan your documents to create a PDF</p>
        </div>

        <div className="glass-card rounded-3xl p-6 mb-6 glow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Documents Scanned</h3>
              <p className="text-gray-500 text-sm">{scannedImages.length} page(s)</p>
            </div>
            <span className="text-4xl font-bold gradient-text">{getScore()}/40</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full gradient-bg" style={{ width: `${Math.min(100, (scannedImages.length / 8) * 100)}%` }} />
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Select Document Type</label>
          <div className="grid grid-cols-4 gap-2">
            {DOCUMENT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setCurrentDocType(type.id)}
                className={`p-2 rounded-lg text-center transition-all ${
                  currentDocType === type.id 
                    ? 'gradient-bg text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <div className="text-xl mb-1">{type.icon}</div>
                <div className="text-xs truncate">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-6 border-cyan-500/30">
          {!showScanner ? (
            <div className="space-y-3">
              <button onClick={startCamera}
                className="w-full py-4 rounded-xl gradient-bg text-white flex items-center justify-center gap-2 glow-button">
                <Camera className="w-5 h-5" />
                Open Camera
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-gray-900 text-gray-500 text-sm">or</span>
                </div>
              </div>
              
              <label className="block w-full py-4 rounded-xl bg-gray-800 text-gray-400 text-center cursor-pointer hover:bg-gray-700">
                <input type="file" accept="image/*" multiple className="hidden" onChange={addFromGallery} />
                <Upload className="w-5 h-5 inline mr-2" />
                Upload from Gallery
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-72 object-contain" />
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-400" />
                </button>
                <button onClick={stopCamera}
                  className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>

        {scannedImages.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Scanned Pages ({scannedImages.length})</h3>
              <button onClick={() => setScannedImages([])} className="text-red-400 text-sm hover:underline">
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {scannedImages.map((img) => {
                const docInfo = DOCUMENT_TYPES.find(d => d.id === img.type);
                return (
                  <div key={img.id} className="relative group">
                    <img src={img.data} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg truncate">
                      {docInfo?.icon} {docInfo?.label}
                    </div>
                    <button onClick={() => removeImage(img.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {scannedImages.length > 0 && (
          <button onClick={generatePDF} disabled={generatingPDF}
            className="w-full py-4 rounded-xl gradient-bg text-white flex items-center justify-center gap-2 glow-button mb-6">
            {generatingPDF ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download All as PDF
              </>
            )}
          </button>
        )}

        <div className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Required Documents Checklist
          </h3>
          <div className="space-y-2">
            {DOCUMENT_TYPES.slice(0, 6).map(type => {
              const count = scannedImages.filter(img => img.type === type.id).length;
              return (
                <div key={type.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span className="text-gray-300">{type.label}</span>
                  </div>
                  <span className={`text-sm ${count > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                    {count > 0 ? `${count} scanned` : 'Not scanned'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <button onClick={() => navigate('/profile')} 
            className="px-6 py-3 rounded-xl border border-white/20 text-gray-400">
            Back
          </button>
          <button onClick={() => navigate('/processing')} 
            className="btn-primary flex items-center gap-2">
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
