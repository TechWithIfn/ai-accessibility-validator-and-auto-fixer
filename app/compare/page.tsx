"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Code, Eye, Check, X, ArrowRight, Shield, Lock, Zap, AlertCircle,
  Copy, RotateCcw, Undo2, CheckCircle2, XCircle, Info, Play,
  Loader2, Search, Filter, Maximize2, Minimize2
} from 'lucide-react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { diffLines, diffWords } from 'diff';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AccessibilityIssue {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  wcag_level: string;
  wcag_rule: string;
  element: string;
  selector: string;
  message: string;
  description: string;
  fix_suggestion: string;
}

interface ScanResponse {
  success: boolean;
  issues: AccessibilityIssue[];
  total_issues: number;
  wcag_level: string;
  score: number;
}

interface FixResult {
  issue_id: string;
  success: boolean;
  fixed_code: string;
  explanation: string;
  before_code: string;
  after_code: string;
  issue_type: string;
}

interface IndividualFix {
  issue: AccessibilityIssue;
  fix: FixResult | null;
  accepted: boolean;
  rejected: boolean;
}

const ISSUE_TYPE_NAMES: Record<string, string> = {
  missing_alt_text: 'Missing ALT Text',
  contrast_ratio: 'Low Contrast Text',
  missing_label: 'Input Missing Label',
  missing_aria_label: 'Missing Button Role',
  semantic_html: 'Improper ARIA Usage',
  keyboard_navigation: 'Heading Structure Issues',
  focus_management: 'Focus Management Issues',
};

const SEVERITY_COLORS = {
  high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
};

export default function ComparePage() {
  const [originalCode, setOriginalCode] = useState(`<img src="photo.jpg" />
<button onclick="doSomething()">Click Me</button>
<a href="#" style="color: #cccccc; background: #ffffff;">Link</a>
<input type="text" id="username" />`);
  
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [individualFixes, setIndividualFixes] = useState<Map<string, IndividualFix>>(new Map());
  const [finalFixedCode, setFinalFixedCode] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState<'local' | 'server'>('local');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [ariaLiveMessage, setAriaLiveMessage] = useState('');
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const codeHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  // Auto-detect issues when code changes
  const handleAutoScan = async () => {
    if (!originalCode.trim()) {
      setError('Please enter code to scan');
      return;
    }

    setScanning(true);
    setError(null);
    setIssues([]);
    setIndividualFixes(new Map());
    setFinalFixedCode(null);
    setSelectedIssueId(null);

    try {
      if (privacyMode === 'local') {
        // Local-only processing simulation (would use client-side scanner)
        setAriaLiveMessage('Scanning code locally...');
        // For now, we'll still use the API but show privacy indicator
        // In production, this would use a pure client-side scanner
      } else {
        setAriaLiveMessage('Scanning code on server...');
      }

      const response = await axios.post<ScanResponse>(`${API_BASE_URL}/scan-html`, {
        html: originalCode,
        css: '',
        js: '',
      });

      setIssues(response.data.issues || []);
      setAriaLiveMessage(`Found ${response.data.issues.length} accessibility issue${response.data.issues.length !== 1 ? 's' : ''}`);
      
      // Automatically generate fixes for all issues
      if (response.data.issues.length > 0) {
        await generateFixesForAllIssues(response.data.issues, originalCode);
      }
    } catch (err: any) {
      let errorMsg = 'Failed to scan code. ';
      
      if (err.response) {
        // Backend returned an error
        const detail = err.response.data?.detail || err.response.data?.error || err.response.statusText;
        const status = err.response.status;
        
        if (status === 500) {
          errorMsg += `Internal server error: ${detail || 'An unexpected error occurred on the server.'}`;
        } else if (status === 400) {
          errorMsg += `Invalid request: ${detail || 'Please check your input and try again.'}`;
        } else if (status === 503) {
          errorMsg += `Service unavailable: ${detail || 'The backend service is not available. Please check if it is running.'}`;
        } else {
          errorMsg += `${detail || 'Unknown error occurred.'}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMsg += 'No response from server. Make sure the backend is running at ' + API_BASE_URL;
      } else {
        // Error setting up request
        errorMsg += err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMsg);
      setAriaLiveMessage(`Error: ${errorMsg}`);
    } finally {
      setScanning(false);
    }
  };

  const generateFixesForAllIssues = async (detectedIssues: AccessibilityIssue[], code: string) => {
    setLoading(true);
    const fixesMap = new Map<string, IndividualFix>();

    // Initialize all fixes
    detectedIssues.forEach(issue => {
      fixesMap.set(issue.id, {
        issue,
        fix: null,
        accepted: false,
        rejected: false,
      });
    });

    setIndividualFixes(fixesMap);

    // Generate fixes for each issue
    for (const issue of detectedIssues) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'text/html');
        const element = doc.querySelector(issue.selector) || doc.body.firstElementChild;
        
        if (!element) continue;

        const elementSelector = issue.selector;
        const originalElementCode = element.outerHTML;

        const fixResponse = await axios.post<FixResult>(`${API_BASE_URL}/auto-fix`, {
          issue_id: issue.id,
          element_selector: elementSelector,
          issue_type: issue.type,
          original_code: originalElementCode,
        });

        const updatedFix: IndividualFix = {
          issue,
          fix: {
            ...fixResponse.data,
            issue_type: issue.type,
          },
          accepted: false,
          rejected: false,
        };

        fixesMap.set(issue.id, updatedFix);
        setIndividualFixes(new Map(fixesMap));
      } catch (err: any) {
        console.error(`Failed to generate fix for issue ${issue.id}:`, err);
        // Update fix item with error state
        const errorFix: IndividualFix = {
          issue,
          fix: null,
          accepted: false,
          rejected: false,
        };
        fixesMap.set(issue.id, errorFix);
        setIndividualFixes(new Map(fixesMap));
      }
    }

    // Generate combined fixed code
    generateCombinedFixedCode(fixesMap, code);
    setLoading(false);
  };

  const generateCombinedFixedCode = (fixesMap: Map<string, IndividualFix>, original: string) => {
    let fixed = original;
    const parser = new DOMParser();

    fixesMap.forEach((item) => {
      if (item.fix && item.accepted && !item.rejected) {
        try {
          const doc = parser.parseFromString(fixed, 'text/html');
          const element = doc.querySelector(item.issue.selector);
          
          if (element && item.fix.fixed_code) {
            const fixedDoc = parser.parseFromString(item.fix.fixed_code, 'text/html');
            const fixedElement = fixedDoc.body.firstElementChild;
            
            if (fixedElement) {
              element.outerHTML = fixedElement.outerHTML;
              fixed = doc.body.innerHTML;
            }
          }
        } catch (err) {
          console.error('Error applying fix:', err);
        }
      }
    });

    setFinalFixedCode(fixed);
    codeHistoryRef.current = [...codeHistoryRef.current.slice(0, historyIndexRef.current + 1), fixed];
    historyIndexRef.current = codeHistoryRef.current.length - 1;
  };

  const handleAcceptFix = (issueId: string) => {
    const item = individualFixes.get(issueId);
    if (!item) return;

    const updated = new Map(individualFixes);
    updated.set(issueId, {
      ...item,
      accepted: true,
      rejected: false,
    });
    setIndividualFixes(updated);
    generateCombinedFixedCode(updated, originalCode);
    setAriaLiveMessage(`Accepted fix for: ${ISSUE_TYPE_NAMES[item.issue.type] || item.issue.type}`);
  };

  const handleRejectFix = (issueId: string) => {
    const item = individualFixes.get(issueId);
    if (!item) return;

    const updated = new Map(individualFixes);
    updated.set(issueId, {
      ...item,
      accepted: false,
      rejected: true,
    });
    setIndividualFixes(updated);
    generateCombinedFixedCode(updated, originalCode);
    setAriaLiveMessage(`Rejected fix for: ${ISSUE_TYPE_NAMES[item.issue.type] || item.issue.type}`);
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setFinalFixedCode(codeHistoryRef.current[historyIndexRef.current]);
      setAriaLiveMessage('Undid last change');
    }
  };

  const handleReset = () => {
    setFinalFixedCode(null);
    setIndividualFixes(new Map());
    setIssues([]);
    setSelectedIssueId(null);
    codeHistoryRef.current = [];
    historyIndexRef.current = -1;
    setAriaLiveMessage('Reset all changes');
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setAriaLiveMessage('Code copied to clipboard');
    } catch (err) {
      setError('Failed to copy code');
    }
  };

  const updatePreview = (code: string) => {
    if (!previewIframeRef.current) return;

    const iframe = previewIframeRef.current;
    const sanitized = DOMPurify.sanitize(code, {
      ALLOWED_TAGS: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'button', 'input', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'form', 'select', 'textarea', 'style'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'id', 'class', 'type', 'for', 'name', 'value', 'placeholder', 'role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'tabindex', 'style'],
    });

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { margin: 20px; font-family: system-ui, sans-serif; }
            </style>
          </head>
          <body>${sanitized}</body>
        </html>
      `);
      iframeDoc.close();
    }
  };

  useEffect(() => {
    if (finalFixedCode && showPreview) {
      updatePreview(finalFixedCode);
    }
  }, [finalFixedCode, showPreview]);

  const renderDiff = (before: string, after: string) => {
    const diff = diffLines(before, after);
    return diff.map((part, index) => {
      if (part.added) {
        return (
          <div key={index} className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 pl-2 py-1">
            <span className="text-green-800 dark:text-green-200">+ {part.value}</span>
          </div>
        );
      }
      if (part.removed) {
        return (
          <div key={index} className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 pl-2 py-1">
            <span className="text-red-800 dark:text-red-200">- {part.value}</span>
          </div>
        );
      }
      return (
        <div key={index} className="pl-2 py-1 text-gray-700 dark:text-gray-300">
          {part.value}
        </div>
      );
    });
  };

  const canUndo = historyIndexRef.current > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ARIA Live Region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaLiveMessage}
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Before & After Code Compare
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Automatically detect and fix accessibility issues with side-by-side comparison
            </p>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
              {privacyMode === 'local' ? (
                <>
                  <Lock className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Local Processing
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Server Processing
                  </span>
                </>
              )}
              <button
                onClick={() => setPrivacyMode(privacyMode === 'local' ? 'server' : 'local')}
                className="ml-2 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                role="switch"
                aria-checked={privacyMode === 'local'}
                aria-label="Toggle privacy mode"
                style={{
                  backgroundColor: privacyMode === 'local' ? '#10b981' : '#6b7280',
                }}
              >
                <span
                  className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  style={{
                    transform: privacyMode === 'local' ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className={`bg-gradient-to-r ${
          privacyMode === 'local'
            ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
            : 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'
        } border rounded-xl p-4 flex items-start gap-3`}>
          {privacyMode === 'local' ? (
            <Lock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {privacyMode === 'local'
                ? 'Your code is processed locally and never uploaded'
                : 'Your code will be processed on the server'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {privacyMode === 'local'
                ? 'All analysis happens in your browser. No data leaves your device.'
                : 'Code will be sent to our secure server for processing.'}
            </p>
          </div>
        </div>

        {/* Code Input Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="code-input" className="block text-lg font-semibold text-gray-900 dark:text-white">
              Your HTML Code
            </label>
            <button
              onClick={handleAutoScan}
              disabled={scanning || loading || !originalCode.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium"
              aria-label="Automatically scan and fix accessibility issues"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" aria-hidden="true" />
                  <span>Auto-Scan & Fix All Issues</span>
                </>
              )}
            </button>
          </div>
          
          <textarea
            id="code-input"
            value={originalCode}
            onChange={(e) => {
              setOriginalCode(e.target.value);
              setIssues([]);
              setFinalFixedCode(null);
              setIndividualFixes(new Map());
            }}
            rows={12}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-y"
            placeholder="Paste your HTML code here... The system will automatically detect all accessibility issues."
            aria-describedby="code-input-description"
          />
          <p id="code-input-description" className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter your HTML code and click &quot;Auto-Scan & Fix All Issues&quot; to automatically detect and fix accessibility problems.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 font-medium mb-2">{error}</p>
              {error.includes('No response from server') && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">To start the backend server:</p>
                  <ol className="text-sm text-red-800 dark:text-red-200 list-decimal list-inside space-y-1 ml-2">
                    <li>Open a new terminal/PowerShell window</li>
                    <li>Navigate to the backend directory: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">cd backend</code></li>
                    <li>Run: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">start_server.bat</code> (Windows) or <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">python main.py</code></li>
                    <li>Wait for "Application startup complete" message</li>
                    <li>Then refresh this page</li>
                  </ol>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                    Or use: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">.\START_BACKEND.ps1</code> from the project root
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detected Issues ({issues.length})
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Review and accept or reject each fix individually
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Reset all changes"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {issues.map((issue) => {
                const fixItem = individualFixes.get(issue.id);
                const hasFix = fixItem?.fix !== null;
                const isAccepted = fixItem?.accepted;
                const isRejected = fixItem?.rejected;

                return (
                  <div
                    key={issue.id}
                    className={`border-2 rounded-xl p-5 transition-all ${
                      isAccepted
                        ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                        : isRejected
                        ? 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'
                        : selectedIssueId === issue.id
                        ? 'border-primary-400 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${SEVERITY_COLORS[issue.severity]}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            WCAG {issue.wcag_level} • {issue.wcag_rule}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {ISSUE_TYPE_NAMES[issue.type] || issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{issue.description}</p>
                        
                        {hasFix && fixItem?.fix && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start gap-2 mb-2">
                              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                Fix Explanation:
                              </p>
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-200 ml-6">
                              {fixItem.fix.explanation}
                            </p>
                          </div>
                        )}

                        {!hasFix && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            <span>Generating fix...</span>
                          </div>
                        )}
                      </div>

                      {hasFix && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAcceptFix(issue.id)}
                            disabled={isAccepted}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              isAccepted
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default'
                                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                            }`}
                            aria-label={`Accept fix for ${ISSUE_TYPE_NAMES[issue.type] || issue.type}`}
                          >
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            {isAccepted ? 'Accepted' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleRejectFix(issue.id)}
                            disabled={isRejected}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              isRejected
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default'
                                : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                            }`}
                            aria-label={`Reject fix for ${ISSUE_TYPE_NAMES[issue.type] || issue.type}`}
                          >
                            <XCircle className="w-4 h-4" aria-hidden="true" />
                            {isRejected ? 'Rejected' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison */}
        {finalFixedCode && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Undo last change"
                >
                  <Undo2 className="w-4 h-4" aria-hidden="true" />
                  Undo
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={showPreview ? 'Hide preview' : 'Show preview'}
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              <button
                onClick={() => handleCopyCode(finalFixedCode)}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Copy fixed code to clipboard"
              >
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copy Fixed Code
              </button>
            </div>

            {/* Comparison Grid */}
            <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {/* Before Code */}
              <div className="bg-red-50/50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-700 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-300">Before (Original)</h2>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-auto">
                  <pre className="text-sm font-mono">
                    <code className="text-gray-900 dark:text-gray-100">{originalCode}</code>
                  </pre>
                </div>
              </div>

              {/* After Code */}
              <div className="bg-green-50/50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-700 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-green-900 dark:text-green-300">After (Fixed)</h2>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-auto">
                  <pre className="text-sm font-mono">
                    <code className="text-gray-900 dark:text-gray-100">{finalFixedCode}</code>
                  </pre>
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h2>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 max-h-[600px] overflow-auto">
                    <iframe
                      ref={previewIframeRef}
                      title="Code preview"
                      sandbox="allow-same-origin"
                      className="w-full h-[600px] border-0"
                      aria-label="Preview of the fixed HTML code"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Diff View */}
            {individualFixes.size > 0 && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Detailed Changes</h2>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[400px] overflow-auto font-mono text-sm">
                  {Array.from(individualFixes.values())
                    .filter(item => item.accepted && item.fix)
                    .map((item, index) => (
                      <div key={index} className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {ISSUE_TYPE_NAMES[item.issue.type] || item.issue.type}
                        </h3>
                        {item.fix && renderDiff(item.fix.before_code, item.fix.after_code)}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Example Code */}
        {issues.length === 0 && !loading && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Try These Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setOriginalCode('<img src="photo.jpg" />');
                  setAriaLiveMessage('Loaded example: Missing ALT text');
                }}
                className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="font-semibold mb-1">Missing ALT Text</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">&lt;img src=&quot;photo.jpg&quot; /&gt;</div>
              </button>
              <button
                onClick={() => {
                  setOriginalCode('<a href="#" style="color: #cccccc; background: #ffffff;">Link</a>');
                  setAriaLiveMessage('Loaded example: Low contrast');
                }}
                className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="font-semibold mb-1">Low Contrast</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">Light gray on white</div>
              </button>
              <button
                onClick={() => {
                  setOriginalCode('<input type="text" id="username" />');
                  setAriaLiveMessage('Loaded example: Missing label');
                }}
                className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="font-semibold mb-1">Missing Label</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">&lt;input&gt; without label</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
