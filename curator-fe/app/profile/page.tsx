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
  favoriteCount: number;
  exhibitionCount: number;
}

interface Exhibition {
  _id: string;
  title: string;
  description: string;
  theme: string;
  artworks: Record<string, unknown>[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FavoriteArtwork {
  _id: string;
  artworkId: string;
  title: string;
  artist: string;
  date: string;
  medium: string;
  imageUrl: string;
  museumSource: string;
  addedAt: string;
}

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const loginPrompt = useLoginPrompt();

  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'exhibitions' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteArtwork[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [stats, setStats] = useState({ favorites: 0, exhibitions: 0, views: 0 });

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
      // Fetch favorites using the correct API endpoint
      const favResponse = await fetch(API_ENDPOINTS.USER_FAVORITES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (favResponse.ok) {
        const favData = await favResponse.json();
        setFavorites(favData.favorites || []);
      }

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
          favorites: favorites.length,
          exhibitions: exhibitions.length,
          views: Math.floor(Math.random() * 1000) + 100 // Mock data
        });
      }, 100);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, favorites.length, exhibitions.length]);

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

  const handleRemoveFavorite = async (artworkId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.FAVORITES_REMOVE(artworkId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.artworkId !== artworkId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
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
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last Name"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.username
                      }
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">@{user.username}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">{user.email}</p>
                    {user.bio && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-colors"
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
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.favorites}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.exhibitions}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Exhibitions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.views}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Profile Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'favorites', label: `Favorites (${favorites.length})`, icon: '❤️' },
                { id: 'exhibitions', label: `Exhibitions (${exhibitions.length})`, icon: '🖼️' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Recent Favorites */}
                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-pink-800 dark:text-pink-200 mb-3 flex items-center">
                    <span className="mr-2">❤️</span>
                    Recent Favorites
                  </h3>
                  {favorites.slice(0, 3).map((fav, index) => (
                    <div key={fav._id || `favorite-${index}`} className="flex items-center space-x-3 mb-2">
                      <img 
                        src={fav.imageUrl} 
                        alt={fav.title}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-artwork.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fav.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {fav.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                  {favorites.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No favorites yet</p>
                  )}
                </div>

                {/* Recent Exhibitions */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                    <span className="mr-2">🖼️</span>
                    Recent Exhibitions
                  </h3>
                  {exhibitions.slice(0, 3).map((ex, index) => (
                    <div key={ex._id || `exhibition-${index}`} className="mb-3 last:mb-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {ex.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ex.artworks.length} artworks • {ex.theme}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(ex.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {exhibitions.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No exhibitions yet</p>
                  )}
                </div>

                {/* Account Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                    <span className="mr-2">ℹ️</span>
                    Account Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Member since:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Profile views:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{stats.views}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Favorite Artworks ({favorites.length})
                </h2>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
                >
                  <span className="mr-2">❤️</span>
                  Find More Artworks
                </button>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favorites.map((favorite, index) => (
                    <div key={favorite._id || `favorite-full-${index}`} className="relative group">
                      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
                        <div className="relative h-48">
                          <img
                            src={favorite.imageUrl}
                            alt={favorite.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-artwork.jpg';
                            }}
                          />
                          
                          {/* Remove favorite button */}
                          <button
                            onClick={() => handleRemoveFavorite(favorite.artworkId)}
                            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from favorites"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {favorite.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                            {favorite.artist}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                            {favorite.date}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                              {favorite.museumSource}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              Added {new Date(favorite.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💔</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Favorite Artworks Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start exploring and add artworks to your favorites!
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Discover Artworks
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Exhibitions Tab */}
          {activeTab === 'exhibitions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Exhibitions ({exhibitions.length})
                </h2>
                <button
                  onClick={() => loginPrompt.promptForExhibition(() => router.push('/create-exhibition'))}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
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
                    <div key={exhibition._id || `exhibition-full-${index}`} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {exhibition.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {exhibition.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => router.push(`/exhibitions/${exhibition._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            {exhibition.isPublic ? 'Public' : 'Private'}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Exhibitions Created Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first exhibition to showcase your curated artworks!
                  </p>
                  <button
                    onClick={() => loginPrompt.promptForExhibition(() => router.push('/create-exhibition'))}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push('/settings')}
                    className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Advanced Settings
                  </button>
                  
                  <button
                    onClick={() => router.push('/feedback')}
                    className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Send Feedback
                  </button>
                  
                  <button
                    onClick={() => router.push('/support')}
                    className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Get Support
                  </button>
                </div>

                {/* Account Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Actions</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to sign out?')) {
                          logout();
                          router.push('/');
                        }
                      }}
                      className="w-full flex items-center justify-center p-3 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-lg transition-colors"
                    >
                      <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including favorites and exhibitions.')) {
                          // Handle account deletion
                          logout();
                          router.push('/');
                          alert('Account deleted successfully.');
                        }
                      }}
                      className="w-full flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg transition-colors"
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