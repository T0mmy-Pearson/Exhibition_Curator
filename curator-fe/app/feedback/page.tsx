'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from '../components/LoginPromptModal';

export default function FeedbackPage() {
  const { user } = useAuth();
  const loginPrompt = useLoginPrompt();
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      loginPrompt.showLoginPrompt('manual');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      setCategory('general');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your feedback has been received. We appreciate you taking the time to help us improve The Curator.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting back to form...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">💬</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Send Feedback
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              We'd love to hear your thoughts on The Curator. Your feedback helps us improve!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General Feedback</option>
                <option value="feature">Feature Request</option>
                <option value="ui">User Interface</option>
                <option value="performance">Performance</option>
                <option value="search">Search Functionality</option>
                <option value="exhibitions">Exhibitions</option>
                <option value="artwork">Artwork Display</option>
                <option value="mobile">Mobile Experience</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Email (if not logged in) */}
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Provide your email if you'd like a response to your feedback.
                </p>
              </div>
            )}

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                rows={6}
                placeholder="Tell us what you think! What do you love? What could be improved? Any feature requests?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
              />
            </div>

            {/* User Info Display (if logged in) */}
            {user && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-200">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Feedback will be sent from: {user.email}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !feedback.trim()}
                className="flex-1 flex items-center justify-center px-6 py-3 text-white 
                         bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                         rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Feedback...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Feedback
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                         hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Quick Feedback Options */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Feedback
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { emoji: '❤️', text: 'Love it!' },
                { emoji: '🎨', text: 'Great art!' },
                { emoji: '🔍', text: 'Easy to search' },
                { emoji: '📱', text: 'Mobile friendly' }
              ].map((quick, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFeedback(prev => prev ? `${prev}\n\n${quick.text}` : quick.text);
                    setCategory('general');
                  }}
                  className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 
                           rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-2xl mb-1">{quick.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{quick.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={loginPrompt.isOpen}
          onClose={loginPrompt.hideLoginPrompt}
          onLoginSuccess={loginPrompt.handleLoginSuccess}
          trigger={loginPrompt.trigger}
        />
      </div>
    </div>
  );
}