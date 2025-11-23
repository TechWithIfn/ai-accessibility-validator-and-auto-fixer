"use client";

import { Github, GitBranch, CheckCircle, Zap, Code } from 'lucide-react';

export default function GitHubIntegrationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Github className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">GitHub Integration</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Automatically scan your repositories for accessibility issues with GitHub Actions and pull request checks.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Our GitHub integration allows you to automatically check accessibility compliance on every pull request, 
            commit, or scheduled scan. Get detailed reports directly in your GitHub workflow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <GitBranch className="w-8 h-8 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">PR Checks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Automatic checks on pull requests</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Status Checks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Block merges if issues found</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Fast Scans</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Quick analysis in CI/CD</p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Setup Instructions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Install GitHub App</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Go to GitHub Settings → Integrations</li>
                <li>Click &quot;Install GitHub App&quot;</li>
                <li>Select repositories to enable</li>
                <li>Authorize the installation</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Add GitHub Action</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">Create <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">.github/workflows/a11y-check.yml</code>:</p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
{`name: Accessibility Check

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main ]

jobs:
  a11y-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Accessibility Scan
        uses: a11y-validator/github-action@v1
        with:
          api-key: \$\{\{ secrets.A11Y_API_KEY \}\}
          fail-on-errors: true`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Add API Key Secret</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Go to Repository Settings → Secrets → Actions</li>
                <li>Click &quot;New repository secret&quot;</li>
                <li>Name: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">A11Y_API_KEY</code></li>
                <li>Value: Your API key from the dashboard</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Automatic PR Checks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Every pull request is automatically scanned for accessibility issues.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Status Checks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Block merges if critical accessibility issues are detected.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Comment Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Detailed reports posted as PR comments with fix suggestions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Diff Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Only scan changed files to save time and resources.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

