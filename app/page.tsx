import Link from 'next/link';
import { Scan, Upload, Code, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          AI Web Accessibility Validator & Auto-Fixer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Scan any website, detect WCAG 2.2 compliance issues, and automatically generate fixes with AI-powered explanations.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <FeatureCard
          icon={Scan}
          title="Scan Any URL"
          description="Scan any website URL for accessibility issues. Get comprehensive WCAG 2.2 compliance reports."
        />
        <FeatureCard
          icon={Upload}
          title="Upload HTML Files"
          description="Upload HTML, CSS, and JS files directly. Get instant feedback on accessibility issues."
        />
        <FeatureCard
          icon={Code}
          title="Auto-Generated Fixes"
          description="AI-powered automatic code fixes with detailed explanations for each accessibility issue."
        />
        <FeatureCard
          icon={Shield}
          title="WCAG 2.2 Compliant"
          description="Comprehensive checks for WCAG 2.2 Level A, AA, and AAA compliance standards."
        />
        <FeatureCard
          icon={Zap}
          title="Real-Time Analysis"
          description="Fast, real-time accessibility analysis with color contrast, ARIA, and keyboard navigation checks."
        />
        <FeatureCard
          icon={TrendingUp}
          title="Accessibility Scoring"
          description="Get detailed accessibility scores and track improvements over time."
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/scanner"
            className="flex items-center justify-center px-6 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Scan className="w-5 h-5 mr-2" aria-hidden="true" />
            Scan a Website URL
          </Link>
          <Link
            href="/reports"
            className="flex items-center justify-center px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Upload className="w-5 h-5 mr-2" aria-hidden="true" />
            View Previous Reports
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">How It Works</h2>
        <div className="space-y-4">
          <Step number={1} title="Scan" description="Enter a website URL or upload HTML/CSS/JS files. Our AI engine analyzes the content." />
          <Step number={2} title="Detect" description="Comprehensive detection of accessibility issues including contrast, ARIA, keyboard navigation, and more." />
          <Step number={3} title="Fix" description="Automatic code fixes are generated with explanations. Review and apply fixes with one click." />
          <Step number={4} title="Improve" description="Track your accessibility score over time and ensure WCAG 2.2 compliance." />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <Icon className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-4" aria-hidden="true" />
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}

