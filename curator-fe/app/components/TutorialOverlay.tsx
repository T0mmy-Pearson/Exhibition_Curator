'use client';

import React, { useEffect, useState } from 'react';
import { useTutorial } from '../contexts/TutorialContext';

export default function TutorialOverlay() {
  const { 
    isActive, 
    tutorialData, 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    skipTutorial 
  } = useTutorial();
  
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isActive || !tutorialData?.targetSelector) {
      setTargetElement(null);
      return;
    }

    const findTarget = () => {
      const element = document.querySelector(tutorialData.targetSelector!) as HTMLElement;
      if (element) {
        setTargetElement(element);
        
        // Calculate position for tooltip
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top = rect.top + scrollY;
        let left = rect.left + scrollX;

        // Adjust based on position preference
        switch (tutorialData.position) {
          case 'bottom':
            top += rect.height + 10;
            left += rect.width / 2;
            break;
          case 'top':
            top -= 10;
            left += rect.width / 2;
            break;
          case 'right':
            top += rect.height / 2;
            left += rect.width + 10;
            break;
          case 'left':
            top += rect.height / 2;
            left -= 10;
            break;
        }

        setOverlayStyle({
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          transform: tutorialData.position === 'bottom' || tutorialData.position === 'top' 
            ? 'translateX(-50%)' 
            : tutorialData.position === 'left' 
            ? 'translateX(-100%)' 
            : 'none',
          zIndex: 10000
        });

        // Highlight the target element
        element.style.position = 'relative';
        element.style.zIndex = '9999';
        element.style.boxShadow = '0 0 0 4px rgba(0, 0, 0, 0.5), 0 0 0 8px rgba(255, 255, 255, 0.3)';
        element.style.borderRadius = '4px';
      }
    };

    // Try to find the element immediately
    findTarget();

    // If not found, keep trying for a few seconds
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds at 100ms intervals
    const interval = setInterval(() => {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      
      if (!targetElement) {
        findTarget();
      } else {
        clearInterval(interval);
      }
      
      attempts++;
    }, 100);

    return () => {
      clearInterval(interval);
      // Clean up highlighting
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [isActive, tutorialData, targetElement]);

  if (!isActive || !tutorialData) {
    return null;
  }

  return (
    <>
      {/* Dark overlay - allows clicks through to highlighted elements */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] pointer-events-none"
      />

      {/* Tutorial card */}
      <div
        className="bg-white border-2 border-black shadow-lg max-w-sm w-80 z-[10001] pointer-events-auto"
        style={tutorialData.targetSelector ? overlayStyle : {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001
        }}
      >
        {/* Header */}
        <div className="bg-black text-white p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{tutorialData.title}</h3>
            <button
              onClick={skipTutorial}
              className="text-white/70 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          <div className="text-sm text-white/70 mt-1">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 mb-4 leading-relaxed">
            {tutorialData.description}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 mb-4">
            <div 
              className="bg-black h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-black disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={skipTutorial}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                Skip
              </button>
              <button
                onClick={nextStep}
                className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
              >
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow pointer for positioned tooltips */}
      {tutorialData.targetSelector && tutorialData.position && (
        <div
          className="absolute w-0 h-0 z-[10001]"
          style={{
            ...overlayStyle,
            transform: (() => {
              switch (tutorialData.position) {
                case 'bottom':
                  return 'translateX(-50%) translateY(-100%)';
                case 'top':
                  return 'translateX(-50%) translateY(100%)';
                case 'right':
                  return 'translateX(-100%) translateY(-50%)';
                case 'left':
                  return 'translateX(100%) translateY(-50%)';
                default:
                  return 'none';
              }
            })(),
            borderLeft: tutorialData.position === 'right' ? '10px solid white' : '10px solid transparent',
            borderRight: tutorialData.position === 'left' ? '10px solid white' : '10px solid transparent',
            borderTop: tutorialData.position === 'bottom' ? '10px solid white' : '10px solid transparent',
            borderBottom: tutorialData.position === 'top' ? '10px solid white' : '10px solid transparent',
          }}
        />
      )}
    </>
  );
}