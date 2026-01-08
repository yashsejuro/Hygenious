// app/dashboard/audits/new/page.js

'use client';

import { useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';

export default function NewAuditPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Kitchen');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            location: location,
            areaNotes: ''
          }),
        });

        const data = await response.json();

        if (data.success) {
          setResult(data.data.result);
        } else {
          // Handle rate limit error
          if (response.status === 429) {
            setError(`Rate limit exceeded. Please wait ${data.retryAfter || 60} seconds and try again.`);
          } else {
            setError(data.error || 'Analysis failed');
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to analyze image. Please try again.');
      } finally {
        setAnalyzing(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Audit</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={analyzing}
            />
            <label htmlFor="file-upload" className={`cursor-pointer ${analyzing ? 'opacity-50' : ''}`}>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, or WEBP (max 10MB)
              </p>
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Location Type</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              disabled={analyzing}
            >
              <option>Kitchen</option>
              <option>Restroom</option>
              <option>Dining Area</option>
              <option>Storage</option>
              <option>Custom</option>
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || analyzing}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              'Analyze Image'
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div>
          {result && (
            <div className="space-y-4">
              {/* Score Display */}
              <div className="bg-white border rounded-lg p-6 text-center">
                <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}
                  <span className="text-2xl">/100</span>
                </div>
                <p className="text-gray-600 mt-2">
                  {result.overallScore >= 85 && '✅ Excellent'}
                  {result.overallScore >= 60 && result.overallScore < 85 && '⚠️ Good'}
                  {result.overallScore < 60 && '❌ Poor'}
                </p>

                {/* Category Scores */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {result.cleanliness}
                    </div>
                    <div className="text-xs text-gray-600">Cleanliness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.organization}
                    </div>
                    <div className="text-xs text-gray-600">Organization</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.safety}
                    </div>
                    <div className="text-xs text-gray-600">Safety</div>
                  </div>
                </div>
              </div>

              {/* Assessment */}
              {result.assessment && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Assessment</h3>
                  <p className="text-sm text-gray-700">{result.assessment}</p>
                </div>
              )}

              {/* Issues */}
              {result.issues && result.issues.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Detected Issues ({result.issues.length})</h3>
                  <div className="space-y-2">
                    {result.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{issue.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{issue.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Confidence: {issue.confidence}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-teal-600 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg">
                  Save Audit
                </button>
                <button className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg">
                  Export Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}