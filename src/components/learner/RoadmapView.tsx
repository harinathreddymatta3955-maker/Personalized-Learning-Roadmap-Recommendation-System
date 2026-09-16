import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { storageService } from '../../services/storageService';
import { recommendationEngine } from '../../services/recommendationEngine';
import { Topic, Course } from '../../types';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter, 
  Info, 
  ArrowRight,
  BookOpen,
  Sparkles,
  HelpCircle,
  Printer,
  HardDrive,
  DownloadCloud,
  WifiOff,
  Check,
  Lightbulb,
  Unlock
} from 'lucide-react';
import { RoadmapPrintModal } from './RoadmapPrintModal';
import { DomainCapstoneModal } from './DomainCapstoneModal';

interface RoadmapViewProps {
  onOpenTopic: (topic: Topic) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onOpenTopic }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'user-1';
  const { isEffectiveOffline, cacheCurrentDomain, cachedRoadmaps, setIsOfflineModalOpen } = useOffline();

  const domains = storageService.getDomains();
  let currentDomain = domains.find(d => d.id === currentUser?.selectedDomainId);
  if (!currentDomain && cachedRoadmaps.length > 0) {
    const last = storageService.getLastAccessedRoadmap(userId);
    currentDomain = last?.domain || cachedRoadmaps[0]?.domain || domains[0];
  } else if (!currentDomain) {
    currentDomain = domains[0];
  }

  const courses = storageService.getCoursesByDomain(currentDomain.id);
  const topics = storageService.getTopicsByDomain(currentDomain.id);
  const allResources = storageService.getResources();
  const userProgress = storageService.getUserProgress(userId);

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isCapstoneModalOpen, setIsCapstoneModalOpen] = useState<boolean>(false);
  const [justCached, setJustCached] = useState<boolean>(false);
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsub();
  }, []);

  // Auto-cache active roadmap snapshot whenever rendered or progress changes
  useEffect(() => {
    if (currentDomain?.id) {
      storageService.cacheRoadmapSnapshot(currentDomain.id, userId);
    }
  }, [currentDomain?.id, userId, userProgress.length]);

  const cachedSnapshot = storageService.getCachedRoadmap(currentDomain.id, userId);
  const isCurrentlyCached = Boolean(cachedSnapshot);

  const handleManualCache = () => {
    if (currentDomain?.id) {
      cacheCurrentDomain(currentDomain.id, userId);
      setJustCached(true);
      setTimeout(() => setJustCached(false), 2500);
    }
  };

  const completedTopicIds = new Set(
    userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
  );

  const domainProgression = recommendationEngine.getDomainProgression(userId, currentDomain.id);
  const isDomainCompleted = domainProgression.isCompleted;
  const extraResource = storageService.getDomainExtraResource(currentDomain.id);

  const handleToggleDomainDemo = () => {
    storageService.toggleDomainCompletionDemo(userId, currentDomain.id);
  };

  const filteredCourses = selectedCourseFilter === 'all'
    ? courses
    : courses.filter(c => c.id === selectedCourseFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: currentDomain.accentColor || '#3b82f6' }} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visual Domain Pathway
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {currentDomain.name} Learning Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Strict linear learning pathway. Each topic unlocks only after completing the preceding topic. All other domains are locked until this domain is fully mastered.
            </p>
          </div>

          {/* Header Controls: Export PDF, Offline Cache & Status Legend */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Offline Cache Status & Action */}
            <button
              onClick={handleManualCache}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                justCached 
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/20' 
                  : isCurrentlyCached 
                    ? 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10 hover:border-white/20' 
                    : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border-amber-500/30'
              }`}
              title={isCurrentlyCached ? "Saved to local storage cache & Service Worker. Click to re-snapshot." : "Cache this roadmap for offline access"}
            >
              {justCached ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Snapshot Saved!</span>
                </>
              ) : isCurrentlyCached ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Offline Ready</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4 text-amber-400" />
                  <span>Save Offline</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 cursor-pointer"
              title="Export clean, printable PDF roadmap for offline reference"
            >
              <Printer className="w-4 h-4" />
              <span>Export Roadmap (PDF)</span>
            </button>

            {/* Status Legend */}
            <div className="flex items-center gap-3 text-xs bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-xs shadow-blue-400" />
                <span>In Progress / Ready</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span>Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Cache Active Alert */}
        {isEffectiveOffline && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-100">Offline Cached Snapshot:</span>{' '}
                All {topics.length} topics across {courses.length} courses and saved resources are stored in local storage and service worker cache.
                {cachedSnapshot && (
                  <span className="text-amber-300/80 ml-1">
                    (Snapshot from {new Date(cachedSnapshot.cachedAt).toLocaleTimeString()})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 font-semibold text-amber-100 transition-colors cursor-pointer"
            >
              View All Offline Roadmaps ({cachedRoadmaps.length})
            </button>
          </div>
        )}

        {/* Domain Progression & Lock Banner */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              domainProgression.isCompleted 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
            }`}>
              {domainProgression.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {domainProgression.isCompleted ? 'Domain Completed & Mastered!' : 'Strict Domain Lock Active'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-300">
                  {domainProgression.completedTopics} / {domainProgression.totalTopics} Topics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {domainProgression.isCompleted
                  ? 'You have completed all topics in this domain. Other learning tracks are unlocked.'
                  : 'Other domains are locked until all topics in this curriculum are finished. Topics must be completed sequentially.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold text-white">{domainProgression.percentage}%</span>
              <span className="text-[10px] text-slate-400 block">Domain Mastery</span>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${domainProgression.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Visual Stage Index / Table of Contents */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Index:
          </span>

          <button
            onClick={() => setSelectedCourseFilter('all')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCourseFilter === 'all'
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Stages ({courses.length + (extraResource ? 1 : 0)})
          </button>

          {courses.map(c => {
            const cTopics = storageService.getTopicsByCourse(c.id);
            const cCompleted = cTopics.filter(t => completedTopicIds.has(t.id)).length;
            const cAll = cTopics.length > 0 && cCompleted === cTopics.length;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCourseFilter(selectedCourseFilter === c.id ? 'all' : c.id)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedCourseFilter === c.id
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : cAll
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>Stage {c.order}</span>
                {cAll && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}

          {/* Final Extra Resource Milestone in Index: Name is blurred if not completed, but clearly shows that it exists at the last of roadmap */}
          {extraResource && (
            <button
              onClick={() => {
                if (isDomainCompleted) {
                  setIsCapstoneModalOpen(true);
                } else {
                  setSelectedCourseFilter('capstone');
                }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCourseFilter === 'capstone'
                  ? 'bg-amber-500/25 border-amber-500 text-amber-200'
                  : isDomainCompleted
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 shadow-xs shadow-amber-500/20'
                  : 'bg-slate-900/60 border-amber-500/20 text-slate-400 hover:bg-slate-900/80'
              }`}
              title={isDomainCompleted ? 'Domain Capstone Unlocked' : 'Domain Capstone Locked - Complete 100% of domain to unlock'}
            >
              <span className="text-[10px] font-bold uppercase text-amber-400/90">Final:</span>
              <span className={`truncate max-w-[150px] sm:max-w-[220px] ${!isDomainCompleted ? 'filter blur-[3px] select-none text-slate-300' : 'text-amber-200'}`}>
                {extraResource.title}
              </span>
              {isDomainCompleted ? (
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              ) : (
                <Lock className="w-3 h-3 text-amber-400/80 shrink-0" />
              )}
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, key skills, or competencies..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/5 text-white placeholder:text-slate-500 backdrop-blur-md"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-white/10 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-200 cursor-pointer"
            >
              <option value="all">All Stages ({courses.length + (extraResource ? 1 : 0)})</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  Stage {c.order}: {c.title}
                </option>
              ))}
              {extraResource && (
                <option value="capstone">
                  {isDomainCompleted
                    ? `Final Stage ${courses.length + 1}: ${extraResource.title} ✨ (Unlocked)`
                    : `Final Stage ${courses.length + 1}: [Capstone Extra Resource 🔒 Locked]`}
                </option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Course Sequence Timeline */}
      <div className="space-y-6 relative">
        {filteredCourses.map((course, courseIndex) => {
          let topics = storageService.getTopicsByCourse(course.id);
          
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            topics = topics.filter(t => 
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q) ||
              t.keySkills.some(s => s.toLowerCase().includes(q))
            );
          }

          if (topics.length === 0 && searchQuery.trim()) {
            return null;
          }

          const completedInCourse = topics.filter(t => completedTopicIds.has(t.id)).length;
          const coursePercentage = topics.length > 0 ? Math.round((completedInCourse / topics.length) * 100) : 0;
          const isCourseFullyCompleted = coursePercentage === 100 && topics.length > 0;

          return (
            <div
              key={course.id}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden transition-all"
            >
              {/* Course Header Banner */}
              <div className="p-5 bg-white/[0.03] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                    isCourseFullyCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {isCourseFullyCompleted ? <CheckCircle2 className="w-4 h-4" /> : course.order}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Course Stage {course.order}
                      </span>
                      {course.prerequisiteCourseIds && course.prerequisiteCourseIds.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                          Prerequisites Required
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{course.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">{completedInCourse} / {topics.length}</span>
                    <span className="text-[11px] text-slate-400 block">{coursePercentage}% done</span>
                  </div>
                  <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all"
                      style={{ width: `${coursePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Course Topics Grid */}
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic, topicIdx) => {
                    const status = recommendationEngine.getTopicStatus(userId, topic);
                    const lockInfo = recommendationEngine.getTopicLockInfo(userId, topic);
                    const isCompleted = status === 'completed';
                    const isLocked = status === 'locked';
                    const isInProgress = status === 'in_progress';

                    return (
                      <div
                        key={topic.id}
                        onClick={() => {
                          onOpenTopic(topic);
                        }}
                        className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                          isCompleted
                            ? 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50 hover:bg-emerald-500/15'
                            : isInProgress
                            ? 'border-blue-500/40 bg-blue-500/10 hover:border-blue-400 hover:bg-blue-500/15 hover:shadow-lg hover:shadow-blue-500/10 ring-1 ring-blue-500/30'
                            : 'border-white/10 bg-white/[0.02] hover:border-amber-500/30 hover:bg-white/[0.05] opacity-75'
                        }`}
                      >
                        <div>
                          {/* Card Top: Status badge & est time */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {isCompleted && (
                                <span className="text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                              )}
                              {isInProgress && (
                                <span className="text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-500/30">
                                  <Play className="w-3 h-3 fill-current" /> Ready to Study
                                </span>
                              )}
                              {isLocked && (
                                <span className="text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/30">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              )}
                            </span>

                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {topic.estimatedMinutes}m
                            </span>
                          </div>

                          {/* Title & Desc */}
                          <h4 className="font-bold text-white text-sm mb-1 leading-snug">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                            {topic.description}
                          </p>
                        </div>

                        <div>
                          {/* Key Skills */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {topic.keySkills.slice(0, 3).map(skill => (
                              <span
                                key={skill}
                                className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[10px] font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Action footer */}
                          {isLocked ? (
                            <div className="pt-2 border-t border-white/10 text-[11px] text-amber-400/90 flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 truncate">
                                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate">
                                  Complete: {lockInfo.previousTopic?.title || 'Prior course topic'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">View Lock</span>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
                              <span className={isCompleted ? 'text-emerald-400' : 'text-blue-400'}>
                                {isCompleted ? 'Review Material' : 'Open Topic'}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Final Milestone Stage: Domain Grand Capstone & Important Problems (Extra Resource) */}
        {extraResource && (selectedCourseFilter === 'all' || selectedCourseFilter === 'capstone') && (
          <div
            id="capstone-final-stage"
            className={`relative rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
              isDomainCompleted
                ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/20 border-amber-500/40 shadow-amber-500/10'
                : 'bg-white/5 border-amber-500/20'
            }`}
          >
            {/* Stage Header Banner */}
            <div className="p-5 bg-white/[0.03] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                  isDomainCompleted
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                    : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                }`}>
                  {isDomainCompleted ? <Sparkles className="w-4 h-4 text-slate-950" /> : <Lock className="w-4 h-4 text-amber-400" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Final Stage {courses.length + 1} • Bonus Milestone
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDomainCompleted
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    }`}>
                      {isDomainCompleted ? 'Unlocked' : 'Locked until 100%'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Optional Extra Resource
                    </span>
                  </div>

                  {/* Notice: when !isDomainCompleted, the title is blurred in the roadmap! */}
                  <h3 className={`text-base sm:text-lg font-bold mt-1 transition-all ${
                    !isDomainCompleted ? 'filter blur-[4px] select-none text-slate-400' : 'text-white'
                  }`}>
                    {extraResource.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <button
                  onClick={handleToggleDomainDemo}
                  title="Toggle 100% domain completion to easily test both locked/blurred and unlocked states"
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>⚡</span>
                  <span>{isDomainCompleted ? 'Reset to In-Progress' : 'Test Unlocked (Simulate 100%)'}</span>
                </button>
              </div>
            </div>

            {/* Stage Body */}
            <div className="relative p-6 sm:p-7">
              {/* Content blurred when NOT completed */}
              <div className={`space-y-4 transition-all duration-300 ${!isDomainCompleted ? 'filter blur-md select-none pointer-events-none opacity-30' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <h4 className="text-sm sm:text-base font-bold text-amber-200">
                      {extraResource.subtitle}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {extraResource.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsCapstoneModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap self-start"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Open Capstone Problems & Hints</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                </div>

                {/* Problems Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {extraResource.problems.map((prob, idx) => (
                    <div
                      key={prob.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        <span>Problem {idx + 1}</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {prob.difficulty}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-2">
                        {prob.title}
                      </h5>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span>{prob.hints.length} Progressive Hints (No solutions)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overlay Banner when Locked: shows that it exists at the last of roadmap */}
              {!isDomainCompleted && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-950/50 backdrop-blur-[3px]">
                  <div className="p-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-amber-400 shadow-xl shadow-amber-500/10 mb-3">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">
                    Final Milestone: Domain Capstone Extra Resource
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-4 leading-relaxed">
                    This extra resource is positioned at the very finish line of the roadmap. Complete all preceding course stages to unveil and unlock it ({domainProgression.completedTopics} of {domainProgression.totalTopics} finished).
                    <br />
                    <span className="text-slate-400 text-xs mt-1 block">
                      *Includes critical industry problems and hints only. Optional for the learner and will not block domain completion.
                    </span>
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleDomainDemo}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>⚡ Test Unlocked (Simulate 100% Completion)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Printable Roadmap Modal (PDF Export) */}
      <RoadmapPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        domain={currentDomain}
        courses={courses}
        topics={topics}
        userProgress={userProgress}
        resources={allResources}
      />

      {/* Domain Capstone & Important Problems Modal */}
      {extraResource && (
        <DomainCapstoneModal
          isOpen={isCapstoneModalOpen}
          onClose={() => setIsCapstoneModalOpen(false)}
          domain={currentDomain}
          extraResource={extraResource}
          isDomainCompleted={isDomainCompleted}
        />
      )}
    </div>
  );
};
