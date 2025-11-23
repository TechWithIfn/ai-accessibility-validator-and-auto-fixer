"use client";

import { Chrome, Download, CheckCircle, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export default function BrowserExtensionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Chrome className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Browser Extension</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Scan any webpage instantly with our Chrome and Edge browser extension. Get real-time accessibility insights without leaving your browser.
        </p>
      </div>

      <div className="space-y-8">
        {/* Features */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">One-Click Scanning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Scan any webpage with a single click from your browser toolbar.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-Time Results</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">View accessibility issues directly on the page with visual highlights.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Auto-Fix Suggestions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get AI-powered code fixes with explanations for each issue.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Issue Highlighting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">See exactly which elements have accessibility problems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Installation */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Download className="w-6 h-6" />
            Installation
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Chrome / Edge</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                <li>Open Chrome and navigate to <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">chrome://extensions/</code></li>
                <li>Enable "Developer mode" (toggle in top right)</li>
                <li>Click "Load unpacked"</li>
                <li>Select the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">extension</code> folder from this project</li>
                <li>The extension icon will appear in your toolbar</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Make sure the backend server is running at <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">http://localhost:8000</code> for the extension to work.
              </p>
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Use</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Navigate to a Website</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Visit any website you want to scan for accessibility issues.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Click the Extension Icon</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Click the AI Accessibility Validator icon in your browser toolbar.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Click "Scan This Page"</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">The extension will analyze the current page for accessibility issues.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Results</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">A sidebar will appear showing all detected issues with severity levels and fix suggestions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Privacy & Security
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your privacy is important to us. The extension:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Only scans pages when you explicitly click "Scan This Page"</li>
            <li>Does not collect or store personal information</li>
            <li>Processes data locally or through your configured backend</li>
            <li>Does not track your browsing history</li>
            <li>Uses secure connections for all API calls</li>
          </ul>
        </section>

        {/* Troubleshooting */}
        <section className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Troubleshooting</h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong>Extension not working?</strong> Make sure the backend server is running.
            </div>
            <div>
              <strong>No results showing?</strong> Check that the page has finished loading before scanning.
            </div>
            <div>
              <strong>Connection errors?</strong> Verify the backend URL in extension settings matches your server.
            </div>
          </div>
          <Link href="/help-center" className="inline-block mt-4 text-primary-600 dark:text-primary-400 hover:underline">
            Visit Help Center →
          </Link>
        </section>
      </div>
    </div>
  );
}

