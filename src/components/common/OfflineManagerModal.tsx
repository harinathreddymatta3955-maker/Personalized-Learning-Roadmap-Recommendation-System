import React from 'react';
import { useOffline } from '../../context/OfflineContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Trash2, 
  DownloadCloud, 
  CheckCircle2, 
  X, 
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  BookOpen
} from 'lucide-react';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDomain?: (domainId: string) => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectDomain
}) => {
  const { 
    isOnline, 
    isSimulatedOffline, 
    setSimulatedOffline, 
    isEffectiveOffline,
    cachedRoadmaps,
    cacheCurrentDomain,
    clearAllCache,
    removeCachedDomain
  } = useOffline();

  const { currentUser, updateUserProfile } = useAuth();
  const userId = currentUser?.id || 'user-1';
  const domains = storageService.getDomains();
  const currentDomainId = currentUser?.selectedDomainId || domains[0]?.id;
  const currentDomain = domains.find(d => d.id === currentDomainId);

  if (!isOpen) return null;

  const handleCacheCurrent = () => {
    if (currentDomainId) {
      cacheCurrentDomain(currentDomainId, userId);
    }
  };

  const handleOpenDomain = (domainId: string) => {
    updateUserProfile({ selectedDomainId: domainId });
    if (onSelectDomain) {
      onSelectDomain(domainId);
    }
    onClose();
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isEffectiveOffline ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {isEffectiveOffline ? <WifiOff className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Offline Roadmap Cache Manager
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Service Worker + LocalStorage
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Access your personalized learning pathways and resources even without internet access
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 text-slate-200 text-sm">
          {/* Connection Status & Offline Simulator Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isEffectiveOffline ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="font-semibold text-white">
                  {isEffectiveOffline ? 'Status: Offline / Disconnected Mode' : 'Status: Online & Synced with Cloud'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isSimulatedOffline 
                  ? 'Simulated offline testing mode is currently ACTIVE.' 
                  : isOnline 
                    ? 'Connected to real network. Cache auto-refreshes as you navigate.' 
                    : 'Physical network connection is offline. Using local cache.'}
              </p>
            </div>

            {/* Offline Simulation Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <label className="text-xs text-slate-300 font-medium cursor-pointer flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <input 
                  type="checkbox"
                  checked={isSimulatedOffline}
                  onChange={(e) => setSimulatedOffline(e.target.checked)}
                  className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span>Simulate Offline</span>
              </label>
            </div>
          </div>

          {/* Caching Quick Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-blue-950/20 border border-blue-500/20">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Current Domain Snapshot</div>
              <div className="text-sm font-semibold text-white mt-0.5">{currentDomain?.name || 'Selected Domain'}</div>
              <p className="text-xs text-slate-400">Save complete module structure, topics, and resources for offline use.</p>
            </div>
            <button
              onClick={handleCacheCurrent}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Cache {currentDomain?.name?.split(' ')[0] || 'Domain'} Now</span>
            </button>
          </div>

          {/* Cached Roadmaps List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Cached Offline Roadmaps ({cachedRoadmaps.length})</span>
              </h3>
              {cachedRoadmaps.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all offline cached roadmaps?')) {
                      clearAllCache();
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Cache</span>
                </button>
              )}
            </div>

            {cachedRoadmaps.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-400 space-y-2">
                <HardDrive className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                <p className="text-sm font-medium text-slate-300">No Roadmaps Cached Offline Yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Roadmaps automatically cache when you view them in the Roadmap tab, or you can click "Cache Now" above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cachedRoadmaps.map((item) => {
                  const isCurrent = item.domainId === currentDomainId;
                  return (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-blue-950/30 border-blue-500/40 shadow-sm' 
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: item.domain.accentColor || '#3b82f6' }} 
                          />
                          <h4 className="font-bold text-white text-sm">
                            {item.domain.name}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Active
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Offline Ready
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                            {item.totalTopicsCount} topics ({item.completedTopicsCount} completed - {item.progressPercentage}%)
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Cached {formatTimeAgo(item.cachedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenDomain(item.domainId)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Open Roadmap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeCachedDomain(item.domainId, userId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Remove from offline cache"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Architecture info */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Dual Caching Architecture:</span> A service worker precaches application assets for offline launch, while the localStorage caching layer preserves full curriculum pathways, topic metadata, quizzes, and your completed progress with zero network dependency.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
