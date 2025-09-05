import React, { useState } from 'react';
import { Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createPhoneCall } from '../utils/api';

const CreatePhone = () => {
  const [formData, setFormData] = useState({
    from_number: '+14157774444',
    to_number: '+12137774445'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await createPhoneCall(formData);
      setResult(response);
      console.log('Phone call response:', response);
    } catch (err) {
      setError(err.message || 'Failed to create phone call');
      console.error('Error creating phone call:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Phone className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Create Phone Call</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="from_number" className="block text-sm font-medium text-gray-700 mb-2">
              From Number
            </label>
            <input
              type="tel"
              id="from_number"
              name="from_number"
              value={formData.from_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+14157774444"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Your verified Retell AI phone number
            </p>
          </div>

          <div>
            <label htmlFor="to_number" className="block text-sm font-medium text-gray-700 mb-2">
              To Number
            </label>
            <input
              type="tel"
              id="to_number"
              name="to_number"
              value={formData.to_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+12137774445"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              The phone number to call
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Creating Phone Call...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Create Phone Call
              </>
            )}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <h3 className="text-sm font-medium text-green-800">Phone Call Created Successfully!</h3>
            </div>
            <div className="mt-2 text-sm text-green-700">
              <p><strong>Agent ID:</strong> {result.agent_id}</p>
              <p><strong>Call ID:</strong> {result.call_id}</p>
              <p><strong>Status:</strong> {result.status}</p>
              {result.message && <p><strong>Message:</strong> {result.message}</p>}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Error Creating Phone Call</h3>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Make sure your "From Number" is verified with Retell AI</li>
            <li>• The "To Number" should be a valid phone number in E.164 format</li>
            <li>• This will create a phone call using the Retell AI API</li>
            <li>• The call will use the default agent configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePhone;
