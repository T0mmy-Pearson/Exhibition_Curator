'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export default function StatusIndicator() {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.HEALTH);
        setIsBackendConnected(response.ok);
      } catch (error) {
        setIsBackendConnected(false);
      }
    };

    checkBackendStatus();
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isBackendConnected === null) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs">Checking connection...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${
      isBackendConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isBackendConnected ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span className="text-xs">
        {isBackendConnected ? 'Connected to API' : 'API Disconnected'}
      </span>
    </div>
  );
}