'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGuest } from '../contexts/GuestContext';
import LoginPromptModal from './LoginPromptModal';

export default function GuestDataPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const { user } = useAuth();
  const { hasGuestData, guestExhibitions, transferGuestDataToUser, clearGuestData } = useGuest();

  // Show prompt when user logs in and has guest data
  useEffect(() => {
    if (user && hasGuestData) {
      setShowPrompt(true);
    }
  }, [user, hasGuestData]);

  // Warn before leaving if user has unsaved guest work
  useEffect(() => {
    if (!user && hasGuestData) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'You have unsaved exhibition work. Register to save your progress!';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [user, hasGuestData]);

  const handleTransferData = async () => {
    try {
      setIsTransferring(true);
      await transferGuestDataToUser();
      setShowPrompt(false);
    } catch (error) {
      console.error('Failed to transfer guest data:', error);
      alert('Failed to save your exhibitions. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDiscardData = () => {
    clearGuestData();
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Transfer Data Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-2 border-black max-w-md w-full p-6 relative">
          {/* Abstract accent */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-black transform rotate-45"></div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">Save Your Work?</h2>
            
            <p className="text-gray-600">
              Welcome back! You have {guestExhibitions.length} unsaved exhibition{guestExhibitions.length !== 1 ? 's' : ''} 
              from your previous session. Would you like to save them to your account?
            </p>

            <div className="bg-gray-50 p-4 border border-gray-200">
              <h3 className="font-semibold text-black mb-2">Your Exhibitions:</h3>
              <ul>
                {guestExhibitions.map(exhibition => (
                  <li key={exhibition.id} className="text-sm text-gray-600 flex justify-between">
                    <span>&quot;{exhibition.title}&quot;</span>
                    <span>{exhibition.artworks.length} artworks</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleTransferData}
                disabled={isTransferring}
                className="flex-1 bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 relative"
              >
                {isTransferring ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save to Account'
                )}
              </button>
              
              <button
                onClick={handleDiscardData}
                className="flex-1 border border-black text-black px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal for guest users */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        trigger="save-work"
        onLoginSuccess={() => {
          setShowLoginModal(false);
          // The prompt will show again after login due to useEffect
        }}
      />
    </>
  );
// Removed duplicate closing brace
}