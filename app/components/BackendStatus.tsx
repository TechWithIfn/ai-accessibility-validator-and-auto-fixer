"use client";

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BackendStatusProps {
  className?: string;
}

export default function BackendStatus({ className = '' }: BackendStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        setStatus('offline');
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle2,
          text: 'Backend Online',
          color: 'text-green-500',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          pulse: 'animate-pulse',
        };
      case 'offline':
        return {
          icon: XCircle,
          text: 'Backend Offline',
          color: 'text-red-500',
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          pulse: '',
        };
      default:
        return {
          icon: Loader2,
          text: 'Checking...',
          color: 'text-orange-500',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          pulse: 'animate-spin',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  if (loading || status === 'checking') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} ${className}`}>
        <Icon className={`w-3.5 h-3.5 ${statusConfig.pulse}`} aria-hidden="true" />
        <span>{statusConfig.text}</span>
      </div>
    );
  }

  if (status === 'online') {
    return (
      <div 
        className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} transition-all duration-200 ${className}`}
        onMouseEnter={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          timeoutRef.current = setTimeout(() => setShowTooltip(false), 100);
        }}
      >
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{statusConfig.text}</span>
        {showTooltip && (
          <div className="absolute right-0 top-full mt-2 px-3 py-2 glass rounded-lg shadow-lg z-50 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 animate-in fade-in zoom-in-95">
            Backend server is running and ready
            <div className="absolute -top-1 right-4 w-2 h-2 glass rotate-45"></div>
          </div>
        )}
      </div>
    );
  }

  // Offline state with compact help panel
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowHelp(!showHelp)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
        aria-label="Backend status: offline"
        aria-expanded={showHelp}
      >
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{statusConfig.text}</span>
      </button>
      
      {showHelp && (
        <div className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl p-4 shadow-xl z-50 animate-in fade-in zoom-in-95">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-navy-900 dark:text-white">Backend Server Not Running</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Start the backend server to scan websites for accessibility issues.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Start:</p>
              <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>Navigate to the &quot;backend&quot; folder</li>
                <li>Double-click &quot;start_server.bat&quot;</li>
                <li>Wait for server to start</li>
              </ol>
            </div>
            <a
              href={`${API_BASE_URL}/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-xs font-medium px-3 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:from-primary-700 hover:to-accent-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setShowHelp(false)}
            >
              Check Server Status
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
