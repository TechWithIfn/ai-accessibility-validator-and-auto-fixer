"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scan, FileText, Code, Users, Settings, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/scanner', label: 'URL Scanner', icon: Scan },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/compare', label: 'Compare', icon: Code },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                AI Accessibility Validator
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-b-2 border-primary-500 text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300'
                    } transition-colors`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4 mr-1" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center pl-3 pr-4 py-2 text-base font-medium ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

