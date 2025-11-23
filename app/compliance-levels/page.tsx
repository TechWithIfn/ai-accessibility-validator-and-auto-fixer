"use client";

import { Award, Target, TrendingUp } from 'lucide-react';

export default function ComplianceLevelsPage() {
  const levels = [
    {
      level: 'A',
      title: 'Level A - Minimum Compliance',
      score: '70-79',
      description: 'Basic accessibility requirements that all websites should meet.',
      requirements: [
        'Alt text for images',
        'Keyboard navigation',
        'Form labels',
        'Page titles',
        'Language declaration'
      ],
      color: 'red',
      badge: 'Basic'
    },
    {
      level: 'AA',
      title: 'Level AA - Recommended Compliance',
      score: '80-89',
      description: 'Enhanced accessibility for most users. Required for most organizations and government websites.',
      requirements: [
        'Color contrast 4.5:1',
        'Multiple navigation methods',
        'Error identification',
        'Consistent navigation',
        'Focus indicators'
      ],
      color: 'yellow',
      badge: 'Standard'
    },
    {
      level: 'AAA',
      title: 'Level AAA - Enhanced Compliance',
      score: '90-100',
      description: 'Highest level of accessibility. Ideal for specialized content and maximum inclusivity.',
      requirements: [
        'Color contrast 7:1',
        'Sign language interpretation',
        'Extended audio descriptions',
        'No timing constraints',
        'Context-sensitive help'
      ],
      color: 'green',
      badge: 'Premium'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Compliance Levels</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Understand the different WCAG compliance levels and what they mean for your website.
        </p>
      </div>

      <div className="space-y-6">
        {levels.map((level) => (
          <section key={level.level} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-${level.color}-200 dark:border-${level.color}-800 p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{level.title}</h2>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full bg-${level.color}-100 dark:bg-${level.color}-900/30 text-${level.color}-700 dark:text-${level.color}-300`}>
                    {level.badge}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{level.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Typical Score Range: <strong>{level.score}</strong></span>
                </div>
              </div>
              <div className={`w-16 h-16 rounded-full bg-${level.color}-100 dark:bg-${level.color}-900/30 flex items-center justify-center`}>
                <span className={`text-2xl font-bold text-${level.color}-700 dark:text-${level.color}-300`}>
                  {level.level}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Requirements:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {level.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${level.color}-500`} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Which Level Should You Target?</h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p><strong>Level A:</strong> Start here for all websites. This is the minimum standard.</p>
            <p><strong>Level AA:</strong> Recommended for most websites. Required for government and public sector sites in many countries.</p>
            <p><strong>Level AAA:</strong> Aim for this for specialized content or when maximum accessibility is required. Note that not all content can meet AAA standards.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

