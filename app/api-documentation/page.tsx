"use client";

import { Code, Book, Zap, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

export default function APIDocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Complete API reference for integrating the AI Accessibility Validator into your applications.
        </p>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Our RESTful API allows you to programmatically scan websites, retrieve accessibility reports, 
            and generate automatic fixes. All endpoints use JSON for requests and responses.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
              Base URL: <code className="text-primary-600 dark:text-primary-400">http://localhost:8000</code>
            </p>
          </div>
        </section>

        {/* Authentication */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Most endpoints require authentication using Bearer tokens. Include your API key in the Authorization header:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100">
{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}
            </pre>
          </div>
        </section>

        {/* Endpoints */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">API Endpoints</h2>
          
          <div className="space-y-6">
            {/* Scan URL */}
            <div className="border-l-4 border-primary-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-mono rounded">POST</span>
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/scan-url</code>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Scan Website URL</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Scans a website URL for accessibility issues and returns a comprehensive report.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Request Body:</p>
                <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
{`{
  "url": "https://example.com"
}`}
                </pre>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Response:</p>
                <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
{`{
  "success": true,
  "url": "https://example.com",
  "issues": [...],
  "total_issues": 12,
  "wcag_level": "AA",
  "score": 85.5
}`}
                </pre>
              </div>
            </div>

            {/* Scan HTML */}
            <div className="border-l-4 border-primary-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-mono rounded">POST</span>
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/scan-html</code>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Scan Raw HTML</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Scans raw HTML, CSS, and JavaScript content for accessibility issues.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
{`{
  "html": "<html>...</html>",
  "css": "/* CSS */",
  "js": "// JavaScript"
}`}
                </pre>
              </div>
            </div>

            {/* Auto Fix */}
            <div className="border-l-4 border-primary-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-mono rounded">POST</span>
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/auto-fix</code>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Generate Automatic Fix</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Generates an automatic code fix for a specific accessibility issue with AI-powered explanations.
              </p>
            </div>

            {/* Health Check */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-mono rounded">GET</span>
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/health</code>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Health Check</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Returns the health status of the API service.
              </p>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Rate Limits
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            API requests are rate-limited to ensure fair usage:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Free tier: 100 requests per hour</li>
            <li>Pro tier: 1,000 requests per hour</li>
            <li>Enterprise: Custom limits</li>
          </ul>
        </section>

        {/* SDKs */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Book className="w-6 h-6" />
            SDKs & Libraries
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Official SDKs are available for popular programming languages:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">JavaScript/TypeScript</h3>
              <code className="text-sm text-gray-700 dark:text-gray-300">npm install @a11y-validator/sdk</code>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Python</h3>
              <code className="text-sm text-gray-700 dark:text-gray-300">pip install a11y-validator</code>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Check out our <Link href="/help-center" className="text-primary-600 dark:text-primary-400 hover:underline">Help Center</Link> or 
            <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline ml-1">contact support</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

