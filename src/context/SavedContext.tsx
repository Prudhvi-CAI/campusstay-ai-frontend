import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface SavedContextType {
  savedIds: number[];
  compareIds: number[];
  toggleSave: (propertyId: number) => Promise<void>;
  isSaved: (propertyId: number) => boolean;
  toggleCompare: (propertyId: number) => void;
  isCompared: (propertyId: number) => boolean;
  clearCompare: () => void;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [compareIds, setCompareIds] = useState<number[]>([]);

  useEffect(() => {
    if (user && user.role === 'student') {
      api.student.getFavorites()
        .then((favs) => setSavedIds(favs.map((f) => f.id)))
        .catch(() => {});
    } else {
      setSavedIds([]);
    }
  }, [user]);

  const toggleSave = async (propertyId: number) => {
    if (!user) {
      alert('Please log in as a student to save properties to your favorites.');
      return;
    }
    if (savedIds.includes(propertyId)) {
      setSavedIds((prev) => prev.filter((id) => id !== propertyId));
      await api.student.removeFavorite(propertyId).catch(() => {});
    } else {
      setSavedIds((prev) => [...prev, propertyId]);
      await api.student.addFavorite(propertyId).catch(() => {});
    }
  };

  const isSaved = (propertyId: number) => savedIds.includes(propertyId);

  const toggleCompare = (propertyId: number) => {
    if (compareIds.includes(propertyId)) {
      setCompareIds((prev) => prev.filter((id) => id !== propertyId));
    } else {
      if (compareIds.length >= 4) {
        alert('You can compare up to 4 properties at a time.');
        return;
      }
      setCompareIds((prev) => [...prev, propertyId]);
    }
  };

  const isCompared = (propertyId: number) => compareIds.includes(propertyId);

  const clearCompare = () => setCompareIds([]);

  return (
    <SavedContext.Provider
      value={{
        savedIds,
        compareIds,
        toggleSave,
        isSaved,
        toggleCompare,
        isCompared,
        clearCompare,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
};
