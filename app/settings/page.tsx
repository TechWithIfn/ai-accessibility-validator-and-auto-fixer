"use client";

import { useState } from 'react';
import { Save, Bell, Globe, Key, Database, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      emailReports: true,
      weeklyDigest: false,
      criticalIssues: true,
    },
    api: {
      backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      apiKey: '',
    },
    preferences: {
      theme: 'system',
      language: 'en',
      defaultWcagLevel: 'AA',
    },
    scan: {
      timeout: 30,
      maxIssues: 100,
      includeSubdomains: false,
    },
  });

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your application settings and preferences</p>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          <SettingToggle
            label="Email Reports"
            description="Receive accessibility scan reports via email"
            checked={settings.notifications.emailReports}
            onChange={(checked) => updateSetting('notifications', 'emailReports', checked)}
          />
          <SettingToggle
            label="Weekly Digest"
            description="Get a weekly summary of all scans and improvements"
            checked={settings.notifications.weeklyDigest}
            onChange={(checked) => updateSetting('notifications', 'weeklyDigest', checked)}
          />
          <SettingToggle
            label="Critical Issues Alert"
            description="Get notified immediately when critical accessibility issues are found"
            checked={settings.notifications.criticalIssues}
            onChange={(checked) => updateSetting('notifications', 'criticalIssues', checked)}
          />
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Configuration</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="backend-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backend URL
            </label>
            <input
              type="url"
              id="backend-url"
              value={settings.api.backendUrl}
              onChange={(e) => updateSetting('api', 'backendUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key (Optional)
            </label>
            <input
              type="password"
              id="api-key"
              value={settings.api.apiKey}
              onChange={(e) => updateSetting('api', 'apiKey', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter API key if required"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Palette className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              id="theme"
              value={settings.preferences.theme}
              onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              id="language"
              value={settings.preferences.language}
              onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <label htmlFor="wcag-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default WCAG Level
            </label>
            <select
              id="wcag-level"
              value={settings.preferences.defaultWcagLevel}
              onChange={(e) => updateSetting('preferences', 'defaultWcagLevel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="A">Level A</option>
              <option value="AA">Level AA</option>
              <option value="AAA">Level AAA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scan Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Database className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scan Settings</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scan Timeout (seconds)
            </label>
            <input
              type="number"
              id="timeout"
              value={settings.scan.timeout}
              onChange={(e) => updateSetting('scan', 'timeout', parseInt(e.target.value))}
              min={10}
              max={300}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="max-issues" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Issues to Report
            </label>
            <input
              type="number"
              id="max-issues"
              value={settings.scan.maxIssues}
              onChange={(e) => updateSetting('scan', 'maxIssues', parseInt(e.target.value))}
              min={10}
              max={1000}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <SettingToggle
            label="Include Subdomains"
            description="Scan subdomains when scanning a main domain"
            checked={settings.scan.includeSubdomains}
            onChange={(checked) => updateSetting('scan', 'includeSubdomains', checked)}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Save className="w-5 h-5 mr-2" aria-hidden="true" />
          Save Settings
        </button>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        aria-label={label}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

