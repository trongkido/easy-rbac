import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('gemini-api-key');
    } catch (error) {
      console.error("Could not read from localStorage", error);
      return null;
    }
  });

  const setApiKey = (key: string | null) => {
    setApiKeyState(key);
    try {
      if (key) {
        localStorage.setItem('gemini-api-key', key);
      } else {
        localStorage.removeItem('gemini-api-key');
      }
    } catch (error) {
      console.error("Could not write to localStorage", error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'gemini-api-key') {
        setApiKeyState(event.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
