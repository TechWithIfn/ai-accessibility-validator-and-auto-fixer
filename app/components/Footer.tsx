"use client";

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Integrations & Tools',
      links: [
        { title: 'API Documentation', href: '/api-documentation' },
        { title: 'Browser Extension', href: '/browser-extension' },
        { title: 'GitHub Integration', href: '/github-integration' },
        { title: 'CI/CD Integration', href: '/cicd-integration' },
      ]
    },
    {
      title: 'Accessibility & Best Practices',
      links: [
        { title: 'WCAG 2.2 Guide', href: '/wcag-guide' },
        { title: 'Accessibility Checklist', href: '/accessibility-checklist' },
        { title: 'Best Practices', href: '/best-practices' },
        { title: 'Compliance Levels', href: '/compliance-levels' },
      ]
    },
    {
      title: 'Support & Resources',
      links: [
        { title: 'Help Center', href: '/help-center' },
        { title: 'Contact Us', href: '/contact' },
        { title: 'Documentation', href: '/documentation' },
        { title: 'Status Page', href: '/status' },
      ]
    }
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold gradient-text dark:gradient-text-dark mb-4">
              AI Accessibility Validator
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Making the web accessible for everyone with AI-powered scanning and automatic fixes.
            </p>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group"
                    >
                      {link.title}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} AI Accessibility Validator. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

