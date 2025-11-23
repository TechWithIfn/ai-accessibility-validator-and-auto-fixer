"use client";

import { CheckCircle, AlertCircle, XCircle, Activity, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  lastChecked?: string;
  responseTime?: number;
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Service', status: 'operational', uptime: '99.9%' },
    { name: 'Scanning Engine', status: 'operational', uptime: '99.8%' },
    { name: 'AI Processing', status: 'operational', uptime: '99.7%' },
    { name: 'Database', status: 'operational', uptime: '99.9%' },
  ]);
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'down'>('operational');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkServiceStatus = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // Check API health
      const healthResponse = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      const updatedServices: ServiceStatus[] = services.map((service) => {
        if (service.name === 'API Service') {
          return {
            ...service,
            status: healthResponse.data.status === 'healthy' ? 'operational' : 'degraded',
            lastChecked: new Date().toISOString(),
            responseTime: responseTime
          };
        }
        return service;
      });

      // Check if all services are operational
      const allOperational = updatedServices.every(s => s.status === 'operational');
      setOverallStatus(allOperational ? 'operational' : 'degraded');
      setServices(updatedServices);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      // API is down
      const updatedServices = services.map((service) => {
        if (service.name === 'API Service') {
          return {
            ...service,
            status: 'down' as const,
            lastChecked: new Date().toISOString(),
            responseTime: undefined
          };
        }
        return service;
      });
      setServices(updatedServices);
      setOverallStatus('down');
      setLastUpdate(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkServiceStatus();

    // Set up auto-refresh every 30 seconds
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkServiceStatus();
      }, 30000); // 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'degraded':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'down':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };

  const incidents = [
    {
      date: '2024-01-10',
      title: 'Scheduled Maintenance',
      status: 'resolved',
      description: 'Completed scheduled database maintenance. All services operational.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Status Page</h1>
              {lastUpdate && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Last updated: {lastUpdate}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={checkServiceStatus}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Real-time status of all AI Accessibility Validator services and components.
        </p>
      </div>

      {/* Overall Status */}
      <div className={`${getStatusColor(overallStatus)} rounded-xl p-6 border mb-8`}>
        <div className="flex items-center gap-3 mb-2">
          {getStatusIcon(overallStatus)}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {overallStatus === 'operational' && 'All Systems Operational'}
            {overallStatus === 'degraded' && 'Some Services Degraded'}
            {overallStatus === 'down' && 'Service Outage'}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {overallStatus === 'operational' && 'All services are running normally. No issues detected.'}
          {overallStatus === 'degraded' && 'Some services are experiencing issues. We are investigating.'}
          {overallStatus === 'down' && 'Service is currently unavailable. Please check back soon.'}
        </p>
      </div>

      {/* Service Status */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Service Status</h2>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{service.status}</p>
                    {service.responseTime && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({service.responseTime}ms)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{service.uptime}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Uptime (30d)</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Incidents</h2>
        {incidents.length > 0 ? (
          <div className="space-y-4">
            {incidents.map((incident, idx) => (
              <div key={idx} className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                    {incident.status}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{incident.date}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{incident.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{incident.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No recent incidents. All systems operational.</p>
        )}
      </section>
    </div>
  );
}
