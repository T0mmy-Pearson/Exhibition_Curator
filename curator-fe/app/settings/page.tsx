'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Redirect if not logged in
  if (!user) {
    router.push('/');
    return null;
  }

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    newExhibitions: true,
    featuredArtworks: false,
    weeklyDigest: true
  });

  const [display, setDisplay] = useState({
    theme: 'system',
    language: 'en',
    itemsPerPage: 20,
    defaultView: 'grid'
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showExhibitions: true,
    allowMessages: false
  });

  const handleSave = () => {
    // Simulate saving settings
    alert('Settings saved successfully!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Simulate account deletion
      logout();
      router.push('/');
      alert('Account deleted successfully.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and privacy settings</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Profile Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Information</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {user.firstName || user.username}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {key === 'emailUpdates' && 'Email Updates'}
                        {key === 'newExhibitions' && 'New Exhibitions'}
                        {key === 'featuredArtworks' && 'Featured Artworks'}
                        {key === 'weeklyDigest' && 'Weekly Digest'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {key === 'emailUpdates' && 'Receive important updates via email'}
                        {key === 'newExhibitions' && 'Get notified when new exhibitions are added'}
                        {key === 'featuredArtworks' && 'Notifications about featured artworks'}
                        {key === 'weeklyDigest' && 'Weekly summary of activity'}
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Preferences */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Display Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={display.theme}
                    onChange={(e) => setDisplay(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={display.language}
                    onChange={(e) => setDisplay(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Items Per Page
                  </label>
                  <select
                    value={display.itemsPerPage}
                    onChange={(e) => setDisplay(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default View
                  </label>
                  <select
                    value={display.defaultView}
                    onChange={(e) => setDisplay(prev => ({ ...prev, defaultView: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="masonry">Masonry</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy & Sharing</h2>
              <div className="space-y-4">
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {key === 'profilePublic' && 'Public Profile'}
                        {key === 'showExhibitions' && 'Show My Exhibitions'}
                        {key === 'allowMessages' && 'Allow Messages'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {key === 'profilePublic' && 'Make your profile visible to other users'}
                        {key === 'showExhibitions' && 'Share your curated exhibitions'}
                        {key === 'allowMessages' && 'Allow other users to send you messages'}
                      </div>
                    </div>
                    <button
                      onClick={() => setPrivacy(prev => ({ ...prev, [key]: !value }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Settings
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-8 border-t border-red-200 dark:border-red-800">
              <h2 className="text-lg font-medium text-red-900 dark:text-red-200 mb-4">Danger Zone</h2>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-red-900 dark:text-red-200">
                      Delete Account
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-300">
                      Permanently delete your account and all associated data
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg 
                             font-medium transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}