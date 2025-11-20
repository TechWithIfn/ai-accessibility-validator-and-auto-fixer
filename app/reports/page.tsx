"use client";

import { useState, useEffect } from 'react';
import { FileText, Calendar, TrendingUp, AlertCircle, Download, Eye } from 'lucide-react';
import Link from 'next/link';

// Mock data - in production, fetch from API
const mockReports = [
  {
    id: '1',
    url: 'https://example.com',
    date: '2024-01-15',
    score: 85.5,
    total_issues: 12,
    wcag_level: 'AA',
    severity_breakdown: { high: 3, medium: 6, low: 3 },
  },
  {
    id: '2',
    url: 'https://demo-site.com',
    date: '2024-01-14',
    score: 92.0,
    total_issues: 5,
    wcag_level: 'AAA',
    severity_breakdown: { high: 1, medium: 2, low: 2 },
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState(mockReports);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    // In production: Fetch reports from API
    // const fetchReports = async () => {
    //   const response = await axios.get(`${API_BASE_URL}/reports`);
    //   setReports(response.data);
    // };
    // fetchReports();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accessibility Reports</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">View and manage your accessibility scan reports</p>
        </div>
        <Link
          href="/scanner"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          New Scan
        </Link>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start justify-between mb-4">
              <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
                {report.wcag_level}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{report.url}</h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
              {new Date(report.date).toLocaleDateString()}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Issues</span>
                <span className="font-semibold text-gray-900 dark:text-white">{report.total_issues}</span>
              </div>
              <div className="flex space-x-2 mt-2">
                <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                  {report.severity_breakdown.high} High
                </span>
                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                  {report.severity_breakdown.medium} Medium
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {report.severity_breakdown.low} Low
                </span>
              </div>
            </div>
            <button className="mt-4 w-full text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium flex items-center justify-center">
              View Details
              <Eye className="w-4 h-4 ml-1" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Reports Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Start by scanning a website to generate your first accessibility report.</p>
          <Link
            href="/scanner"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Scan a Website
          </Link>
        </div>
      )}

      {/* Report Detail Modal (simplified) */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedReport(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">URL</p>
                <p className="text-gray-900 dark:text-white font-medium">{selectedReport.url}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                <p className="text-gray-900 dark:text-white font-medium">{new Date(selectedReport.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accessibility Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(selectedReport.score)}`}>
                  {selectedReport.score.toFixed(1)}/100
                </p>
              </div>
              <div className="flex space-x-4">
                <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Download PDF
                </button>
                <Link
                  href={`/compare?report=${selectedReport.id}`}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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

