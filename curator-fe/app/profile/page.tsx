'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from '../components/LoginPromptModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_ENDPOINTS } from '../config/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImageUrl?: string;
  joinDate: string;
  exhibitionCount: number;
}

interface Exhibition {
  _id: string;
  title: string;
  description: string;
  theme: string;
  artworks: Record<string, unknown>[];
  isPublic: boolean;
  shareableLink?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const loginPrompt = useLoginPrompt();

  const [activeTab, setActiveTab] = useState<'overview' | 'exhibitions' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [stats, setStats] = useState({ exhibitions: 0, views: 0 });

  // Editable profile data
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    email: user?.email || ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      loginPrompt.showLoginPrompt('manual');
      return;
    }
  }, [user, loginPrompt]);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user's exhibitions using the correct API endpoint
      const exhResponse = await fetch(API_ENDPOINTS.USER_EXHIBITIONS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (exhResponse.ok) {
        const exhData = await exhResponse.json();
        setExhibitions(exhData.exhibitions || []);
      }

      // Update stats after data is loaded
      setTimeout(() => {
        setStats({
          exhibitions: exhibitions.length,
          views: Math.floor(Math.random() * 1000) + 100 // Mock data
        });
      }, 100);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, exhibitions.length]);

  // Fetch user data
  useEffect(() => {
    if (user && token) {
      fetchUserData();
    }
  }, [user, token, fetchUserData]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error updating profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExhibition = async (exhibitionId: string) => {
    if (!confirm('Are you sure you want to delete this exhibition?')) return;

    try {
      const response = await fetch(API_ENDPOINTS.EXHIBITION_DELETE(exhibitionId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setExhibitions(prev => prev.filter(ex => ex._id !== exhibitionId));
      }
    } catch (error) {
      console.error('Error deleting exhibition:', error);
    }
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You need to be logged in to view your profile.
            </p>
          </div>
        </div>
        <LoginPromptModal
          isOpen={loginPrompt.isOpen}
          onClose={loginPrompt.hideLoginPrompt}
          onLoginSuccess={loginPrompt.handleLoginSuccess}
          trigger={loginPrompt.trigger}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-black dark:bg-white rounded-lg shadow-lg mb-8 border border-white dark:border-black">
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white dark:bg-black rounded-full flex items-center justify-center text-black dark:text-white text-3xl font-bold border border-black dark:border-white">
                  {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First Name"
                        className="px-3 py-2 border border-white dark:border-black rounded-lg bg-black dark:bg-white text-white dark:text-black"
                      />
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last Name"
                        className="px-3 py-2 border border-white dark:border-black rounded-lg bg-black dark:bg-white text-white dark:text-black"
                      />
                    </div>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-white dark:border-black rounded-lg bg-black dark:bg-white text-white dark:text-black"
                    />
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full px-3 py-2 border border-white dark:border-black rounded-lg bg-black dark:bg-white text-white dark:text-black resize-vertical"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="px-4 py-2 bg-white dark:bg-black hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black border border-white dark:border-black rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-white dark:text-black mb-2">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.username
                      }
                    </h1>
                    <p className="text-gray-400 dark:text-gray-600 mb-2">@{user.username}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">{user.email}</p>
                    {user.bio && (
                      <p className="text-gray-300 dark:text-gray-700 mb-4">{user.bio}</p>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black border border-white dark:border-black rounded-lg font-medium transition-colors"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex space-x-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white dark:text-black">{stats.exhibitions}</div>
                  <div className="text-sm text-gray-400 dark:text-gray-600">Exhibitions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white dark:text-black">{stats.views}</div>
                  <div className="text-sm text-gray-400 dark:text-gray-600">Profile Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-black dark:bg-white rounded-lg shadow-lg mb-8 border border-white dark:border-black">
          <div className="border-b border-white dark:border-black">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '' },
                { id: 'exhibitions', label: `Exhibitions (${exhibitions.length})`, icon: '' },
                { id: 'settings', label: 'Settings', icon: '' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-white dark:border-black text-white dark:text-black'
                      : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-500 dark:hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-black dark:bg-white rounded-lg shadow-lg border border-white dark:border-black">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white dark:text-black mb-6">Account Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Exhibitions */}
                <div className="bg-black dark:bg-white rounded-lg p-4 border border-white dark:border-black">
                  <h3 className="font-semibold text-white dark:text-black mb-3 flex items-center">
                    Recent Exhibitions
                  </h3>
                  {exhibitions.slice(0, 3).map((ex, index) => (
                    <div key={ex._id || `exhibition-${index}`} className="mb-3 last:mb-0">
                      <p className="text-sm font-medium text-white dark:text-black">
                        {ex.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {ex.artworks.length} artworks • {ex.theme}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(ex.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {exhibitions.length === 0 && (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No exhibitions yet</p>
                  )}
                </div>

                {/* Account Info */}
                <div className="bg-black dark:bg-white rounded-lg p-4 border border-white dark:border-black">
                  <h3 className="font-semibold text-white dark:text-black mb-3 flex items-center">
                    Account Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400 dark:text-gray-600">Member since:</span>
                      <span className="ml-2 text-white dark:text-black">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-600">Profile views:</span>
                      <span className="ml-2 text-white dark:text-black">{stats.views}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-600">Email:</span>
                      <span className="ml-2 text-white dark:text-black">{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exhibitions Tab */}
          {activeTab === 'exhibitions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  My Exhibitions ({exhibitions.length})
                </h2>
                <button
                  onClick={() => loginPrompt.promptForExhibition(() => router.push('/create-exhibition'))}
                  className="px-4 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg font-medium transition-colors"
                >
                  <span className="mr-2">➕</span>
                  Create Exhibition
                </button>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : exhibitions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {exhibitions.map((exhibition, index) => (
                    <div key={exhibition._id || `exhibition-full-${index}`} className="bg-white dark:bg-black rounded-lg shadow-md p-6 border border-black dark:border-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                            {exhibition.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {exhibition.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              // Use shareable link if available, otherwise fall back to ID
                              const identifier = exhibition.shareableLink || exhibition._id;
                              router.push(`/exhibitions/${identifier}`);
                            }}
                            className="p-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="View exhibition"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteExhibition(exhibition._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete exhibition"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600 dark:text-gray-400">
                            {exhibition.artworks.length} artworks
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            exhibition.isPublic
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-white dark:bg-black text-black dark:text-white border border-black dark:border-white'
                          }`}>
                            {exhibition.isPublic ? 'Public' : 'Private'}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-white dark:bg-black text-black dark:text-white border border-black dark:border-white">
                            {exhibition.theme}
                          </span>
                        </div>
                        <span className="text-gray-400 dark:text-gray-500">
                          {new Date(exhibition.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🖼️</div>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    No Exhibitions Created Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first exhibition to showcase your curated artworks!
                  </p>
                  <button
                    onClick={() => loginPrompt.promptForExhibition(() => router.push('/create-exhibition'))}
                    className="px-6 py-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg font-medium transition-colors"
                  >
                    Create Exhibition
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push('/settings')}
                    className="flex items-center justify-center p-4 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white border border-black dark:border-white rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Advanced Settings
                  </button>
                  
                  <button
                    onClick={() => router.push('/feedback')}
                    className="flex items-center justify-center p-4 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white border border-black dark:border-white rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Send Feedback
                  </button>
                  
                  <button
                    onClick={() => router.push('/support')}
                    className="flex items-center justify-center p-4 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white border border-black dark:border-white rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Get Support
                  </button>
                </div>

                {/* Account Actions */}
                <div className="border-t border-black dark:border-white pt-6">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">Account Actions</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to sign out?')) {
                          logout();
                          router.push('/');
                        }
                      }}
                      className="w-full flex items-center justify-center p-3 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-lg transition-colors border border-yellow-300 dark:border-yellow-600"
                    >
                      <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including exhibitions.')) {
                          // Handle account deletion
                          logout();
                          router.push('/');
                          alert('Account deleted successfully.');
                        }
                      }}
                      className="w-full flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg transition-colors border border-red-300 dark:border-red-600"
                    >
                      <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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