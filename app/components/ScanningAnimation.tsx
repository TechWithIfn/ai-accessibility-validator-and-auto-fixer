"use client";

import { useEffect, useState } from 'react';
import { Loader2, Link2, Code, Palette, Sparkles, CheckCircle } from 'lucide-react';

interface ScanningAnimationProps {
  isScanning: boolean;
  currentStep?: number;
}

const scanSteps = [
  { icon: Link2, label: 'Checking links', description: 'Analyzing page structure and links' },
  { icon: Code, label: 'Analyzing HTML', description: 'Parsing HTML structure and semantics' },
  { icon: Palette, label: 'Checking color contrast', description: 'Evaluating color accessibility' },
  { icon: Sparkles, label: 'Running AI analysis', description: 'AI is generating fixes and suggestions' },
];

export default function ScanningAnimation({ isScanning, currentStep }: ScanningAnimationProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setActiveStep(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < scanSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isScanning]);

  const displayStep = currentStep !== undefined ? currentStep : activeStep;

  if (!isScanning) return null;

  return (
    <div className="glass rounded-[14px] p-8 animate-in fade-in">
      <div className="text-center mb-8">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Scanning Website
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we analyze accessibility issues...
        </p>
      </div>

      <div className="space-y-4">
        {scanSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === displayStep;
          const isCompleted = index < displayStep;
          const isPending = index > displayStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-300 dark:border-primary-700 scale-105'
                  : isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-50'
              }`}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                ) : isActive ? (
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center animate-pulse">
                    <Icon className="w-5 h-5 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  isActive
                    ? 'text-primary-900 dark:text-primary-100'
                    : isCompleted
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </p>
                <p className={`text-sm ${
                  isActive
                    ? 'text-primary-700 dark:text-primary-300'
                    : isCompleted
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.description}
                </p>
              </div>
              {isActive && (
                <div className="flex-shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-500 ease-out"
            style={{ width: `${((displayStep + 1) / scanSteps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Step {displayStep + 1} of {scanSteps.length}
        </p>
      </div>
    </div>
  );
}

