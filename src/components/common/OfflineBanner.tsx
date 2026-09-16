import React from 'react';
import { useOffline } from '../../context/OfflineContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { 
  WifiOff, 
  HardDrive, 
  Layers, 
  ChevronDown, 
  Clock, 
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';

interface OfflineBannerProps {
  onOpenCacheManager?: () => void;
  onSelectDomain?: (domainId: string) => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  onOpenCacheManager,
  onSelectDomain
}) => {
  const { 
    isEffectiveOffline, 
    isSimulatedOffline, 
    setSimulatedOffline, 
    cachedRoadmaps, 
    lastAccessedRoadmap,
    setIsOfflineModalOpen
  } = useOffline();

  const { currentUser, updateUserProfile } = useAuth();
  const currentDomainId = currentUser?.selectedDomainId;
  const domains = storageService.getDomains();
  const currentDomain = domains.find(d => d.id === currentDomainId);

  // Check if current domain is cached
  const currentIsCached = cachedRoadmaps.some(r => r.domainId === currentDomainId);

  if (!isEffectiveOffline) return null;

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected) {
      updateUserProfile({ selectedDomainId: selected });
      if (onSelectDomain) {
        onSelectDomain(selected);
      }
    }
  };

  return (
    <aside aria-label="Offline Mode Notification" className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 backdrop-blur-md sticky top-16 z-30 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-100">Offline Mode Active:</span>{' '}
            <span>
              {currentIsCached 
                ? `You are viewing the cached offline roadmap for "${currentDomain?.name}". All topics, curriculum modules, and saved resources are accessible.`
                : `Active pathway "${currentDomain?.name}" is not cached. Please select a cached roadmap below.`}
            </span>
            {isSimulatedOffline && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/30 text-[10px] font-bold tracking-wider text-amber-200 uppercase">
                Simulated Test
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {cachedRoadmaps.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-900/70 px-2.5 py-1 rounded-lg border border-amber-500/30">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 text-[11px]">Cached Roadmaps:</span>
              <select
                value={currentDomainId || ''}
                onChange={handleDomainChange}
                className="bg-transparent text-amber-200 font-semibold text-xs focus:outline-none cursor-pointer"
              >
                {cachedRoadmaps.map((r) => (
                  <option key={r.domainId} value={r.domainId} className="bg-slate-900 text-slate-100">
                    {r.domain.name} ({r.progressPercentage}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => {
              if (onOpenCacheManager) onOpenCacheManager();
              else setIsOfflineModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Manage Offline ({cachedRoadmaps.length})</span>
          </button>

          {isSimulatedOffline && (
            <button
              onClick={() => setSimulatedOffline(false)}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors text-[11px]"
              title="Turn off offline simulation"
            >
              Exit Simulation
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
