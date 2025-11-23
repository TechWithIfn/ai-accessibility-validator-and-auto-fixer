"use client";

import { Book, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function WCAGGuidePage() {
  const levels = [
    {
      level: 'A',
      title: 'Level A - Minimum',
      description: 'Basic accessibility requirements. All websites should meet this level.',
      color: 'red',
      examples: ['Alt text for images', 'Keyboard navigation', 'Form labels']
    },
    {
      level: 'AA',
      title: 'Level AA - Recommended',
      description: 'Enhanced accessibility for most users. Required for most organizations.',
      color: 'yellow',
      examples: ['Color contrast 4.5:1', 'Multiple navigation methods', 'Error identification']
    },
    {
      level: 'AAA',
      title: 'Level AAA - Enhanced',
      description: 'Highest level of accessibility. Ideal for specialized content.',
      color: 'green',
      examples: ['Color contrast 7:1', 'Sign language interpretation', 'Extended audio descriptions']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Book className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">WCAG 2.2 Guide</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Complete guide to Web Content Accessibility Guidelines (WCAG) 2.2 standards and how to achieve compliance.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is WCAG 2.2?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            WCAG 2.2 is the latest version of the Web Content Accessibility Guidelines, published by the W3C. 
            These guidelines help make web content more accessible to people with disabilities, including 
            visual, auditory, physical, speech, cognitive, language, learning, and neurological disabilities.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            WCAG 2.2 builds upon WCAG 2.1 and includes new success criteria for improved accessibility.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compliance Levels</h2>
          <div className="space-y-6">
            {levels.map((level) => (
              <div key={level.level} className={`border-l-4 border-${level.color}-500 pl-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{level.title}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded bg-${level.color}-100 dark:bg-${level.color}-900/30 text-${level.color}-700 dark:text-${level.color}-300`}>
                    Level {level.level}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{level.description}</p>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {level.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Four Principles of Accessibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Perceivable
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Information must be presentable to users in ways they can perceive. This includes providing 
                text alternatives for images and captions for videos.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                Operable
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Interface components must be operable. Users must be able to navigate and interact with all 
                functionality using keyboard or assistive technologies.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                Understandable
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Information and UI operation must be understandable. Content should be readable and 
                predictable, with clear error messages and instructions.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Robust
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Content must be robust enough to be interpreted reliably by a wide variety of user agents, 
                including assistive technologies. Use valid HTML and proper ARIA attributes.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Common Issues & Solutions</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Missing Alt Text</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Images without descriptive alt attributes.</p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs font-mono">
                &lt;img src="photo.jpg" alt="Description of image" /&gt;
              </div>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Low Color Contrast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Text that doesn't meet minimum contrast ratios.</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Solution: Use contrast ratio of at least 4.5:1 for normal text, 3:1 for large text.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Missing Form Labels</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Form inputs without associated labels.</p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs font-mono">
                &lt;label for="email"&gt;Email&lt;/label&gt;<br />
                &lt;input id="email" type="email" /&gt;
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

