import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Documents() {
  const navigate = useNavigate();
  const { documents, updateDocument } = useApp();
  const [uploading, setUploading] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    passport: null,
    bankStatement: null,
    employmentProof: null,
  });

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    setUploading(type);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUploadedFiles(prev => ({
      ...prev,
      [type]: { name: file.name, size: file.size }
    }));
    updateDocument(type);
    setUploading(null);
  };

  const documentTypes = [
    { key: 'passport', title: 'Passport', description: 'Upload a clear image of your passport', accept: 'image/*,.pdf' },
    { key: 'bankStatement', title: 'Bank Statement', description: 'Recent bank statement (last 3 months)', accept: 'image/*,.pdf' },
    { key: 'employmentProof', title: 'Employment Proof', description: 'Job letter, contract, or business registration', accept: 'image/*,.pdf' },
  ];

  const getScore = () => {
    let score = 0;
    if (documents.passport) score += 5;
    if (documents.bankStatement) score += 5;
    if (documents.employmentProof) score += 5;
    return score;
  };

  const handleSubmit = () => {
    navigate('/processing');
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Documents</h1>
          <p className="text-gray-400">Upload supporting documents to improve your assessment</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Document Score</h3>
              <p className="text-gray-400 text-sm">Maximum 15 points</p>
            </div>
            <span className="text-3xl font-bold gradient-text">{getScore()}/15</span>
          </div>
          <div className="mt-4 h-2 bg-navy-700 rounded-full overflow-hidden">
            <div className="h-full gradient-bg transition-all" style={{ width: `${(getScore() / 15) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {documentTypes.map((doc) => (
            <div key={doc.key} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    documents[doc.key] ? 'bg-green-500/20 text-green-400' : 'bg-navy-700 text-gray-400'
                  }`}>
                    {documents[doc.key] ? <CheckCircle size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{doc.title}</h3>
                    <p className="text-gray-400 text-sm">{doc.description}</p>
                    {uploadedFiles[doc.key] && (
                      <p className="text-green-400 text-xs mt-1">Uploaded: {uploadedFiles[doc.key].name}</p>
                    )}
                  </div>
                </div>

                <label className="cursor-pointer">
                  <input type="file" accept={doc.accept} className="hidden" onChange={(e) => handleFileUpload(doc.key, e.target.files[0])} />
                  <div className={`px-4 py-2 rounded-lg border ${
                    documents[doc.key] ? 'border-green-500 text-green-400' : 'border-neon-purple text-neon-purple hover:bg-neon-purple/10'
                  } transition-colors flex items-center gap-2`}>
                    {uploading === doc.key ? (
                      <><div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" /><span>Uploading...</span></>
                    ) : documents[doc.key] ? (
                      <><CheckCircle size={16} /><span>Uploaded</span></>
                    ) : (
                      <><Upload size={16} /><span>Upload</span></>
                    )}
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button onClick={() => navigate('/profile')} className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5">
            Back
          </button>
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            Generate Assessment <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
