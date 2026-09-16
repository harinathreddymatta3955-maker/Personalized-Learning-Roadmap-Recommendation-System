import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../services/storageService';
import { CachedRoadmapSnapshot, OfflineCacheSummary } from '../types';

interface OfflineContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  setSimulatedOffline: (simulated: boolean) => void;
  isEffectiveOffline: boolean; // True if either really offline or simulated offline
  cachedRoadmaps: CachedRoadmapSnapshot[];
  lastAccessedRoadmap: CachedRoadmapSnapshot | null;
  cacheSummary: OfflineCacheSummary;
  cacheCurrentDomain: (domainId: string, userId: string) => CachedRoadmapSnapshot | null;
  removeCachedDomain: (domainId: string, userId: string) => void;
  clearAllCache: () => void;
  isDomainCached: (domainId: string, userId: string) => boolean;
  refreshCacheState: () => void;
  isOfflineModalOpen: boolean;
  setIsOfflineModalOpen: (open: boolean) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setSimulatedOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem('coengineer_simulate_offline') === 'true';
    } catch {
      return false;
    }
  });
  const [cachedRoadmaps, setCachedRoadmaps] = useState<CachedRoadmapSnapshot[]>([]);
  const [lastAccessedRoadmap, setLastAccessedRoadmap] = useState<CachedRoadmapSnapshot | null>(null);
  const [cacheSummary, setCacheSummary] = useState<OfflineCacheSummary>({
    totalCachedRoadmaps: 0,
    lastAccessedDomainId: null,
    lastCachedAt: null,
    cachedDomains: []
  });
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  const refreshCacheState = () => {
    const list = storageService.getCachedRoadmaps();
    setCachedRoadmaps(list);
    const last = storageService.getLastAccessedRoadmap();
    setLastAccessedRoadmap(last);
    setCacheSummary(storageService.getOfflineCacheSummary());
  };

  useEffect(() => {
    refreshCacheState();

    const handleOnline = () => {
      setIsOnline(true);
      refreshCacheState();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshCacheState();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = storageService.subscribe(() => {
      refreshCacheState();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleSetSimulatedOffline = (simulated: boolean) => {
    setSimulatedOffline(simulated);
    try {
      localStorage.setItem('coengineer_simulate_offline', simulated ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to persist simulated offline state:', e);
    }
  };

  const cacheCurrentDomain = (domainId: string, userId: string): CachedRoadmapSnapshot | null => {
    const snapshot = storageService.cacheRoadmapSnapshot(domainId, userId);
    refreshCacheState();
    return snapshot;
  };

  const removeCachedDomain = (domainId: string, userId: string) => {
    storageService.removeCachedRoadmap(domainId, userId);
    refreshCacheState();
  };

  const clearAllCache = () => {
    storageService.clearAllCachedRoadmaps();
    refreshCacheState();
  };

  const isDomainCached = (domainId: string, userId: string): boolean => {
    return storageService.isRoadmapCached(domainId, userId);
  };

  const isEffectiveOffline = !isOnline || isSimulatedOffline;

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        setSimulatedOffline: handleSetSimulatedOffline,
        isEffectiveOffline,
        cachedRoadmaps,
        lastAccessedRoadmap,
        cacheSummary,
        cacheCurrentDomain,
        removeCachedDomain,
        clearAllCache,
        isDomainCached,
        refreshCacheState,
        isOfflineModalOpen,
        setIsOfflineModalOpen
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
