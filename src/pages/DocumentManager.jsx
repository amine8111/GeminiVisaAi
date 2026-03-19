import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    fetchDocuments();
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Document Manager</h1>
            <p className="text-gray-600">Track your visa application documents</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            {showForm ? 'Cancel' : 'Add Document'}
          </button>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> This is a metadata-only simulation. Actual file uploads are not stored to stay within free-tier limits. 
            Document metadata is stored in the database and associated with your profile.
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Document Metadata</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select name="document_type" value={formData.document_type} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                    <option value="">Select...</option>
                    <option value="Passport Scan">Passport Scan</option>
                    <option value="Bank Statement">Bank Statement</option>
                    <option value="Employment Letter">Employment Letter</option>
                    <option value="Travel Insurance">Travel Insurance</option>
                    <option value="Hotel Booking">Hotel Booking</option>
                    <option value="Flight Ticket">Flight Ticket</option>
                    <option value="Photo">Photo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                  <input type="text" name="file_name" value={formData.file_name} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., passport_john_doe.pdf" required />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Metadata'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No documents yet</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 text-sm text-gray-800">{doc.document_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doc.file_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {doc.application_id ? `App #${doc.application_id}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DocumentManager;