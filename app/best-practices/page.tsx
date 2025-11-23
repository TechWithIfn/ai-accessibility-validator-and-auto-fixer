"use client";

import { Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

export default function BestPracticesPage() {
  const practices = [
    {
      category: 'Design',
      items: [
        'Use sufficient color contrast (4.5:1 for normal text, 3:1 for large text)',
        'Don\'t rely solely on color to convey information',
        'Ensure interactive elements are large enough (minimum 44x44px)',
        'Provide clear visual focus indicators',
        'Use consistent navigation and layout patterns'
      ]
    },
    {
      category: 'Content',
      items: [
        'Write clear, concise, and simple language',
        'Use headings to organize content hierarchically',
        'Provide text alternatives for all images',
        'Use descriptive link text (avoid "click here")',
        'Include captions and transcripts for multimedia'
      ]
    },
    {
      category: 'Development',
      items: [
        'Use semantic HTML elements (nav, main, article, etc.)',
        'Ensure proper form labeling and error handling',
        'Implement keyboard navigation for all functionality',
        'Use ARIA attributes appropriately and sparingly',
        'Test with screen readers and keyboard-only navigation'
      ]
    },
    {
      category: 'Testing',
      items: [
        'Test with multiple browsers and assistive technologies',
        'Use automated tools alongside manual testing',
        'Involve users with disabilities in testing',
        'Test keyboard navigation throughout the site',
        'Verify color contrast with tools like WebAIM Contrast Checker'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Best Practices</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Essential accessibility best practices to create inclusive and usable websites for everyone.
        </p>
      </div>

      <div className="space-y-8">
        {practices.map((practice) => (
          <section key={practice.category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{practice.category}</h2>
            <ul className="space-y-3">
              {practice.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Remember</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Accessibility is not a one-time task but an ongoing process. Regularly audit your website, 
            gather feedback from users, and stay updated with WCAG guidelines and best practices.
          </p>
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-medium">
            <ArrowRight className="w-5 h-5" />
            <span>Start with Level A, then work towards AA compliance</span>
          </div>
        </section>
      </div>
    </div>
  );
}

