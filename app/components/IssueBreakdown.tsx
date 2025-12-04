"use client";

import { useState, useMemo } from 'react';
import { 
  AlertCircle, ChevronDown, ChevronUp, ExternalLink, 
  Code, MapPin, Hash, Eye, Copy, Check
} from 'lucide-react';

interface Issue {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  wcag_level: string;
  wcag_rule?: string;
  message: string;
  description: string;
  selector?: string;
  xpath?: string;
  occurrences?: number;
  fix_suggestion?: string;
  original_code?: string;
}

interface IssueBreakdownProps {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  onFixRequest?: (issue: Issue) => void;
}

const severityColors = {
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-300 dark:border-red-700', badge: 'bg-red-500' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700', badge: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700', badge: 'bg-yellow-500' },
  low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700', badge: 'bg-blue-500' },
};

const wcagCategories = {
  'Perceivable': ['missing_alt_text', 'low_contrast', 'small_text', 'missing_captions', 'images_with_text'],
  'Operable': ['keyboard_trap', 'no_focus_indicator', 'wrong_tab_order', 'no_skip_navigation'],
  'Understandable': ['missing_labels', 'placeholder_instead_of_label', 'inconsistent_form_structure', 'wrong_aria_roles', 'inconsistent_heading_structure'],
  'Robust': ['wrong_aria_attributes', 'invalid_html', 'missing_landmarks'],
};

export default function IssueBreakdown({ issues, onIssueClick, onFixRequest }: IssueBreakdownProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categorizedIssues = useMemo(() => {
    const categorized: Record<string, Issue[]> = {
      'Perceivable': [],
      'Operable': [],
      'Understandable': [],
      'Robust': [],
      'Other': [],
    };

    issues.forEach(issue => {
      let found = false;
      for (const [category, types] of Object.entries(wcagCategories)) {
        if (types.some(type => issue.type?.toLowerCase().includes(type.replace(/_/g, ' ')))) {
          categorized[category].push(issue);
          found = true;
          break;
        }
      }
      if (!found) {
        categorized['Other'].push(issue);
      }
    });

    return categorized;
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

  const copyToClipboard = async (text: string, issueId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(issueId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSeverityInfo = (severity: string) => {
    return severityColors[severity as keyof typeof severityColors] || severityColors.medium;
  };

  const filteredIssues = selectedCategory 
    ? categorizedIssues[selectedCategory] || []
    : issues;

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Issues ({issues.length})
        </button>
        {Object.entries(categorizedIssues).map(([category, categoryIssues]) => {
          if (categoryIssues.length === 0) return null;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category} ({categoryIssues.length})
            </button>
          );
        })}
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 glass rounded-[14px]">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No issues found in this category!</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const severityInfo = getSeverityInfo(issue.severity);
            const isExpanded = expandedIssues.has(issue.id);
            const occurrences = issue.occurrences || 1;

            return (
              <div
                key={issue.id}
                className={`glass rounded-[14px] p-6 border-l-4 ${severityInfo.border} transition-all duration-200 hover:shadow-lg animate-in fade-in`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${severityInfo.badge}`} />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {issue.message || issue.type}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityInfo.bg} ${severityInfo.text}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {issue.wcag_rule && (
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-4 h-4" />
                          <span>WCAG {issue.wcag_rule} ({issue.wcag_level})</span>
                        </div>
                      )}
                      {occurrences > 1 && (
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          <span>{occurrences} occurrences</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {issue.description}
                    </p>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-in fade-in">
                        {issue.selector && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5" />
                                CSS Selector
                              </label>
                              <button
                                onClick={() => copyToClipboard(issue.selector!, issue.id + '-selector')}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                              >
                                {copiedId === issue.id + '-selector' ? (
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
                            <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-900 dark:text-white break-all">
                              {issue.selector}
                            </code>
                          </div>
                        )}

                        {issue.xpath && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                XPath
                              </label>
                              <button
                                onClick={() => copyToClipboard(issue.xpath!, issue.id + '-xpath')}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                              >
                                {copiedId === issue.id + '-xpath' ? (
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
                            <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-900 dark:text-white break-all">
                              {issue.xpath}
                            </code>
                          </div>
                        )}

                        {issue.fix_suggestion && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                              Fix Suggestion:
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {issue.fix_suggestion}
                            </p>
                          </div>
                        )}

                        {issue.original_code && (
                          <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                              Original Code:
                            </label>
                            <pre className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-900 dark:text-white overflow-x-auto">
                              {issue.original_code}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleIssue(issue.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={isExpanded ? 'Collapse issue' : 'Expand issue'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {onIssueClick && (
                      <button
                        onClick={() => onIssueClick(issue)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Highlight issue on page"
                      >
                        <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </button>
                    )}
                  </div>
                </div>

                {onFixRequest && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => onFixRequest(issue)}
                      className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-primary-700 hover:to-accent-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                    >
                      <Code className="w-4 h-4" />
                      Fix with AI
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

