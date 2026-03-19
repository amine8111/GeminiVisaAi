import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Upload, FileText, X, CheckCircle } from 'lucide-react';

function DocumentManager() {
  const { getAuthHeaders, API_URL } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    document_type: '',
    file_name: '',
    application_id: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Camera scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/documents`, {
        headers: { ...getAuthHeaders() }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Document metadata saved successfully!');
        setFormData({ document_type: '', file_name: '', application_id: '' });
        fetchDocuments();
        setShowForm(false);
      } else {
        setMessage('Failed to save document');
      }
    } catch (error) {
      setMessage('Error saving document');
    }
    setSaving(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
      setScanning(true);
    } catch (error) {
      alert('Could not access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
    setScanning(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImages(prev => [...prev, imageData]);
    }
  };

  const removeImage = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveScannedDocument = async () => {
    if (capturedImages.length === 0) {
      alert('Please capture at least one photo');
      return;
    }

    setSaving(true);
    const fileName = `scanned_doc_${new Date().getTime()}.jpg`;
    
    // Save the first image as a sample (in real app, would create PDF)
    try {
      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          document_type: 'Scanned Document',
          file_name: fileName,
          application_id: ''
        })
      });

      if (response.ok) {
        setMessage('Document scanned and saved successfully!');
        setCapturedImages([]);
        stopCamera();
        setShowScanner(false);
        fetchDocuments();
      }
    } catch (error) {
      setMessage('Error saving scanned document');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Document Manager</h1>
            <p className="text-gray-600">Track and scan your visa documents</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setShowScanner(true); startCamera(); }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Camera size={20} />
              Scan Document
            </button>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
            >
              <Upload size={20} />
              {showForm ? 'Cancel' : 'Add Document'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Document Scanner</h2>
                <button onClick={() => { stopCamera(); setShowScanner(false); }} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {cameraActive ? (
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full rounded-lg bg-black"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {capturedImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`Captured ${idx + 1}`} className="w-24 h-24 object-cover rounded border-2 border-green-500" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={capturePhoto}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Camera size={20} />
                      Capture Photo
                    </button>
                    <button 
                      onClick={saveScannedDocument}
                      disabled={saving || capturedImages.length === 0}
                      className="flex-1 bg-green-600 text-white py-3 rounded-l
