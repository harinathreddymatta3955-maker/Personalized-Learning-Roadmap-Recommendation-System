import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { storageService } from '../../services/storageService';
import { recommendationEngine } from '../../services/recommendationEngine';
import { Topic } from '../../types';
import { GlobalSearchBar } from './GlobalSearchBar';
import { 
  Compass, 
  Map, 
  BookOpen, 
  BarChart2, 
  ShieldCheck, 
  Layers, 
  Users, 
  RotateCcw, 
  LogOut, 
  Sparkles,
  Sliders,
  ChevronDown,
  Lock,
  Database,
  WifiOff,
  HardDrive,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  openOnboarding?: () => void;
  onOpenOnboarding?: () => void;
  openAuthModal?: (mode: 'login' | 'register') => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenTopic?: (topic: Topic) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab: propSetActiveTab,
  onSelectTab,
  openOnboarding: propOpenOnboarding,
  onOpenOnboarding,
  openAuthModal,
  onOpenLogin,
  onOpenRegister,
  onOpenTopic
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const setActiveTab = propSetActiveTab || onSelectTab || (() => {});
  const openOnboarding = propOpenOnboarding || onOpenOnboarding || (() => {});
  const handleOpenAuth = (mode: 'login' | 'register') => {
    if (openAuthModal) {
      openAuthModal(mode);
    } else if (mode === 'login' && onOpenLogin) {
      onOpenLogin();
    } else if (mode === 'register' && onOpenRegister) {
      onOpenRegister();
    }
  };

  const { currentUser, role, logout } = useAuth();
  const { isEffectiveOffline, cachedRoadmaps, setIsOfflineModalOpen } = useOffline();
  const domains = storageService.getDomains();
  const currentDomain = domains.find(d => d.id === currentUser?.selectedDomainId) || domains[0];

  const handleLogout = () => {
    logout();
    setActiveTab('dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all courses, progress, and user data to default demonstration seed data?')) {
      storageService.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 text-slate-100">
      <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between gap-2 h-14 sm:h-16 min-w-0">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab(role === 'admin' ? 'admin-dashboard' : 'dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-sm sm:text-base md:text-lg text-white tracking-tight">CO-ENGINEER</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 hidden md:inline-block">
                    Learning & Rec
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden 2xl:block">Personalized Learning & Recommendation System</p>
              </div>
            </button>

            {/* Current Domain Badge for Learner (visible on wide screens) */}
            {role === 'user' && currentUser && currentDomain && (() => {
              const domainProgression = recommendationEngine.getDomainProgression(currentUser.id, currentDomain.id);
              const isLocked = domainProgression.hasStarted && !domainProgression.isCompleted;

              return (
                <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full ring-2 ring-white/10 shrink-0" style={{ backgroundColor: currentDomain.accentColor || '#3b82f6' }} />
                  <span className="font-medium text-white truncate max-w-[130px]">{currentDomain.name}</span>
                  {isLocked ? (
                    <span 
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1"
                      title={`Linear track active: ${domainProgression.completedTopics}/${domainProgression.totalTopics} topics completed`}
                    >
                      <Lock className="w-3 h-3 text-amber-400" />
                      {domainProgression.completedTopics}/{domainProgression.totalTopics}
                    </span>
                  ) : domainProgression.isCompleted ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Mastered
                    </span>
                  ) : null}
                  <button
                    onClick={openOnboarding}
                    className="text-blue-400 hover:text-blue-300 font-semibold ml-1 cursor-pointer transition-colors shrink-0"
                    title={isLocked ? "View track locks & assessment" : "Change domain or reassess skills"}
                  >
                    {isLocked ? "Tracks" : "Switch"}
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Global Search Bar (icon on mobile, full input on md+) */}
          <GlobalSearchBar
            onOpenTopic={(topic) => {
              onOpenTopic?.(topic);
              setIsMobileMenuOpen(false);
            }}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
          />

          {/* Center Navigation Links (visible on 2xl screens, on <2xl they are displayed cleanly in the secondary sub-bar) */}
          <nav className="hidden 2xl:flex items-center gap-1 shrink-0">
            {role === 'user' ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Dashboard
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'roadmap'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" />
                    Roadmap
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'resources'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Resources
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" />
                    Analytics
                  </span>
                </button>
              </>
            ) : (
              /* Admin Navigation */
              <>
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-dashboard'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('admin-domains')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-domains'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Domains
                </button>
                <button
                  onClick={() => setActiveTab('admin-courses')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-courses'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setActiveTab('admin-topics')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-topics'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Topics
                </button>
                <button
                  onClick={() => setActiveTab('admin-resources')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-resources'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Resources
                </button>
                <button
                  onClick={() => setActiveTab('admin-builder')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-builder'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Builder
                </button>
                <button
                  onClick={() => setActiveTab('admin-users')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-users'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('admin-analytics')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-analytics'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Analytics
                </button>
              </>
            )}
          </nav>

          {/* Desktop Right Action Bar (visible on md+ screens) */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Firestore Database Live Indicator */}
            <div 
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shrink-0"
              title="Connected to Firebase Firestore Cloud Database. Resources, progress, and user data are persisted in real-time."
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline text-[11px]">Firestore DB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>


            {/* Assessment trigger for learner */}
            {role === 'user' && (
              <button
                onClick={openOnboarding}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors shadow-sm shadow-blue-500/10 cursor-pointer shrink-0"
                title="Open Skill Assessment & Domain Selector"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="hidden xl:inline">Assessment</span>
              </button>
            )}

            {/* Reset Defaults button */}
            <button
              onClick={handleResetData}
              title="Reset to default seed data"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Offline Cache Indicator & Manager Button */}
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs rounded-xl font-semibold transition-all border cursor-pointer shrink-0 ${
                isEffectiveOffline
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
              }`}
              title={isEffectiveOffline ? "Offline mode active. Click to manage offline roadmaps." : "Offline caching layer active. Click to inspect cached roadmaps."}
            >
              {isEffectiveOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden xl:inline">Offline</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-bold">
                    {cachedRoadmaps.length}
                  </span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden xl:inline">Offline</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {cachedRoadmaps.length}
                  </span>
                </>
              )}
            </button>

            {/* User profile / prominent logout button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-white/10 shrink-0">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]" title={currentUser.name}>
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {currentUser.role === 'admin' ? '🛡️ Admin' : '🎓 Learner'}
                  </span>
                </div>
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 h-8 rounded-full ring-2 ring-white/10 object-cover shrink-0"
                />
                <button
                  onClick={handleLogout}
                  title={`Sign out of ${currentUser.name}`}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-100 border border-red-500/30 text-xs font-semibold transition-all shadow-xs hover:shadow-red-500/10 cursor-pointer active:scale-95 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-blue-500/25 transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Bar (< md screens): Offline icon + Menu Hamburger button */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* Compact Offline Cache icon button */}
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className={`p-2 text-xs rounded-xl font-semibold transition-all border cursor-pointer ${
                isEffectiveOffline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
              }`}
              title="Offline status & cached roadmaps"
              aria-label="Offline Mode"
            >
              {isEffectiveOffline ? (
                <WifiOff className="w-4 h-4 text-amber-400" />
              ) : (
                <HardDrive className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Mobile Menu / Tools Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isMobileMenuOpen
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
              }`}
              title="Toggle menu & tools"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <Menu className="w-4 h-4 text-slate-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Full Dropdown Menu (< md) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-2xl px-3 py-3.5 space-y-3 shadow-2xl">
            {/* 1. Active User Profile Card */}
            {currentUser ? (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full ring-2 ring-blue-500/30 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-white truncate">{currentUser.name}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {currentUser.role === 'admin' ? '🛡️ Administrator' : '🎓 Learner'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleOpenAuth('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    handleOpenAuth('register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center shadow-lg shadow-blue-500/20"
                >
                  Register
                </button>
              </div>
            )}


            {/* 3. System Status & Quick Actions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Firestore Indicator */}
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Firestore DB</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Offline Roadmaps Manager */}
              <button
                onClick={() => {
                  setIsOfflineModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Offline</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {cachedRoadmaps.length}
                </span>
              </button>

              {/* Skill Assessment trigger for learner */}
              {role === 'user' && (
                <button
                  onClick={() => {
                    openOnboarding();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px]">Assessment</span>
                </button>
              )}

              {/* Reset Defaults */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleResetData();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">Reset Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile & Tablet secondary navigation (visible on <2xl screens) */}
        <div className="2xl:hidden flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 overflow-x-auto border-t border-white/10 text-xs no-scrollbar">
          {role === 'user' ? (
            <>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('roadmap');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'roadmap' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Visual Roadmap
              </button>
              <button
                onClick={() => {
                  setActiveTab('resources');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'resources' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Resources
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => {
                  openOnboarding();
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap bg-blue-500/20 text-blue-400 border border-blue-500/30 touch-manipulation cursor-pointer"
              >
                Assessment
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setActiveTab('admin-dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'admin-dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-domains');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'admin-domains' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Domains
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-courses');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'admin-courses' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-topics');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'admin-topics' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Topics
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-resources');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'admin-resources' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Resources
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-builder');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'admin-builder' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Builder
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-users');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'admin-users' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-analytics');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap touch-manipulation cursor-pointer ${
                  activeTab === 'admin-analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}
              >
                Analytics
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
