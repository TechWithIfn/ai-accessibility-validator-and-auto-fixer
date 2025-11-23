"use client";

import { BarChart3, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Overview of your accessibility scanning activity and reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">12</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reports</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">45</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">87.5</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Score</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">8</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Sites Monitored</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/scanner"
              className="block w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center font-medium"
            >
              New Scan
            </Link>
            <Link
              href="/reports"
              className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center font-medium"
            >
              View Reports
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">example.com</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                85.5
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">demo-site.com</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">1 day ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                92.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

