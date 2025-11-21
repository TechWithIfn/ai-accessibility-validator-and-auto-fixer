"use client";

import { memo } from 'react';
import Link from 'next/link';
import { Scan, Upload, Code, TrendingUp, Shield, Zap, Globe, FileUp, Sparkles, CheckCircle2, ArrowRight, Download, Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-hero opacity-10 dark:opacity-20"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-6 sm:space-y-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-strong text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>⚡ AI-powered web scanning</span>
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display leading-tight px-2"
            >
              <span className="gradient-text dark:gradient-text-dark">
                AI Web Accessibility
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Validator & Auto-Fixer
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4"
            >
              Scan any website, detect WCAG 2.2 compliance issues, and automatically generate fixes with AI-powered explanations.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 px-4 w-full sm:w-auto"
            >
              <Link
                href="/scanner"
                className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-hero text-white rounded-xl font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Start accessibility scan"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Scan className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  <span>Start Scan</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </Link>
              
              <Link
                href="/reports"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 glass-strong border-2 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400 rounded-xl font-semibold text-base sm:text-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Upload files for accessibility validation"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  <span>Upload Files</span>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-3 sm:mb-4 text-gray-900 dark:text-white px-4">
              Powerful Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Everything you need to ensure your website is accessible and compliant
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={Globe}
              title="Scan Any Website"
              description="Quickly scan any website URL for accessibility issues."
              color="blue"
              delay={0.1}
            />
            <FeatureCard
              icon={FileUp}
              title="Upload & Validate"
              description="Upload HTML, CSS, and JS files for instant validation."
              color="purple"
              delay={0.2}
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Auto-Fix"
              description="Automatically generate fixes with AI-powered explanations."
              color="green"
              delay={0.3}
            />
            <FeatureCard
              icon={Shield}
              title="WCAG 2.2 Check"
              description="Comprehensive checks for Level A, AA, and AAA compliance."
              color="yellow"
              delay={0.4}
            />
            <FeatureCard
              icon={Zap}
              title="Real-Time Analysis"
              description="Fast, real-time accessibility analysis with detailed reports."
              color="pink"
              delay={0.5}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Accessibility Score"
              description="Track your accessibility score and improvements over time."
              color="blue"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-3 sm:mb-4 text-gray-900 dark:text-white px-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Simple, powerful workflow to make your website accessible
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            {[
              { number: 1, icon: Globe, title: "Enter URL / Upload Files", description: "Provide your website URL or upload HTML/CSS/JS files" },
              { number: 2, icon: Zap, title: "AI Scans the Page", description: "Our AI engine analyzes your content thoroughly" },
              { number: 3, icon: Shield, title: "WCAG Issues Detected", description: "Comprehensive detection of accessibility issues" },
              { number: 4, icon: Sparkles, title: "Instant Auto-Fix Suggestions", description: "Get AI-powered fix suggestions instantly" },
              { number: 5, icon: Download, title: "Download Fixed Code", description: "Apply patches or download fixed code" },
            ].map((step, index) => (
              <StepCard key={step.number} {...step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Code Comparison */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-3 sm:mb-4 text-gray-900 dark:text-white px-4">
              Before & After Comparison
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              See how AI transforms inaccessible code into WCAG-compliant solutions
            </p>
          </motion.div>
          
          <CodeComparison />
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-3 sm:mb-4 text-gray-900 dark:text-white px-4">
              Dashboard Preview
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Enterprise-level accessibility insights at your fingertips
            </p>
          </motion.div>
          
          <DashboardPreview />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

const FeatureCard = memo(function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color,
  delay 
}: { 
  icon: any; 
  title: string; 
  description: string;
  color: string;
  delay: number;
}) {
  const colorClasses: Record<string, { icon: string; glow: string }> = {
    blue: { icon: 'text-blue-500', glow: 'shadow-blue-500/50' },
    purple: { icon: 'text-purple-500', glow: 'shadow-purple-500/50' },
    green: { icon: 'text-green-500', glow: 'shadow-green-500/50' },
    yellow: { icon: 'text-yellow-500', glow: 'shadow-yellow-500/50' },
    pink: { icon: 'text-pink-500', glow: 'shadow-pink-500/50' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300"
      >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-gray-800/50 mb-4 sm:mb-6 ${colors.glow} shadow-lg`}
      >
        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colors.icon}`} aria-hidden="true" width="32" height="32" />
      </motion.div>
      <h3 className="text-xl sm:text-2xl font-bold font-display mb-2 sm:mb-3 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
});

const StepCard = memo(function StepCard({ 
  number, 
  icon: Icon, 
  title, 
  description, 
  index 
}: { 
  number: number; 
  icon: any; 
  title: string; 
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative text-center"
    >
      {index < 4 && (
        <div className="hidden lg:block absolute top-24 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-500 to-indigo-500 -z-10" 
          style={{ width: 'calc(100% - 4rem)', left: 'calc(50% + 2rem)' }}
        />
      )}
      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
          {number}
        </div>
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </motion.div>
  );
});

const CodeComparison = memo(function CodeComparison() {
  const beforeCode = `<img src="hero.jpg" />
<button onclick="submit()">Submit</button>
<div class="link" onclick="navigate()">Click</div>`;

  const afterCode = `<img src="hero.jpg" alt="Hero image showing..." />
<button onclick="submit()" aria-label="Submit form">Submit</button>
<a href="#" class="link" role="button" aria-label="Navigate">Click</a>`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 dark:divide-gray-700">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Before</h3>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
              Issues Found
            </span>
          </div>
          <pre className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 overflow-x-auto">
            <code className="text-green-400 text-xs sm:text-sm font-mono">
              {beforeCode}
            </code>
          </pre>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400">After</h3>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
              Fixed ✓
            </span>
          </div>
          <pre className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 overflow-x-auto">
            <code className="text-green-400 text-xs sm:text-sm font-mono">
              {afterCode}
            </code>
          </pre>
        </div>
      </div>
    </motion.div>
  );
});

const DashboardPreview = memo(function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Accessibility Score */}
        <div className="text-center">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4">
            <svg className="transform -rotate-90 w-24 h-24 sm:w-32 sm:h-32">
              <circle
                cx="64"
                cy="64"
                r="42"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="42"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 42 * 0.87} ${2 * Math.PI * 42}`}
                className="text-green-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">87%</span>
            </div>
          </div>
          <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">Accessibility Score</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Level AA Compliant</p>
        </div>

        {/* Issue Categories */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Issue Categories</h3>
          <div className="space-y-3">
            {[
              { label: 'Color Contrast', count: 12, color: 'bg-red-500' },
              { label: 'ARIA Labels', count: 8, color: 'bg-yellow-500' },
              { label: 'Keyboard Navigation', count: 5, color: 'bg-blue-500' },
              { label: 'Alt Text', count: 15, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Fix Progress */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Auto-Fix Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Auto-Fixed</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">32/40</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-hero h-3 rounded-full transition-all duration-500"
                  style={{ width: '80%' }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>80% issues automatically fixed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const Footer = memo(function Footer() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Scanner', href: '/scanner' },
        { label: 'Reports', href: '/reports' },
        { label: 'Compare', href: '/compare' },
        { label: 'Dashboard', href: '/team' },
      ],
    },
    {
      title: 'Developer Tools',
      links: [
        { label: 'API Documentation', href: '#' },
        { label: 'Browser Extension', href: '#' },
        { label: 'GitHub Integration', href: '#' },
        { label: 'CI/CD Integration', href: '#' },
      ],
    },
    {
      title: 'WCAG Resources',
      links: [
        { label: 'WCAG 2.2 Guide', href: '#' },
        { label: 'Accessibility Checklist', href: '#' },
        { label: 'Best Practices', href: '#' },
        { label: 'Compliance Levels', href: '#' },
      ],
    },
    {
      title: 'Contact & Support',
      links: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'Documentation', href: '#' },
        { label: 'Status Page', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text dark:gradient-text-dark mb-3 sm:mb-4">
              AI Accessibility Validator
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              Making the web accessible for everyone with AI-powered tools.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-1"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; {new Date().getFullYear()} AI Accessibility Validator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
});
