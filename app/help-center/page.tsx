"use client";

import { HelpCircle, Search, Book, MessageCircle, Video } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      icon: Book,
      articles: [
        { title: 'How to scan your first website', href: '#' },
        { title: 'Understanding accessibility scores', href: '#' },
        { title: 'Setting up your account', href: '#' },
      ]
    },
    {
      title: 'Browser Extension',
      icon: MessageCircle,
      articles: [
        { title: 'Installing the extension', href: '/browser-extension' },
        { title: 'Troubleshooting extension issues', href: '#' },
        { title: 'Using the extension effectively', href: '#' },
      ]
    },
    {
      title: 'API & Integrations',
      icon: Video,
      articles: [
        { title: 'API documentation', href: '/api-documentation' },
        { title: 'GitHub integration guide', href: '/github-integration' },
        { title: 'CI/CD setup', href: '/cicd-integration' },
      ]
    },
  ];

  const faqs = [
    {
      question: 'How accurate are the accessibility scans?',
      answer: 'Our scans use advanced AI and follow WCAG 2.2 guidelines. While automated scans catch most issues, we recommend manual testing for comprehensive accessibility.'
    },
    {
      question: 'Can I scan password-protected websites?',
      answer: 'Yes, you can provide authentication credentials in the scanner settings for protected sites.'
    },
    {
      question: 'How often should I scan my website?',
      answer: 'We recommend scanning after major updates or at least monthly. For active development, consider integrating into your CI/CD pipeline.'
    },
    {
      question: 'What does the accessibility score mean?',
      answer: 'The score (0-100) reflects overall accessibility compliance. 90+ is excellent, 70-89 is good, and below 70 needs improvement.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Help Center</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Find answers to common questions and learn how to use the AI Accessibility Validator.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <section key={category.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {category.title}
              </h2>
              <ul className="space-y-2">
                {category.articles.map((article, idx) => (
                  <li key={idx}>
                    <Link href={article.href} className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2">
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* FAQs */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800 mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Still need help?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Contact Support
        </Link>
      </section>
    </div>
  );
}

