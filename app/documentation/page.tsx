"use client";

import { Book, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DocumentationPage() {
  const sections = [
    {
      title: 'Getting Started',
      links: [
        { title: 'Quick Start Guide', href: '/', description: 'Get up and running in minutes' },
        { title: 'Installation', href: '#', description: 'Install and configure the validator' },
        { title: 'First Scan', href: '/scanner', description: 'Run your first accessibility scan' },
      ]
    },
    {
      title: 'Guides',
      links: [
        { title: 'WCAG 2.2 Guide', href: '/wcag-guide', description: 'Complete WCAG compliance guide' },
        { title: 'Accessibility Checklist', href: '/accessibility-checklist', description: 'Comprehensive checklist' },
        { title: 'Best Practices', href: '/best-practices', description: 'Accessibility best practices' },
        { title: 'Compliance Levels', href: '/compliance-levels', description: 'Understanding compliance levels' },
      ]
    },
    {
      title: 'Integrations',
      links: [
        { title: 'API Documentation', href: '/api-documentation', description: 'Complete API reference' },
        { title: 'Browser Extension', href: '/browser-extension', description: 'Chrome/Edge extension guide' },
        { title: 'GitHub Integration', href: '/github-integration', description: 'GitHub Actions setup' },
        { title: 'CI/CD Integration', href: '/cicd-integration', description: 'CI/CD pipeline setup' },
      ]
    },
    {
      title: 'Support',
      links: [
        { title: 'Help Center', href: '/help-center', description: 'FAQs and help articles' },
        { title: 'Contact Us', href: '/contact', description: 'Get in touch with support' },
        { title: 'Status Page', href: '/status', description: 'Service status and uptime' },
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Book className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Documentation</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Complete documentation for the AI Accessibility Validator. Find guides, API references, and integration instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <section key={section.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
            <ul className="space-y-3">
              {section.links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {link.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{link.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

