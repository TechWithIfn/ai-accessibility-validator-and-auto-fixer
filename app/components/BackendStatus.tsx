"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BackendStatusProps {
  className?: string;
}

export default function BackendStatus({ className = '' }: BackendStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
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
    // Check every 10 seconds
    const interval = setInterval(checkBackend, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading || status === 'checking') {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" aria-hidden="true" />
        <span className="text-gray-600 dark:text-gray-400">Checking backend...</span>
      </div>
    );
  }

  if (status === 'online') {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />
        <span className="text-green-600 dark:text-green-400">Backend Online</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 text-sm ${className}`}>
      <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
      <span className="text-red-600 dark:text-red-400">Backend Offline</span>
      <a
        href={`${API_BASE_URL}/health`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 dark:text-primary-400 hover:underline text-xs"
      >
        Check manually
      </a>
    </div>
  );
}

