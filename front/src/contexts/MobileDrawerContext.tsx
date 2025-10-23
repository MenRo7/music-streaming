import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MobileDrawerContextType {
  isQueueOpen: boolean;
  isLibraryOpen: boolean;
  openQueue: () => void;
  closeQueue: () => void;
  toggleQueue: () => void;
  openLibrary: () => void;
  closeLibrary: () => void;
  toggleLibrary: () => void;
}

const MobileDrawerContext = createContext<MobileDrawerContextType | undefined>(undefined);

export const useMobileDrawer = (): MobileDrawerContextType => {
  const context = useContext(MobileDrawerContext);
  if (!context) {
    throw new Error('useMobileDrawer must be used within MobileDrawerProvider');
  }
  return context;
};

interface MobileDrawerProviderProps {
  children: ReactNode;
}

export const MobileDrawerProvider: React.FC<MobileDrawerProviderProps> = ({ children }) => {
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const openQueue = () => {
    setIsLibraryOpen(false); // Close library when opening queue
    setIsQueueOpen(true);
  };

  const closeQueue = () => setIsQueueOpen(false);

  const toggleQueue = () => {
    if (!isQueueOpen) {
      openQueue();
    } else {
      closeQueue();
    }
  };

  const openLibrary = () => {
    setIsQueueOpen(false); // Close queue when opening library
    setIsLibraryOpen(true);
  };

  const closeLibrary = () => setIsLibraryOpen(false);

  const toggleLibrary = () => {
    if (!isLibraryOpen) {
      openLibrary();
    } else {
      closeLibrary();
    }
  };

  return (
    <MobileDrawerContext.Provider
      value={{
        isQueueOpen,
        isLibraryOpen,
        openQueue,
        closeQueue,
        toggleQueue,
        openLibrary,
        closeLibrary,
        toggleLibrary,
      }}
    >
      {children}
    </MobileDrawerContext.Provider>
  );
};
