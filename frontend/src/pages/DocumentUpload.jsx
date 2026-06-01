import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a PDF to upload');

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document processed & embedded for Document Agent!');
      setFile(null);
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/documents/${id}/toggle`);
      fetchDocs();
      toast.success('Document status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 font-display">Document Agent Knowledge Base</h1>
          <p className="text-gray-400">Upload official PDFs (Prospectus, Notices) to feed the AI Document Agent.</p>
        </motion.div>

        {/* Upload Form */}
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/20">
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-center gap-4">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30"
            />
            <button 
              type="submit" 
              disabled={uploading || !file}
              className="w-full md:w-auto px-6 py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
              Upload & Process
            </button>
          </form>
        </div>

        {/* Active Documents Table */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Active Knowledge Base</h3>
          
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>
          ) : documents.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <FileText className="text-red-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{doc.originalName}</h4>
                      <p className="text-xs text-gray-400">
                        {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleStatus(doc._id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${doc.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}
                  >
                    {doc.isActive ? <><CheckCircle size={16} /> Active in Agent</> : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DocumentUpload;
