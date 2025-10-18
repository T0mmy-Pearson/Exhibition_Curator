'use client';

import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from '../components/LoginPromptModal';

export default function LoginTestPage() {
  const { user, logout } = useAuth();
  const loginPrompt = useLoginPrompt();

  const clearVisitorData = () => {
    localStorage.removeItem('exhibition-curator-visited');
    localStorage.removeItem('exhibition-curator-welcome-shown');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Login System Test Page
          </h1>
          
          {/* Current Status */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Current Status
            </h2>
            {user ? (
              <div className="space-y-2">
                <p className="text-blue-800 dark:text-blue-300">
                  ✅ Logged in as: <strong>{user.firstName || user.username}</strong>
                </p>
                <p className="text-blue-800 dark:text-blue-300">
                  📧 Email: {user.email}
                </p>
                <button
                  onClick={logout}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Logout to Test Prompts
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-blue-800 dark:text-blue-300">
                  ❌ Not logged in
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Click any button below to test login prompts
                </p>
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Controls
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={clearVisitorData}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Reset First Visit Status
              </button>
              <button
                onClick={() => loginPrompt.showLoginPrompt('first-visit')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                👋 Show Welcome Modal
              </button>
            </div>
          </div>

          {/* Login Prompt Triggers */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Login Prompt Triggers
            </h2>
            
            {/* Add to Exhibition */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                🎨 Add to Exhibition
              </h3>
              <p className="text-gray-600 mb-4">
                Trigger login prompt when trying to add an artwork to exhibition
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => loginPrompt.promptForAddToExhibition('Mona Lisa')}
                  className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded"
                >
                  🎨 Add "Mona Lisa" to Exhibition
                </button>
                <button
                  onClick={() => loginPrompt.promptForAddToExhibition('The Starry Night')}
                  className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded"
                >
                  🎨 Add "The Starry Night" to Exhibition
                </button>
              </div>
            </div>

            {/* Create Exhibition */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                🖼️ Create Exhibition
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Trigger login prompt when trying to create an exhibition
              </p>
              <button
                onClick={() => loginPrompt.promptForExhibition(() => {
                  alert('Exhibition creation started!');
                })}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🖼️ Create New Exhibition
              </button>
            </div>

            {/* Share Exhibition */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                📤 Share Exhibition
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Trigger login prompt when trying to share an exhibition
              </p>
              <button
                onClick={() => loginPrompt.promptForShare(() => {
                  alert('Exhibition shared!');
                })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📤 Share Exhibition
              </button>
            </div>

            {/* Manual Trigger */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                🎯 Manual Login
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Show basic login prompt
              </p>
              <button
                onClick={() => loginPrompt.showLoginPrompt('manual')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🎯 Show Login Modal
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
              💡 How to Test
            </h3>
            <ol className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-decimal list-inside">
              <li>Make sure you're logged out to see login prompts</li>
              <li>Click "Reset First Visit Status" to test the welcome modal</li>
              <li>Try each trigger button to see different login contexts</li>
              <li>Login through the modal to see the success callbacks</li>
              <li>Notice how each trigger shows relevant messaging</li>
            </ol>
          </div>
        </div>

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={loginPrompt.isOpen}
          onClose={loginPrompt.hideLoginPrompt}
          onLoginSuccess={loginPrompt.handleLoginSuccess}
          trigger={loginPrompt.trigger}
          artworkTitle={loginPrompt.artworkTitle}
        />
      </div>
    </div>
  );
}