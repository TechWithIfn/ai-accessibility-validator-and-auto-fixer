"use client";

import { GitBranch, CheckCircle, Zap, Settings } from 'lucide-react';

export default function CICDIntegrationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">CI/CD Integration</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Integrate accessibility scanning into your CI/CD pipeline. Catch issues before they reach production.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Supported Platforms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Travis CI', 'Azure DevOps'].map((platform) => (
              <div key={platform} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{platform}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Start</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">GitHub Actions Example</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
{`- name: Accessibility Scan
  uses: a11y-validator/action@v1
  with:
    api-key: \${{ secrets.A11Y_API_KEY }}
    url: \${{ env.DEPLOYMENT_URL }}
    fail-on-errors: true`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">GitLab CI Example</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
{`a11y-scan:
  image: node:18
  script:
    - npm install -g @a11y-validator/cli
    - a11y-scan --url \$CI_ENVIRONMENT_URL
      --api-key \$A11Y_API_KEY
      --fail-on-errors`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Configuration Options</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">fail-on-errors</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Fail the build if accessibility issues are found (default: false)</p>
            </div>
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">min-score</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Minimum accessibility score required (0-100)</p>
            </div>
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">wcag-level</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Required WCAG compliance level (A, AA, or AAA)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

