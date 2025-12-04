"use client";

import { useState, useMemo } from 'react';
import { Palette, AlertTriangle, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';

interface ContrastIssue {
  id: string;
  element: string;
  textColor: string;
  backgroundColor: string;
  currentRatio: number;
  requiredRatio: number;
  level: 'AA' | 'AAA';
  status: 'pass' | 'fail';
  suggestedTextColor?: string;
  suggestedBackgroundColor?: string;
}

interface ColorContrastAnalyzerProps {
  issues: any[];
  onAutoFix?: (issue: ContrastIssue) => void;
}

// Calculate contrast ratio between two colors
function calculateContrastRatio(color1: string, color2: string): number {
  // Simple contrast calculation (in production, use proper color parsing)
  // This is a simplified version - real implementation would parse hex/rgb properly
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const [rLin, gLin, bLin] = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Suggest accessible color
function suggestAccessibleColor(textColor: string, bgColor: string, requiredRatio: number): string {
  // Simplified suggestion - in production, use proper color algorithms
  const bgLum = parseInt(bgColor.replace('#', '').substr(0, 2), 16);
  
  // If background is light, suggest dark text; if dark, suggest light text
  if (bgLum > 128) {
    // Light background - suggest dark text
    return '#000000';
  } else {
    // Dark background - suggest light text
    return '#FFFFFF';
  }
}

export default function ColorContrastAnalyzer({ issues, onAutoFix }: ColorContrastAnalyzerProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  // Extract contrast issues from scan results
  const contrastIssues = useMemo(() => {
    const contrast: ContrastIssue[] = [];

    issues.forEach((issue) => {
      if (issue.type?.toLowerCase().includes('contrast') || issue.type?.toLowerCase().includes('color')) {
        const textColor = issue.text_color || issue.textColor || '#000000';
        const bgColor = issue.background_color || issue.backgroundColor || '#FFFFFF';
        const currentRatio = issue.contrast_ratio || issue.currentRatio || calculateContrastRatio(textColor, bgColor);
        const requiredRatio = issue.required_ratio || issue.requiredRatio || 4.5;
        const level = issue.wcag_level === 'AAA' ? 'AAA' : 'AA';

        contrast.push({
          id: issue.id || `contrast-${contrast.length}`,
          element: issue.selector || issue.element_selector || 'Unknown element',
          textColor,
          backgroundColor: bgColor,
          currentRatio,
          requiredRatio: level === 'AAA' ? 7 : 4.5,
          level,
          status: currentRatio >= requiredRatio ? 'pass' : 'fail',
          suggestedTextColor: suggestAccessibleColor(textColor, bgColor, requiredRatio),
        });
      }
    });

    return contrast;
  }, [issues]);

  const toggleIssue = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  const failingIssues = contrastIssues.filter(issue => issue.status === 'fail');
  const passingIssues = contrastIssues.filter(issue => issue.status === 'pass');

  if (contrastIssues.length === 0) {
    return (
      <div className="glass rounded-[14px] p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No color contrast issues found!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-[14px] p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Failing</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failingIssues.length}</p>
        </div>
        <div className="glass rounded-[14px] p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Passing</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{passingIssues.length}</p>
        </div>
        <div className="glass rounded-[14px] p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{contrastIssues.length}</p>
        </div>
      </div>

      {/* Failing Issues */}
      {failingIssues.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Failing Color Pairs ({failingIssues.length})
          </h3>
          {failingIssues.map((issue) => {
            const isExpanded = expandedIssues.has(issue.id);
            const ratioDiff = issue.requiredRatio - issue.currentRatio;

            return (
              <div
                key={issue.id}
                className="glass rounded-[14px] p-6 border-l-4 border-red-500 animate-in fade-in"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        {issue.element}
                      </h4>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        FAIL
                      </span>
                    </div>

                    {/* Color Preview */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: issue.backgroundColor }}
                          title={`Background: ${issue.backgroundColor}`}
                        />
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold"
                          style={{ 
                            backgroundColor: issue.textColor,
                            color: issue.backgroundColor 
                          }}
                          title={`Text: ${issue.textColor}`}
                        >
                          Aa
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Current contrast: </span>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {issue.currentRatio.toFixed(2)}:1
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Required ({issue.level}): </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {issue.requiredRatio}:1
                          </span>
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Needs {ratioDiff.toFixed(2)}:1 more contrast
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-in fade-in">
                        {/* Suggested Fix */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            Suggested Fix:
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: issue.backgroundColor }}
                              />
                              <div
                                className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold"
                                style={{ 
                                  backgroundColor: issue.suggestedTextColor,
                                  color: issue.backgroundColor 
                                }}
                              >
                                Aa
                              </div>
                            </div>
                            <div>
                              <div className="text-sm">
                                <span className="text-gray-600 dark:text-gray-400">New text color: </span>
                                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                                  {issue.suggestedTextColor}
                                </code>
                              </div>
                              <div className="text-sm mt-1">
                                <span className="text-gray-600 dark:text-gray-400">New contrast: </span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  {calculateContrastRatio(issue.suggestedTextColor!, issue.backgroundColor).toFixed(2)}:1
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleIssue(issue.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-600 dark:text-gray-400"
                    >
                      {isExpanded ? 'Less' : 'More'}
                    </button>
                    {onAutoFix && (
                      <button
                        onClick={() => onAutoFix(issue)}
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-accent-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                      >
                        <Sparkles className="w-4 h-4" />
                        Auto Fix
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Passing Issues (Collapsed by default) */}
      {passingIssues.length > 0 && (
        <details className="glass rounded-[14px] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Passing Color Pairs ({passingIssues.length})
          </summary>
          <div className="mt-4 space-y-2">
            {passingIssues.map((issue) => (
              <div key={issue.id} className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                {issue.element}: {issue.currentRatio.toFixed(2)}:1 (✓ {issue.level})
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

