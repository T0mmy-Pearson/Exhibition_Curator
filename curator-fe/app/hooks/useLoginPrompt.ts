'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginTrigger } from '../components/LoginPromptModal';

interface LoginPromptState {
  isOpen: boolean;
  trigger: LoginTrigger;
  artworkTitle?: string;
  onSuccess?: () => void;
}

export function useLoginPrompt() {
  const { user } = useAuth();

  const showLoginPrompt = useCallback((
    trigger: LoginTrigger, 
    options?: { artworkTitle?: string; onSuccess?: () => void }
  ) => {

    if (user) {
      if (options?.onSuccess) {
        options.onSuccess();
      }
      return false;
    }

    setPromptState({
      isOpen: true,
      trigger,
      artworkTitle: options?.artworkTitle,
      onSuccess: options?.onSuccess
    });
    return true;
  }, [user]);
  const [promptState, setPromptState] = useState<LoginPromptState>({
    isOpen: false,
    trigger: 'manual'
  });





  // Check if user is visiting for the first time
  useEffect(() => {
    const hasVisited = localStorage.getItem('exhibition-curator-visited');
    const welcomeShown = localStorage.getItem('exhibition-curator-welcome-shown');

    if (!hasVisited && !user && !welcomeShown) {
      const timer = setTimeout(() => {
        showLoginPrompt('first-visit');
        localStorage.setItem('exhibition-curator-visited', 'true');
      }, 2000); // Show after 2 seconds to let the page load
      return () => clearTimeout(timer);
    }
    else if (!hasVisited) {
      localStorage.setItem('exhibition-curator-visited', 'true');
    }
  }, [user, showLoginPrompt]);


  const hideLoginPrompt = useCallback(() => {
    // Mark welcome as shown when modal is closed
    if (promptState.trigger === 'first-visit') {
      localStorage.setItem('exhibition-curator-welcome-shown', 'true');
    }
    
    setPromptState(prev => ({ ...prev, isOpen: false }));
  }, [promptState.trigger]);

  const handleLoginSuccess = useCallback(() => {
    if (promptState.onSuccess) {
      promptState.onSuccess();
    }
    hideLoginPrompt();
  }, [promptState.onSuccess, hideLoginPrompt]);

  // Specific trigger functions for different actions
  const promptForExhibition = useCallback((onSuccess?: () => void) => {
    return showLoginPrompt('create-exhibition', { onSuccess });
  }, [showLoginPrompt]);

  const promptForAddToExhibition = useCallback((artworkTitle?: string, onSuccess?: () => void) => {
    return showLoginPrompt('add-to-exhibition', { artworkTitle, onSuccess });
  }, [showLoginPrompt]);

  const promptForShare = useCallback((onSuccess?: () => void) => {
    return showLoginPrompt('share-exhibition', { onSuccess });
  }, [showLoginPrompt]);

  // Check if user needs authentication for an action
  const requireAuth = useCallback((action: () => void, trigger: LoginTrigger, options?: { artworkTitle?: string }) => {
    if (user) {
      action();
      return true;
    } else {
      showLoginPrompt(trigger, { ...options, onSuccess: action });
      return false;
    }
  }, [user, showLoginPrompt]);

  return {
    // State
    isOpen: promptState.isOpen,
    trigger: promptState.trigger,
    artworkTitle: promptState.artworkTitle,
    
    // Actions
    showLoginPrompt,
    hideLoginPrompt,
    handleLoginSuccess,
    
    // Specific triggers
    promptForExhibition,
    promptForAddToExhibition,
    promptForShare,
    
    // Utility
    requireAuth,
    isLoggedIn: !!user
  };
}