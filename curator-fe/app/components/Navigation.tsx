'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from './LoginPromptModal';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const loginPrompt = useLoginPrompt();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Artworks', icon: '🎨' },
    { href: '/search', label: 'Search', icon: '🔍' },
    { href: '/exhibitions', label: 'Exhibitions', icon: '🖼️' },
  ];

  const userActions = user ? [
    { 
      label: 'My Favorites', 
      icon: '❤️', 
      action: () => loginPrompt.promptForViewFavorites(() => router.push('/favorites'))
    },
    { 
      label: 'Create Exhibition', 
      icon: '➕', 
      action: () => loginPrompt.promptForExhibition(() => router.push('/create-exhibition'))
    },
    { 
      label: 'My Profile', 
      icon: '👤', 
      action: () => router.push('/profile')
    },
    { 
      label: 'Settings', 
      icon: '⚙️', 
      action: () => router.push('/settings')
    },
  ] : [];

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="text-2xl group-hover:scale-110 transition-transform">🎨</div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Exhibition Curator
                </span>
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search artworks, artists, museums..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <svg 
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium 
                           text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400
                           hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium 
                             text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400
                             hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <span>{user.firstName || user.username}</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      {userActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            action.action();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                   hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <span>{action.icon}</span>
                          <span>{action.label}</span>
                        </button>
                      ))}
                      
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      
                      <button
                        onClick={() => router.push('/feedback')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <span>💬</span>
                        <span>Send Feedback</span>
                      </button>
                      
                      <button
                        onClick={() => router.push('/support')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <span>🆘</span>
                        <span>Report Issue</span>
                      </button>
                      
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 
                                 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => loginPrompt.showLoginPrompt('manual')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                             hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => loginPrompt.showLoginPrompt('manual')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                             rounded-md transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Test Links */}
              <Link
                href="/login-test"
                className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 
                         dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 
                         dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 
                         transition-colors"
              >
                🧪 Test
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                         focus:outline-none focus:text-gray-900 dark:focus:text-white p-2"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search artworks..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg 
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-base font-medium 
                             text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400
                             hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile User Section */}
              {user ? (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName || user.username}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {userActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-2 px-3 py-2 text-base 
                               text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400
                               hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      router.push('/feedback');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-2 px-3 py-2 text-base 
                             text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400
                             hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <span>💬</span>
                    <span>Send Feedback</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/support');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-2 px-3 py-2 text-base 
                             text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400
                             hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <span>🆘</span>
                    <span>Report Issue</span>
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-2 px-3 py-2 text-base 
                             text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                             rounded-md transition-colors"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <button
                    onClick={() => {
                      loginPrompt.showLoginPrompt('manual');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 
                             border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 
                             dark:hover:bg-gray-800 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      loginPrompt.showLoginPrompt('manual');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 text-base font-medium text-white bg-blue-600 
                             hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={loginPrompt.isOpen}
        onClose={loginPrompt.hideLoginPrompt}
        onLoginSuccess={loginPrompt.handleLoginSuccess}
        trigger={loginPrompt.trigger}
        artworkTitle={loginPrompt.artworkTitle}
      />
    </>
  );
}