"use client";

import { useState } from 'react';
import { Code, Download, Copy, Check, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Issue {
  id: string;
  issue_id?: string;
  type: string;
  issue_type?: string;
  selector?: string;
  element_selector?: string;
  original_code?: string;
  message?: string;
}

interface FixResult {
  fixed_code: string;
  explanation: string;
  before_code: string;
  after_code: string;
}

interface AutoFixPanelProps {
  issue: Issue;
  onFixComplete?: (fix: FixResult) => void;
}

export default function AutoFixPanel({ issue, onFixComplete }: AutoFixPanelProps) {
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleFix = async () => {
    setLoading(true);
    setError(null);
    setFixResult(null);

    try {
      // Get original code from issue, or use a placeholder
      let originalCode = issue.original_code || '';
      
      // If no original_code, try to construct from element field
      if (!originalCode && (issue as any).element) {
        originalCode = (issue as any).element;
      }
      
      // If still no code, create a basic HTML structure based on selector
      if (!originalCode && issue.selector) {
        const selector = issue.selector;
        if (selector.startsWith('img') || issue.type?.includes('alt')) {
          originalCode = `<img src="image.jpg" />`;
        } else if (selector.startsWith('input') || issue.type?.includes('label')) {
          originalCode = `<input type="text" />`;
        } else if (selector.startsWith('html')) {
          originalCode = `<html></html>`;
        } else {
          originalCode = `<${selector.replace(/[#.]/g, '') || 'div'}></${selector.replace(/[#.]/g, '') || 'div'}>`;
        }
      }
      
      // Fallback if still empty
      if (!originalCode) {
        originalCode = '<div></div>';
      }

      const response = await axios.post<FixResult>(`${API_BASE_URL}/auto-fix`, {
        issue_id: issue.issue_id || issue.id,
        element_selector: issue.element_selector || issue.selector || '',
        issue_type: issue.issue_type || issue.type,
        original_code: originalCode,
      });

      setFixResult(response.data);
      if (onFixComplete) {
        onFixComplete(response.data);
      }
    } catch (err: any) {
      console.error('Fix error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to generate fix');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadPatch = () => {
    if (!fixResult) return;

    const patch = {
      issue_id: issue.id,
      issue_type: issue.type,
      selector: issue.selector || issue.element_selector,
      before: fixResult.before_code,
      after: fixResult.after_code,
      explanation: fixResult.explanation,
    };

    const blob = new Blob([JSON.stringify(patch, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fix-${issue.id}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const applyFix = async () => {
    setApplying(true);
    // In a real implementation, this would apply the fix to the actual codebase
    // For now, we'll just show a success message
    setTimeout(() => {
      setApplying(false);
      alert('Fix applied successfully! (This is a demo - in production, this would update your codebase)');
    }, 1000);
  };

  return (
    <div className="glass rounded-[14px] p-6 border-2 border-primary-200 dark:border-primary-800">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Auto-Fix</h3>
      </div>

      {!fixResult && !loading && (
        <button
          onClick={handleFix}
          className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-primary-700 hover:to-accent-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Sparkles className="w-5 h-5" />
          Generate Fix with AI
        </button>
      )}

      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI is analyzing the issue and generating a fix...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {fixResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Explanation */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              AI Explanation:
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {fixResult.explanation}
            </p>
          </div>

          {/* Before/After Code Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  Before
                </label>
                <button
                  onClick={() => copyToClipboard(fixResult.before_code)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="px-3 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs font-mono text-gray-900 dark:text-white overflow-x-auto border border-red-200 dark:border-red-800">
                {fixResult.before_code}
              </pre>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>

            {/* After */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  After (AI Fix)
                </label>
                <button
                  onClick={() => copyToClipboard(fixResult.after_code)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="px-3 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs font-mono text-gray-900 dark:text-white overflow-x-auto border border-green-200 dark:border-green-800">
                {fixResult.after_code}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={applyFix}
              disabled={applying}
              className="flex-1 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply Fix
                </>
              )}
            </button>
            <button
              onClick={downloadPatch}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Patch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

