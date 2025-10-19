'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StandardizedArtwork } from '../types/artwork';
import { useAuth } from './AuthContext';

export interface GuestExhibition {
  id: string;
  title: string;
  description: string;
  theme: string;
  tags: string[];
  artworks: StandardizedArtwork[];
  createdAt: string;
  isGuest: true;
}

interface GuestContextType {
  guestExhibitions: GuestExhibition[];
  currentGuestExhibition: GuestExhibition | null;
  createGuestExhibition: (exhibition: Omit<GuestExhibition, 'id' | 'createdAt' | 'isGuest'>) => string;
  updateGuestExhibition: (id: string, updates: Partial<GuestExhibition>) => void;
  deleteGuestExhibition: (id: string) => void;
  addArtworkToGuestExhibition: (exhibitionId: string, artwork: StandardizedArtwork) => void;
  removeArtworkFromGuestExhibition: (exhibitionId: string, artworkId: string) => void;
  setCurrentGuestExhibition: (exhibition: GuestExhibition | null) => void;
  transferGuestDataToUser: () => Promise<void>;
  hasGuestData: boolean;
  clearGuestData: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

interface GuestProviderProps {
  children: ReactNode;
}

export function GuestProvider({ children }: GuestProviderProps) {
  const [guestExhibitions, setGuestExhibitions] = useState<GuestExhibition[]>([]);
  const [currentGuestExhibition, setCurrentGuestExhibition] = useState<GuestExhibition | null>(null);
  const { user, token } = useAuth();

  const GUEST_STORAGE_KEY = 'guest_exhibitions';
  const CURRENT_GUEST_EXHIBITION_KEY = 'current_guest_exhibition';

  // Load guest data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedExhibitions = localStorage.getItem(GUEST_STORAGE_KEY);
      const storedCurrentExhibition = localStorage.getItem(CURRENT_GUEST_EXHIBITION_KEY);

      if (storedExhibitions) {
        try {
          setGuestExhibitions(JSON.parse(storedExhibitions));
        } catch (error) {
          console.error('Error parsing guest exhibitions:', error);
          localStorage.removeItem(GUEST_STORAGE_KEY);
        }
      }

      if (storedCurrentExhibition) {
        try {
          setCurrentGuestExhibition(JSON.parse(storedCurrentExhibition));
        } catch (error) {
          console.error('Error parsing current guest exhibition:', error);
          localStorage.removeItem(CURRENT_GUEST_EXHIBITION_KEY);
        }
      }
    }
  }, []);

  // Save to localStorage whenever guest data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestExhibitions));
    }
  }, [guestExhibitions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentGuestExhibition) {
        localStorage.setItem(CURRENT_GUEST_EXHIBITION_KEY, JSON.stringify(currentGuestExhibition));
      } else {
        localStorage.removeItem(CURRENT_GUEST_EXHIBITION_KEY);
      }
    }
  }, [currentGuestExhibition]);

  const createGuestExhibition = (exhibition: Omit<GuestExhibition, 'id' | 'createdAt' | 'isGuest'>): string => {
    const id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExhibition: GuestExhibition = {
      ...exhibition,
      id,
      createdAt: new Date().toISOString(),
      isGuest: true,
    };

    setGuestExhibitions(prev => [...prev, newExhibition]);
    setCurrentGuestExhibition(newExhibition);
    return id;
  };

  const updateGuestExhibition = (id: string, updates: Partial<GuestExhibition>) => {
    setGuestExhibitions(prev => 
      prev.map(exhibition => 
        exhibition.id === id 
          ? { ...exhibition, ...updates }
          : exhibition
      )
    );

    if (currentGuestExhibition?.id === id) {
      setCurrentGuestExhibition(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteGuestExhibition = (id: string) => {
    setGuestExhibitions(prev => prev.filter(exhibition => exhibition.id !== id));
    
    if (currentGuestExhibition?.id === id) {
      setCurrentGuestExhibition(null);
    }
  };

  const addArtworkToGuestExhibition = (exhibitionId: string, artwork: StandardizedArtwork) => {
    const updatedArtworks = currentGuestExhibition?.artworks.some(a => a.id === artwork.id)
      ? currentGuestExhibition.artworks
      : [...(currentGuestExhibition?.artworks || []), artwork];

    updateGuestExhibition(exhibitionId, { artworks: updatedArtworks });
  };

  const removeArtworkFromGuestExhibition = (exhibitionId: string, artworkId: string) => {
    const exhibition = guestExhibitions.find(e => e.id === exhibitionId);
    if (exhibition) {
      const updatedArtworks = exhibition.artworks.filter(artwork => artwork.id !== artworkId);
      updateGuestExhibition(exhibitionId, { artworks: updatedArtworks });
    }
  };

  const transferGuestDataToUser = async () => {
    if (!user || !token || guestExhibitions.length === 0) {
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
      (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');

    try {
      // Transfer each guest exhibition to the user's account
      for (const guestExhibition of guestExhibitions) {
        const exhibitionData = {
          title: guestExhibition.title,
          description: guestExhibition.description,
          theme: guestExhibition.theme,
          tags: guestExhibition.tags,
          isPublic: false, // Start as private, user can make public later
        };

        const response = await fetch(`${API_BASE_URL}/exhibitions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(exhibitionData),
        });

        if (response.ok) {
          const newExhibition = await response.json();
          
          // Add artworks to the new exhibition
          for (const artwork of guestExhibition.artworks) {
            await fetch(`${API_BASE_URL}/exhibitions/${newExhibition.id}/artworks`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(artwork),
            });
          }
        }
      }

      // Clear guest data after successful transfer
      clearGuestData();
    } catch (error) {
      console.error('Error transferring guest data:', error);
      throw error;
    }
  };

  const clearGuestData = () => {
    setGuestExhibitions([]);
    setCurrentGuestExhibition(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem(CURRENT_GUEST_EXHIBITION_KEY);
    }
  };

  // Clear guest data when user logs in (after potential transfer)
  useEffect(() => {
    if (user && guestExhibitions.length === 0) {
      // User is logged in and no guest data, ensure localStorage is clean
      clearGuestData();
    }
  }, [user]);

  const hasGuestData = guestExhibitions.length > 0;

  const value: GuestContextType = {
    guestExhibitions,
    currentGuestExhibition,
    createGuestExhibition,
    updateGuestExhibition,
    deleteGuestExhibition,
    addArtworkToGuestExhibition,
    removeArtworkFromGuestExhibition,
    setCurrentGuestExhibition,
    transferGuestDataToUser,
    hasGuestData,
    clearGuestData,
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}