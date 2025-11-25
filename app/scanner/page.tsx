"use client";

import { useState, useCallback, memo, useEffect } from 'react';
import { Scan, Upload, Loader2, AlertCircle, CheckCircle, ExternalLink, ChevronDown, ChevronUp, Lightbulb, Clock, FileText } from 'lucide-react';
import axios from 'axios';
import BackendStatus from '../components/BackendStatus';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with timeout and retry
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const [resultExpanded, setResultExpanded] = useState(true);

  const handleUrlScan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setResultExpanded(true);

    try {
      const response = await apiClient.post<ScanResult>('/scan-url', { url: url.trim() });
      setResult(response.data);
    } catch (err: any) {
      let errorMessage = 'Failed to scan URL. ';
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.message?.includes('Cannot connect to backend')) {
        errorMessage = `Cannot connect to backend at ${API_BASE_URL}. Please start the backend server.`;
      } else if (err.response?.status === 500) {
        errorMessage += err.response?.data?.detail || 'Server error occurred';
      } else if (err.response?.status === 404) {
        errorMessage += `Backend endpoint not found. Make sure backend is running at ${API_BASE_URL}`;
      } else if (err.response?.status === 408 || err.message?.includes('timeout')) {
        errorMessage += 'Request timeout. The website may be slow or unreachable.';
      } else if (err.response?.status === 503 || err.message?.includes('connect')) {
        errorMessage += `Cannot connect to the website. Please check the URL and try again.`;
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
    setResultExpanded(true);

    try {
      const response = await apiClient.post<ScanResult>('/scan-html', {
        html: htmlContent.trim(),
        css: cssContent.trim() || undefined,
        js: jsContent.trim() || undefined,
      });
      setResult(response.data);
    } catch (err: any) {
      let errorMessage = 'Failed to scan HTML. ';
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.message?.includes('Cannot connect to backend')) {
        errorMessage = `Cannot connect to backend at ${API_BASE_URL}. Please start the backend server.`;
      } else if (err.response?.status === 500) {
        errorMessage += err.response?.data?.detail || 'Server error occurred';
      } else {
        errorMessage += err.response?.data?.detail || err.message || 'Unknown error occurred';
      }
      
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
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setResultExpanded(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<ScanResult>(`${API_BASE_URL}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err: any) {
      let errorMessage = 'Failed to upload file. ';
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.message?.includes('Cannot connect to backend')) {
        errorMessage = `Cannot connect to backend at ${API_BASE_URL}. Please start the backend server.`;
      } else {
        errorMessage += err.response?.data?.detail || err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const criticalIssues = result?.issues.filter(i => i.severity === 'high') || [];
  const warningIssues = result?.issues.filter(i => i.severity === 'medium') || [];

  return (
    <div className="min-h-screen pb-12">
      {/* Full-width Header */}
      <header className="w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-navy-900 dark:text-white tracking-tight">
                Accessibility Scanner
              </h1>
              <p className="mt-1.5 text-lg text-gray-600 dark:text-gray-300">
                Scan websites or HTML files for accessibility issues
              </p>
            </div>
            <BackendStatus />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Glass Card Container */}
        <div className="glass rounded-[14px] shadow-xl p-8 md:p-10">
          {/* Tabs with Animated Underline */}
          <div className="mb-8 border-b border-gray-200/50 dark:border-gray-700/50">
            <nav className="flex space-x-1" aria-label="Tabs">
              <button
                onClick={() => {
                  setActiveTab('url');
                  setError(null);
                  setResult(null);
                }}
                className={`relative px-6 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-t-lg ${
                  activeTab === 'url'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                aria-selected={activeTab === 'url'}
              >
                <Scan className="w-5 h-5 inline mr-2" aria-hidden="true" />
                Scan URL
                {activeTab === 'url' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full animate-in fade-in"></span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('html');
                  setError(null);
                  setResult(null);
                }}
                className={`relative px-6 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-t-lg ${
                  activeTab === 'html'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                aria-selected={activeTab === 'html'}
              >
                <Upload className="w-5 h-5 inline mr-2" aria-hidden="true" />
                Upload HTML
                {activeTab === 'html' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full animate-in fade-in"></span>
                )}
              </button>
            </nav>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Input + CTA + Alerts */}
            <div className="lg:col-span-2 space-y-6">
              {/* URL Scanner */}
              {activeTab === 'url' && (
                <form onSubmit={handleUrlScan} className="space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-sm font-semibold text-navy-900 dark:text-white mb-3">
                      Website URL
                    </label>
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 dark:border-gray-700 rounded-[14px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-inner"
                      disabled={loading}
                      required
                      aria-required="true"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold py-4 px-6 rounded-[14px] hover:from-primary-700 hover:to-accent-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
                        Scanning...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Scan className="w-5 h-5 mr-2" aria-hidden="true" />
                        Scan Website
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* HTML Upload */}
              {activeTab === 'html' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-3">
                      Upload HTML File
                    </label>
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-primary-600 file:to-accent-500 file:text-white hover:file:from-primary-700 hover:file:to-accent-600 transition-all cursor-pointer"
                      disabled={loading}
                      aria-label="Upload HTML file"
                    />
                    {file && !loading && (
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        className="w-full mt-4 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold py-4 px-6 rounded-[14px] hover:from-primary-700 hover:to-accent-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                      >
                        <Scan className="w-5 h-5 inline mr-2" aria-hidden="true" />
                        Scan File
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-transparent text-gray-500 dark:text-gray-400">Or Paste HTML</span>
                    </div>
                  </div>

                  <form onSubmit={handleHtmlScan} className="space-y-6">
                    <div>
                      <label htmlFor="html" className="block text-sm font-semibold text-navy-900 dark:text-white mb-3">
                        HTML Content
                      </label>
                      <textarea
                        id="html"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder="<html>...</html>"
                        rows={8}
                        className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-inner"
                        required
                        aria-required="true"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold py-4 px-6 rounded-[14px] hover:from-primary-700 hover:to-accent-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
                          Scanning...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Scan className="w-5 h-5 mr-2" aria-hidden="true" />
                          Scan HTML
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="glass rounded-[14px] p-4 border-l-4 border-red-500 animate-in fade-in zoom-in-95">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Result Preview Panel */}
              {result && (
                <div className={`glass rounded-[14px] p-6 animate-in fade-in zoom-in-95 transition-all duration-300 ${resultExpanded ? 'shadow-lg' : ''}`}>
                  <button
                    onClick={() => setResultExpanded(!resultExpanded)}
                    className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
                    aria-expanded={resultExpanded}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`px-4 py-2 rounded-full font-bold text-lg ${
                          result.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          result.score >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {Math.round(result.score)}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {criticalIssues.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{criticalIssues.length} Critical</span>
                          </div>
                        )}
                        {warningIssues.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{warningIssues.length} Warnings</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {resultExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                  
                  {resultExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Total Issues" value={result.total_issues} />
                        <StatCard label="WCAG Level" value={result.wcag_level} />
                      </div>
                      <a
                        href="/reports"
                        className="block w-full text-center py-3 px-4 rounded-lg border-2 border-primary-600 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        View Full Report
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Quick Tips / Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass rounded-[14px] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">Quick Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                    <span>Enter a full URL including https://</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                    <span>Scans check WCAG 2.2 compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                    <span>Review and fix issues in the report</span>
                  </li>
                </ul>
              </div>

              {result && (
                <div className="glass rounded-[14px] p-6 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-navy-900 dark:text-white">Scan Summary</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    {result.url && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Scanned URL:</p>
                        <p className="text-gray-900 dark:text-white font-medium break-all">{result.url}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Accessibility Score:</p>
                      <p className="text-2xl font-bold text-navy-900 dark:text-white">{result.score.toFixed(1)} / 100</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">WCAG Compliance:</p>
                      <p className="text-lg font-semibold text-navy-900 dark:text-white">Level {result.wcag_level}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const StatCard = memo(({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-navy-900 dark:text-white">{value}</p>
    </div>
  );
});
StatCard.displayName = 'StatCard';
