'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from '../components/LoginPromptModal';

export default function SupportPage() {
  const { user } = useAuth();
  const loginPrompt = useLoginPrompt();
  const [issueType, setIssueType] = useState('bug');
  const [priority, setPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setDescription('');
      setSteps('');
      setIssueType('bug');
      setPriority('medium');
    }, 4000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Issue Reported!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your issue has been submitted. We'll investigate and get back to you as soon as possible.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Ticket ID:</strong> EC-{Date.now().toString().slice(-6)}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Returning to form...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🆘</div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Report an Issue
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Experiencing a problem? Let us know and we&#39;ll help you out!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Issue Type
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bug">🐛 Bug Report</option>
                      <option value="crash">💥 App Crash</option>
                      <option value="loading">⏳ Loading Issue</option>
                      <option value="search">🔍 Search Problem</option>
                      <option value="login">🔐 Login Issue</option>
                      <option value="display">🖼️ Display Problem</option>
                      <option value="mobile">📱 Mobile Issue</option>
                      <option value="other">❓ Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">🟢 Low - Minor issue</option>
                      <option value="medium">🟡 Medium - Affecting workflow</option>
                      <option value="high">🟠 High - Major issue</option>
                      <option value="critical">🔴 Critical - App unusable</option>
                    </select>
                  </div>
                </div>

                {/* Email (if not logged in) */}
                {!user && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={!user}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      We&#39;ll use this to contact you about the issue.
                    </p>
                  </div>
                )}

                {/* Issue Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issue Summary
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Brief description of the problem"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="What happened? What did you expect to happen?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
                  />
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Steps to Reproduce (Optional)
                  </label>
                  <textarea
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    rows={3}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
                  />
                </div>

                {/* User Info Display (if logged in) */}
                {user && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                      Reporter Information
                    </h4>
                    <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>User:</strong> {user.firstName || user.username}</div>
                      <div><strong>Browser:</strong> {navigator.userAgent.split(' ').pop()}</div>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                    className="flex-1 flex items-center justify-center px-6 py-3 text-white 
                             bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                             rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Reporting Issue...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Report Issue
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Issues */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Common Issues
              </h3>
              <div className="space-y-3">
                {[
                  { issue: "Can't login", solution: "Try resetting your password" },
                  { issue: "Images not loading", solution: "Check your internet connection" },
                  { issue: "Search not working", solution: "Clear browser cache" },
                  { issue: "Mobile display issues", solution: "Update your browser" }
                ].map((item, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">{item.issue}</div>
                    <div className="text-gray-600 dark:text-gray-400">{item.solution}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Need Immediate Help?
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Email Support</div>
                  <div className="text-blue-600 dark:text-blue-400">support@exhibition-curator.com</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Response Time</div>
                  <div className="text-gray-600 dark:text-gray-400">Usually within 24 hours</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Status Page</div>
                  <div className="text-blue-600 dark:text-blue-400">status.exhibition-curator.com</div>
                </div>
              </div>
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