'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'scroll' | 'wait';
  nextTrigger?: 'auto' | 'manual';
}

interface TutorialFlow {
  id: string;
  name: string;
  steps: TutorialStep[];
}

interface TutorialContextType {
  isActive: boolean;
  currentFlow: string | null;
  currentStep: number;
  totalSteps: number;
  tutorialData: TutorialStep | null;
  startTutorial: (flowId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  markStepComplete: (stepId: string) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const TUTORIAL_FLOWS: Record<string, TutorialFlow> = {
  'first-curation': {
    id: 'first-curation',
    name: 'Your First Curation',
    steps: [
      {
        id: 'welcome-search',
        title: 'Welcome to Exhibition Curator!',
        description: 'Let\'s create your first exhibition. We\'ll start by finding some amazing artworks to curate.',
        nextTrigger: 'manual'
      },
      {
        id: 'search-artwork',
        title: 'Search for Art',
        description: 'Try searching for something you love - like "landscape", "portraits", or "cats". The search will find artworks from world-famous museums.',
        targetSelector: '[data-tutorial="search-input"]',
        position: 'bottom',
        action: 'wait',
        nextTrigger: 'auto'
      },
      {
        id: 'add-to-exhibition',
        title: 'Add to Exhibition',
        description: 'Found something you like? Click the "+" button to add it to an exhibition. You can create a new exhibition or add to an existing one.',
        targetSelector: '[data-tutorial="add-button"]',
        position: 'left',
        action: 'click',
        nextTrigger: 'auto'
      },
      {
        id: 'create-exhibition',
        title: 'Create Your Exhibition',
        description: 'Give your exhibition a name and theme. This will be your first curated collection!',
        targetSelector: '[data-tutorial="exhibition-form"]',
        position: 'top',
        action: 'wait',
        nextTrigger: 'auto'
      },
      {
        id: 'continue-curating',
        title: 'Keep Building!',
        description: 'Great! You\'ve added your first artwork. Continue searching and adding pieces to build a complete exhibition. Aim for 3-8 artworks for a good collection.',
        nextTrigger: 'manual'
      },
      {
        id: 'view-exhibition',
        title: 'View Your Creation',
        description: 'Once you\'re happy with your collection, you can view your exhibition and even share it with others!',
        nextTrigger: 'manual'
      }
    ]
  }
};

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const router = useRouter();

  const getCurrentFlow = useCallback(() => {
    return currentFlow ? TUTORIAL_FLOWS[currentFlow] : null;
  }, [currentFlow]);

  const tutorialData = getCurrentFlow()?.steps[currentStep] || null;
  const totalSteps = getCurrentFlow()?.steps.length || 0;

  const startTutorial = useCallback((flowId: string) => {
    const flow = TUTORIAL_FLOWS[flowId];
    if (!flow) return;

    setCurrentFlow(flowId);
    setCurrentStep(0);
    setIsActive(true);
    setCompletedSteps(new Set());

    // Navigate to search page for first-curation tutorial
    if (flowId === 'first-curation') {
      router.push('/search?tutorial=first-curation');
    }
  }, [router]);

  const nextStep = useCallback(() => {
    const flow = getCurrentFlow();
    if (!flow) return;

    if (currentStep < flow.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentStep, getCurrentFlow]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentFlow(null);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    
    // Store that user skipped tutorial
    localStorage.setItem('tutorial-skipped', 'true');
  }, []);

  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentFlow(null);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    
    // Store completion
    localStorage.setItem(`tutorial-completed-${currentFlow}`, 'true');
  }, [currentFlow]);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    // Auto-advance if this step is set to auto-trigger
    const currentStepData = tutorialData;
    if (currentStepData?.nextTrigger === 'auto') {
      setTimeout(nextStep, 1000);
    }
  }, [tutorialData, nextStep]);

  const value: TutorialContextType = {
    isActive,
    currentFlow,
    currentStep,
    totalSteps,
    tutorialData,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    markStepComplete
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}