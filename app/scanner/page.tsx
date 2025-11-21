"use client";

import { useState, useCallback, memo } from 'react';
import { Scan, Upload, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import BackendStatus from '../components/BackendStatus';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with timeout and retry
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('Cannot connect to backend. Please ensure the backend server is running on ' + API_BASE_URL));
    }
    return Promise.reject(error);
  }
);

interface ScanResult {
  success: boolean;
  url?: string;
  issues: any[];
  total_issues: number;
  wcag_level: string;
  score: number;
}

export default function ScannerPage() {
  const [url, setUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'html'>('url');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleUrlScan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url.trim());
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post<ScanResult>('/scan-url', { url: url.trim() });
      setResult(response.data);
    } catch (err: any) {
      let errorMessage = 'Failed to scan URL. ';
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        errorMessage += `Cannot connect to backend at ${API_BASE_URL}. `;
        errorMessage += 'Please make sure the backend server is running. ';
        errorMessage += 'Start it by running: python backend/simple_server.py';
      } else if (err.response?.status === 500) {
        errorMessage += err.response?.data?.detail || 'Server error occurred';
      } else if (err.response?.status === 404) {
        errorMessage += `Backend endpoint not found. Make sure backend is running at ${API_BASE_URL}`;
      } else {
        errorMessage += err.response?.data?.detail || err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleHtmlScan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlContent.trim()) {
      setError('Please enter HTML content');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post<ScanResult>('/scan-html', {
        html: htmlContent.trim(),
        css: cssContent.trim() || undefined,
        js: jsContent.trim() || undefined,
      });
      setResult(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to scan HTML. Make sure the backend is running on ' + API_BASE_URL;
      setError(errorMessage);
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  }, [htmlContent, cssContent, jsContent]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setError(null);
    // Don't auto-scan, wait for user to click scan button
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<ScanResult>(`${API_BASE_URL}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    low: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accessibility Scanner</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Scan websites or HTML files for accessibility issues</p>
        </div>
        <BackendStatus />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('url')}
            className={`${
              activeTab === 'url'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Scan className="w-5 h-5 inline mr-2" aria-hidden="true" />
            Scan URL
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`${
              activeTab === 'html'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Upload className="w-5 h-5 inline mr-2" aria-hidden="true" />
            Upload HTML
          </button>
        </nav>
      </div>

      {/* URL Scanner - Only URL scan functionality */}
      {activeTab === 'url' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleUrlScan} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
                required
                aria-required="true"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 inline animate-spin mr-2" aria-hidden="true" width="20" height="20" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" aria-hidden="true" width="20" height="20" />
                  Scan Website
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* HTML Upload */}
      {activeTab === 'html' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload HTML File
            </label>
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
              disabled={loading}
              aria-label="Upload HTML file"
            />
            {file && !loading && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: <span className="font-semibold text-gray-900 dark:text-white">{file.name}</span>
                </p>
                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Scan className="w-5 h-5 inline mr-2" aria-hidden="true" />
                  Scan File
                </button>
              </div>
            )}
            {loading && (
              <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
                <Loader2 className="w-4 h-4 inline animate-spin mr-2" aria-hidden="true" />
                Scanning file...
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or Paste HTML</span>
            </div>
          </div>

          <form onSubmit={handleHtmlScan} className="space-y-4">
            <div>
              <label htmlFor="html" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HTML Content
              </label>
              <textarea
                id="html"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<html>...</html>"
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="css" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CSS Content (Optional)
              </label>
              <textarea
                id="css"
                value={cssContent}
                onChange={(e) => setCssContent(e.target.value)}
                placeholder="/* CSS styles */"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="js" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                JavaScript Content (Optional)
              </label>
              <textarea
                id="js"
                value={jsContent}
                onChange={(e) => setJsContent(e.target.value)}
                placeholder="// JavaScript code"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 inline animate-spin mr-2" aria-hidden="true" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5 inline mr-2" aria-hidden="true" />
                  Scan HTML
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scan Results</h2>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                >
                  {result.url}
                  <ExternalLink className="w-4 h-4 ml-1" aria-hidden="true" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Issues" value={result.total_issues} />
              <StatCard label="WCAG Level" value={result.wcag_level} />
              <StatCard label="Accessibility Score" value={`${result.score.toFixed(1)}/100`} />
              <StatCard label="Status" value={result.total_issues === 0 ? 'Passed' : 'Issues Found'} />
            </div>
          </div>

          {/* Issues List */}
          {result.issues.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Issues Found</h3>
              <div className="space-y-4">
                {result.issues.map((issue, index) => (
                  <IssueCard key={issue.id || index} issue={issue} severityColors={severityColors} />
                ))}
              </div>
            </div>
          )}

          {result.issues.length === 0 && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" aria-hidden="true" />
              <p className="text-green-800 dark:text-green-200 font-medium">No accessibility issues found! Great job!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const StatCard = memo(({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
});
StatCard.displayName = 'StatCard';

const IssueCard = memo(({ issue, severityColors }: { issue: any; severityColors: any }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColors[issue.severity as keyof typeof severityColors] || severityColors.medium}`}>
              {issue.severity?.toUpperCase() || 'MEDIUM'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">WCAG {issue.wcag_level} - {issue.wcag_rule}</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{issue.message}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{issue.description}</p>
          {issue.fix_suggestion && (
            <p className="text-sm text-primary-600 dark:text-primary-400">
              <strong>Fix:</strong> {issue.fix_suggestion}
            </p>
          )}
          {issue.selector && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono break-all">{issue.selector}</p>
          )}
        </div>
      </div>
    </div>
  );
});
IssueCard.displayName = 'IssueCard';

