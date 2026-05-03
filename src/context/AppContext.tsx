import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  searchHistory: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load data from AsyncStorage on mount
    const loadData = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        const savedHistory = await AsyncStorage.getItem('searchHistory');
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading app data', e);
      }
    };
    loadData();
  }, []);

  const toggleFavorite = async (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const addToHistory = async (query: string) => {
    if (!query.trim()) return;
    const cleanQuery = query.trim();
    const newHistory = [cleanQuery, ...searchHistory.filter(h => h !== cleanQuery)].slice(0, 5);
    setSearchHistory(newHistory);
    await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem('searchHistory');
  };

  return (
    <AppContext.Provider value={{ 
      favorites, 
      toggleFavorite, 
      isFavorite, 
      searchHistory, 
      addToHistory,
      clearHistory 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
