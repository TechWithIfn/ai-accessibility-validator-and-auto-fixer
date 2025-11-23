"use client";

import { CheckSquare, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function AccessibilityChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('a11y-checklist');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const categories = [
    {
      title: 'Images & Media',
      items: [
        { id: 'alt-text', text: 'All images have descriptive alt text', level: 'A' },
        { id: 'decorative', text: 'Decorative images have empty alt=""', level: 'A' },
        { id: 'video-captions', text: 'Videos have captions or transcripts', level: 'A' },
        { id: 'audio-transcripts', text: 'Audio content has transcripts', level: 'A' },
      ]
    },
    {
      title: 'Color & Contrast',
      items: [
        { id: 'contrast-text', text: 'Text meets 4.5:1 contrast ratio (AA)', level: 'AA' },
        { id: 'contrast-large', text: 'Large text meets 3:1 contrast ratio', level: 'AA' },
        { id: 'color-alone', text: 'Color is not the only means of conveying information', level: 'A' },
        { id: 'focus-visible', text: 'Focus indicators are clearly visible', level: 'AA' },
      ]
    },
    {
      title: 'Navigation & Structure',
      items: [
        { id: 'keyboard-nav', text: 'All functionality is keyboard accessible', level: 'A' },
        { id: 'skip-links', text: 'Skip navigation links are provided', level: 'A' },
        { id: 'heading-hierarchy', text: 'Proper heading hierarchy (h1-h6)', level: 'A' },
        { id: 'page-titles', text: 'Each page has a descriptive title', level: 'A' },
        { id: 'focus-order', text: 'Focus order is logical and intuitive', level: 'A' },
      ]
    },
    {
      title: 'Forms & Inputs',
      items: [
        { id: 'form-labels', text: 'All form inputs have associated labels', level: 'A' },
        { id: 'error-messages', text: 'Error messages are clear and helpful', level: 'A' },
        { id: 'required-fields', text: 'Required fields are clearly marked', level: 'A' },
        { id: 'input-types', text: 'Appropriate input types are used', level: 'A' },
      ]
    },
    {
      title: 'Content & Language',
      items: [
        { id: 'lang-attribute', text: 'HTML lang attribute is specified', level: 'A' },
        { id: 'language-changes', text: 'Language changes are marked with lang attribute', level: 'AA' },
        { id: 'abbreviations', text: 'Abbreviations are explained on first use', level: 'AAA' },
      ]
    },
    {
      title: 'ARIA & Semantics',
      items: [
        { id: 'semantic-html', text: 'Semantic HTML elements are used correctly', level: 'A' },
        { id: 'aria-labels', text: 'ARIA labels are used when needed', level: 'A' },
        { id: 'aria-roles', text: 'ARIA roles are used appropriately', level: 'A' },
        { id: 'aria-live', text: 'Dynamic content uses aria-live regions', level: 'AA' },
      ]
    },
  ];

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      // Save to localStorage in real-time
      if (typeof window !== 'undefined') {
        localStorage.setItem('a11y-checklist', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const percentage = Math.round((checkedCount / totalItems) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Accessibility Checklist</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Comprehensive checklist to ensure your website meets WCAG 2.2 accessibility standards.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progress</h2>
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {checkedCount} of {totalItems} items completed
        </p>
      </div>

      {/* Checklist Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          <section key={category.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{category.title}</h2>
            <div className="space-y-3">
              {category.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked[item.id] || false}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900 dark:text-white">{item.text}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                        item.level === 'A' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        item.level === 'AA' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {item.level}
                      </span>
                    </div>
                  </div>
                  {checked[item.id] ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

