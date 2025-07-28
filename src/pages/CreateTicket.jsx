import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, Send, ArrowLeft, FileText, X } from 'lucide-react';

export default function CreateTicket() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      if (file) {
        formDataToSend.append('attachment', file);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create ticket');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const inputStyle = "w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#13A24B] focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-[#E9F7F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <img 
              src="/webtirety-logo.png" 
              alt="Webtirety Software Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-[#13A24B]">Create a New Ticket</h1>
            <p className="mt-1 text-gray-500">Please provide the details below. We're here to help!</p>
             <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 inline-flex items-center space-x-2 text-gray-600 hover:text-[#F47121] font-semibold"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
            </button>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md text-sm font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className={inputStyle}
                  placeholder="e.g., Cannot access billing page"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className={inputStyle}>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select id="priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} required className={inputStyle}>
                <option value="low">Low - General question</option>
                <option value="medium">Medium - Standard issue</option>
                <option value="high">High - Urgent issue</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                className={inputStyle}
                placeholder="Please provide as much detail as possible..."
              />
            </div>
            <div>
              <label htmlFor="attachment" className="block text-sm font-semibold text-gray-700 mb-2">
                Attachment (Optional)
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="attachment"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#13A24B] hover:text-green-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#13A24B]"
                    >
                      <span>Upload a file</span>
                      <input id="attachment" name="attachment" type="file" className="sr-only" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF, etc. up to 10MB</p>
                </div>
              </div>
              {file && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button type="button" onClick={() => setFile(null)} className="text-gray-500 hover:text-red-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-bold text-white uppercase tracking-wider bg-[#F47121] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F47121] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}