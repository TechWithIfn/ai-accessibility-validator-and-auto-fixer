"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Calendar, TrendingUp, TrendingDown, AlertCircle, Download, 
  Eye, Search, Filter, MoreVertical, RefreshCw, Trash2, ExternalLink,
  ChevronDown, X, ArrowUpDown, CheckCircle2, Clock, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Enhanced mock data with more details
const mockReports = [
  {
    id: '1',
    url: 'https://example.com',
    domain: 'example.com',
    date: '2024-01-15T10:30:00Z',
    score: 85.5,
    previousScore: 82.0,
    total_issues: 12,
    wcag_level: 'AA',
    severity_breakdown: { high: 3, medium: 6, low: 3 },
    topIssues: [
      { type: 'Missing alt text', count: 5 },
      { type: 'Low contrast', count: 4 },
      { type: 'Missing labels', count: 3 }
    ],
    scanDuration: 45,
    lastScanned: '2 hours ago'
  },
  {
    id: '2',
    url: 'https://demo-site.com',
    domain: 'demo-site.com',
    date: '2024-01-14T14:20:00Z',
    score: 92.0,
    previousScore: 88.5,
    total_issues: 5,
    wcag_level: 'AAA',
    severity_breakdown: { high: 1, medium: 2, low: 2 },
    topIssues: [
      { type: 'Minor contrast', count: 2 },
      { type: 'Heading order', count: 1 },
      { type: 'ARIA labels', count: 2 }
    ],
    scanDuration: 32,
    lastScanned: '1 day ago'
  },
];

type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc' | 'issues-desc' | 'issues-asc' | 'domain-asc';
type FilterSeverity = 'all' | 'high' | 'medium' | 'low';

export default function ReportsPage() {
  const [reports, setReports] = useState(mockReports);
  const [filteredReports, setFilteredReports] = useState(mockReports);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Simulate user authentication (in production, get from auth context)
  const [isAuthenticated] = useState(true);
  const [userId] = useState('user-123'); // In production, get from auth

  useEffect(() => {
    // In production: Fetch reports from API with user authentication
    // const fetchReports = async () => {
    //   setIsLoading(true);
    //   try {
    //     const token = localStorage.getItem('authToken');
    //     const response = await axios.get(`${API_BASE_URL}/reports`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //       params: { userId }
    //     });
    //     setReports(response.data);
    //   } catch (error) {
    //     console.error('Failed to fetch reports:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchReports();
  }, [userId]);

  // Filter and sort reports
  useEffect(() => {
    let filtered = [...reports];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(report => 
        report.severity_breakdown[severityFilter] > 0
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'score-desc':
          return b.score - a.score;
        case 'score-asc':
          return a.score - b.score;
        case 'issues-desc':
          return b.total_issues - a.total_issues;
        case 'issues-asc':
          return a.total_issues - b.total_issues;
        case 'domain-asc':
          return a.domain.localeCompare(b.domain);
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
  }, [reports, searchQuery, sortBy, severityFilter]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', ring: 'ring-green-500/20' };
    if (score >= 70) return { text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', ring: 'ring-yellow-500/20' };
    return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', ring: 'ring-red-500/20' };
  };

  const getScoreTrend = (current: number, previous?: number) => {
    if (!previous) return null;
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-500', text: `+${diff.toFixed(1)}` };
    if (diff < 0) return { icon: TrendingDown, color: 'text-red-500', text: diff.toFixed(1) };
    return null;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleExport = async (reportId: string, format: 'pdf' | 'csv' | 'json') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      alert('Report not found');
      return;
    }

    try {
      if (format === 'json') {
        const jsonData = {
          id: report.id,
          url: report.url,
          domain: report.domain,
          date: report.date,
          lastScanned: formatDate(report.date),
          scanDuration: report.scanDuration,
          score: report.score,
          previousScore: report.previousScore,
          total_issues: report.total_issues,
          wcag_level: report.wcag_level,
          severity_breakdown: report.severity_breakdown,
          topIssues: report.topIssues
        };
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `accessibility-report-${report.domain}-${report.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvRows = [
          ['Field', 'Value'],
          ['Report ID', report.id],
          ['Website URL', report.url],
          ['Domain', report.domain],
          ['Last Scanned', formatDate(report.date)],
          ['Scan Duration (seconds)', report.scanDuration.toString()],
          ['Accessibility Score', report.score.toFixed(1)],
          ['Previous Score', report.previousScore?.toFixed(1) || 'N/A'],
          ['Total Issues', report.total_issues.toString()],
          ['WCAG Level', report.wcag_level],
          ['High Severity Issues', report.severity_breakdown.high.toString()],
          ['Medium Severity Issues', report.severity_breakdown.medium.toString()],
          ['Low Severity Issues', report.severity_breakdown.low.toString()],
          ['', ''],
          ['Top Issues', 'Count']
        ];
        
        report.topIssues.forEach(issue => {
          csvRows.push([issue.type, issue.count.toString()]);
        });

        const csvContent = csvRows.map(row => 
          row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `accessibility-report-${report.domain}-${report.id}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // Create HTML content for PDF
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Accessibility Report - ${report.domain}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                h2 { color: #1e40af; margin-top: 30px; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #555; }
                .score { font-size: 36px; font-weight: bold; color: ${report.score >= 90 ? '#10b981' : report.score >= 70 ? '#f59e0b' : '#ef4444'}; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f3f4f6; font-weight: bold; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <h1>Accessibility Report</h1>
              <div class="info-row">
                <span class="label">Website URL:</span> ${report.url}
              </div>
              <div class="info-row">
                <span class="label">Domain:</span> ${report.domain}
              </div>
              <div class="info-row">
                <span class="label">Last Scanned:</span> ${formatDate(report.date)}
              </div>
              <div class="info-row">
                <span class="label">Scan Duration:</span> ${report.scanDuration}s
              </div>
              
              <h2>Accessibility Score</h2>
              <div class="score">${report.score.toFixed(1)}/100</div>
              ${report.previousScore ? `<p>Previous Score: ${report.previousScore.toFixed(1)} (${report.score > report.previousScore ? 'Improved' : 'Decreased'})</p>` : ''}
              
              <h2>Summary</h2>
              <table>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
                <tr>
                  <td>Total Issues</td>
                  <td>${report.total_issues}</td>
                </tr>
                <tr>
                  <td>WCAG Level</td>
                  <td>${report.wcag_level}</td>
                </tr>
                <tr>
                  <td>High Severity</td>
                  <td>${report.severity_breakdown.high}</td>
                </tr>
                <tr>
                  <td>Medium Severity</td>
                  <td>${report.severity_breakdown.medium}</td>
                </tr>
                <tr>
                  <td>Low Severity</td>
                  <td>${report.severity_breakdown.low}</td>
                </tr>
              </table>
              
              <h2>Top Issues</h2>
              <table>
                <tr>
                  <th>Issue Type</th>
                  <th>Count</th>
                </tr>
                ${report.topIssues.map(issue => `
                  <tr>
                    <td>${issue.type}</td>
                    <td>${issue.count}</td>
                  </tr>
                `).join('')}
              </table>
              
              <div class="footer">
                <p>Generated on ${new Date().toLocaleString()}</p>
                <p>Report ID: ${report.id}</p>
              </div>
            </body>
          </html>
        `;

        // Open in new window and trigger print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 250);
          };
        } else {
          // Fallback: download as HTML file
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `accessibility-report-${report.domain}-${report.id}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    // In production: Call API to delete
    setReports(reports.filter(r => r.id !== reportId));
    setShowMenu(null);
  };

  const handleRescan = async (url: string) => {
    // In production: Trigger new scan
    console.log(`Rescanning ${url}`);
    setShowMenu(null);
  };

  // Empty state for authenticated users with no reports
  if (isAuthenticated && reports.length === 0 && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
            <FileText className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Reports Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start scanning websites to generate your first accessibility report. Get detailed insights and automatic fix suggestions.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <BarChart3 className="w-5 h-5" />
            Run Your First Scan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8">
        <div>
          <h1 id="reports-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Accessibility Reports</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            View and manage your accessibility scan reports
            {filteredReports.length !== reports.length && (
              <span className="ml-2 text-sm text-primary-600 dark:text-primary-400">
                ({filteredReports.length} of {reports.length} shown)
              </span>
            )}
          </p>
        </div>
        <Link
          href="/scanner"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <BarChart3 className="w-5 h-5" />
          New Scan
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4" role="region" aria-labelledby="reports-heading">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by domain or report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Search reports"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex gap-2">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                showFilters || severityFilter !== 'all'
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
              aria-label="Toggle filters"
              aria-pressed={showFilters || severityFilter !== 'all'}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(severityFilter !== 'all') && (
                <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                aria-label="Sort reports"
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
                <option value="issues-desc">Most Issues</option>
                <option value="issues-asc">Fewest Issues</option>
                <option value="domain-asc">Domain A-Z</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Filter severity">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2">Severity:</span>
              {(['all', 'high', 'medium', 'low'] as FilterSeverity[]).map((severity) => (
                <button
                  key={severity}
                  onClick={() => setSeverityFilter(severity)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    severityFilter === severity
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-pressed={severityFilter === severity}
                >
                  {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Reports Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const scoreColors = getScoreColor(report.score);
            const trend = getScoreTrend(report.score, report.previousScore);
            const TrendIcon = trend?.icon;

            return (
              <div
                key={report.id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 transform hover:-translate-y-1 relative"
              >
                {/* Menu Button */}
                <div className="absolute top-4 right-4">
                  <button
                    id={`report-menu-button-${report.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === report.id ? null : report.id);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="More options"
                    aria-expanded={showMenu === report.id}
                    aria-controls={showMenu === report.id ? `report-menu-${report.id}` : undefined}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  {showMenu === report.id && (
                    <div id={`report-menu-${report.id}`} role="menu" aria-labelledby={`report-menu-button-${report.id}`} className="absolute right-0 top-12 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      <button
                        role="menuitem"
                        onClick={() => handleRescan(report.url)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Re-Scan
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => setSelectedReport(report)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Report
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        role="menuitem"
                        onClick={() => handleDelete(report.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Report
                      </button>
                    </div>
                  )}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {report.domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${scoreColors.bg} ${scoreColors.text}`}>
                          WCAG {report.wcag_level}
                        </span>
                        {trend && TrendIcon && (
                          <span className={`flex items-center gap-1 text-xs font-medium ${trend.color}`}>
                            <TrendIcon className="w-3 h-3" />
                            {trend.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score with Progress Ring */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Accessibility Score</span>
                    <span className={`text-3xl font-bold ${scoreColors.text}`}>
                      {report.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" aria-hidden="true">
                    <div
                      className={`h-full ${scoreColors.bg} transition-all duration-500`}
                      style={{ width: `${report.score}%` }}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(report.score)}
                      aria-label={`Accessibility score ${report.score.toFixed(1)} out of 100`}
                    ></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" aria-label={`High severity issues: ${report.severity_breakdown.high}`}>
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{report.severity_breakdown.high}</div>
                    <div className="text-xs text-red-700 dark:text-red-300 mt-1">High</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" aria-label={`Medium severity issues: ${report.severity_breakdown.medium}`}>
                    <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{report.severity_breakdown.medium}</div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Medium</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" aria-label={`Low severity issues: ${report.severity_breakdown.low}`}>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{report.severity_breakdown.low}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">Low</div>
                  </div>
                </div>

                {/* Top Issues Preview */}
                {report.topIssues && report.topIssues.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Top Issues:</div>
                    <ul className="space-y-1" aria-label={`Top issues for ${report.domain}`}>
                      {report.topIssues.slice(0, 3).map((issue, idx) => (
                        <li key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300 truncate">{issue.type}</span>
                          <span className="text-gray-500 dark:text-gray-400 font-medium ml-2">{issue.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(report.date)}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {report.total_issues} {report.total_issues === 1 ? 'issue' : 'issues'}
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedReport(report)}
                  className="mt-4 w-full py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center gap-2"
                  aria-label={`View details for ${report.domain}`}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty Search Results */}
      {!isLoading && filteredReports.length === 0 && reports.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Reports Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSeverityFilter('all');
            }}
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setSelectedReport(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setSelectedReport(null); }}
          role="presentation"
          tabIndex={-1}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            aria-describedby={`report-modal-desc-${selectedReport.id}`}
            tabIndex={0}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 id="report-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div id={`report-modal-desc-${selectedReport.id}`} className="sr-only">Report for {selectedReport.domain}, scanned {formatRelativeTime(selectedReport.date)}, score {selectedReport.score.toFixed(1)} out of 100.</div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Website URL</p>
                <a
                  href={selectedReport.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                >
                  {selectedReport.url}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Scanned</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedReport.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Scan Duration</p>
                  <p className="text-gray-900 dark:text-white">{selectedReport.scanDuration}s</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Accessibility Score</p>
                <div className={`text-4xl font-bold ${getScoreColor(selectedReport.score).text} mb-2`}>
                  {selectedReport.score.toFixed(1)}/100
                </div>
                {(() => {
                  const modalTrend = getScoreTrend(selectedReport.score, selectedReport.previousScore);
                  const ModalTrendIcon = modalTrend?.icon;
                  return modalTrend && ModalTrendIcon && (
                    <div className={`flex items-center gap-2 text-sm ${modalTrend.color}`}>
                      <ModalTrendIcon className="w-4 h-4" />
                      <span>Score {parseFloat(modalTrend.text) > 0 ? 'improved' : 'decreased'} from previous scan</span>
                    </div>
                  );
                })()}
              </div>
              
              {/* Additional Details */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{selectedReport.severity_breakdown.high}</div>
                  <div className="text-xs text-red-700 dark:text-red-300 mt-1">High Severity</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedReport.severity_breakdown.medium}</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Medium Severity</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedReport.severity_breakdown.low}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">Low Severity</div>
                </div>
              </div>

              {selectedReport.topIssues && selectedReport.topIssues.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Top Issues</p>
                  <div className="space-y-2">
                    {selectedReport.topIssues.map((issue: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{issue.type}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{issue.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleExport(selectedReport.id, 'pdf')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport(selectedReport.id, 'csv')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport(selectedReport.id, 'json')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
                <Link
                  href={`/compare?report=${selectedReport.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Compare
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
