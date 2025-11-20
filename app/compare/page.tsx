"use client";

import { useState } from 'react';
import { Code, Eye, Check, X, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FixResult {
  success: boolean;
  fixed_code: string;
  explanation: string;
  before_code: string;
  after_code: string;
}

export default function ComparePage() {
  const [beforeCode, setBeforeCode] = useState(`<img src="photo.jpg" />
<button onclick="doSomething()">Click Me</button>
<a href="#" style="color: #cccccc; background: #ffffff;">Link</a>
<input type="text" id="username" />`);
  
  const [issueType, setIssueType] = useState('missing_alt_text');
  const [loading, setLoading] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const issueTypes = [
    { value: 'missing_alt_text', label: 'Missing Alt Text' },
    { value: 'contrast_ratio', label: 'Color Contrast' },
    { value: 'missing_label', label: 'Missing Form Label' },
    { value: 'semantic_html', label: 'Semantic HTML' },
    { value: 'missing_aria_label', label: 'Missing ARIA Label' },
  ];

  const handleFix = async () => {
    if (!beforeCode.trim()) {
      setError('Please enter code to fix');
      return;
    }

    setLoading(true);
    setError(null);
    setFixResult(null);

    try {
      // Parse the first element from the code
      const parser = new DOMParser();
      const doc = parser.parseFromString(beforeCode, 'text/html');
      const firstElement = doc.body.firstElementChild;
      
      if (!firstElement) {
        throw new Error('Could not parse element from code');
      }

      const elementSelector = firstElement.id ? `#${firstElement.id}` : firstElement.className ? `.${firstElement.className.split(' ')[0]}` : firstElement.tagName.toLowerCase();
      const originalCode = firstElement.outerHTML;

      const response = await axios.post<FixResult>(`${API_BASE_URL}/auto-fix`, {
        issue_id: `issue-${Date.now()}`,
        element_selector: elementSelector,
        issue_type: issueType,
        original_code: originalCode,
      });

      setFixResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate fix. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Before & After Code Compare</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">See how AI fixes accessibility issues in your code</p>
      </div>

      {/* Issue Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Issue Type
        </label>
        <select
          id="issue-type"
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {issueTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.value}
            </option>
          ))}
        </select>
      </div>

      {/* Code Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <label htmlFor="before-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Code with Issue
        </label>
        <textarea
          id="before-code"
          value={beforeCode}
          onChange={(e) => setBeforeCode(e.target.value)}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter HTML code with accessibility issues..."
        />
        <button
          onClick={handleFix}
          disabled={loading}
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {loading ? 'Generating Fix...' : 'Generate Fix'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start">
          <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Comparison */}
      {fixResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-300">Before (Issue)</h2>
            </div>
            <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">
              <code className="text-gray-900 dark:text-gray-100">{fixResult.before_code}</code>
            </pre>
          </div>

          {/* After */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-300">After (Fixed)</h2>
            </div>
            <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">
              <code className="text-gray-900 dark:text-gray-100">{fixResult.after_code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Explanation */}
      {fixResult && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="flex items-start">
            <Code className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Fix Explanation</h3>
              <p className="text-blue-800 dark:text-blue-200">{fixResult.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Example Issues */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Example Issues to Try</h2>
        <div className="space-y-2">
          <button
            onClick={() => {
              setBeforeCode('<img src="photo.jpg" />');
              setIssueType('missing_alt_text');
            }}
            className="block w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
          >
            Missing Alt Text: &lt;img src="photo.jpg" /&gt;
          </button>
          <button
            onClick={() => {
              setBeforeCode('<a href="#" style="color: #cccccc; background: #ffffff;">Link</a>');
              setIssueType('contrast_ratio');
            }}
            className="block w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
          >
            Low Contrast: Link with light gray text on white
          </button>
          <button
            onClick={() => {
              setBeforeCode('<input type="text" id="username" />');
              setIssueType('missing_label');
            }}
            className="block w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
          >
            Missing Label: Input without label
          </button>
        </div>
      </div>
    </div>
  );
}

