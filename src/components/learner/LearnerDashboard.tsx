import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { recommendationEngine } from '../../services/recommendationEngine';
import { Topic, Course } from '../../types';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Award, 
  BookOpen, 
  Map, 
  Target, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Lock,
  Play,
  Printer,
  Lightbulb,
  Unlock,
  HelpCircle,
  Eye
} from 'lucide-react';
import { RoadmapPrintModal } from './RoadmapPrintModal';
import { DomainCapstoneModal } from './DomainCapstoneModal';

interface LearnerDashboardProps {
  onOpenRoadmap: () => void;
  onOpenTopic: (topic: Topic) => void;
  onOpenOnboarding: () => void;
  onOpenResources: () => void;
  onOpenAnalytics: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onOpenRoadmap,
  onOpenTopic,
  onOpenOnboarding,
  onOpenResources,
  onOpenAnalytics
}) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'user-1';

  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsub();
  }, []);

  const domains = storageService.getDomains();
  const currentDomain = domains.find(d => d.id === currentUser?.selectedDomainId) || domains[0];
  
  const courses = storageService.getCoursesByDomain(currentDomain.id);
  const topics = storageService.getTopicsByDomain(currentDomain.id);
  const allResources = storageService.getResources();
  const userProgress = storageService.getUserProgress(userId);
  const activityLogs = storageService.getActivityLogs(userId);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isCapstoneModalOpen, setIsCapstoneModalOpen] = useState<boolean>(false);

  // Completed topics & courses calculation
  const completedTopicIds = new Set(
    userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
  );

  const completedTopicsCount = topics.filter(t => completedTopicIds.has(t.id)).length;
  const progressPercentage = topics.length > 0
    ? Math.round((completedTopicsCount / topics.length) * 100)
    : 0;

  // Completed courses
  const completedCoursesCount = courses.filter(c => {
    const courseTopics = storageService.getTopicsByCourse(c.id);
    return courseTopics.length > 0 && courseTopics.every(t => completedTopicIds.has(t.id));
  }).length;

  // Next topic recommendation
  const recommendation = recommendationEngine.getNextTopicRecommendation(userId, currentDomain.id);

  // Skill gap analysis
  const skillGap = recommendationEngine.analyzeSkillGap(currentUser?.skills || [], currentDomain.id);

  // Domain progression status
  const domainProgression = recommendationEngine.getDomainProgression(userId, currentDomain.id);
  const isDomainCompleted = domainProgression.isCompleted;
  const extraResource = storageService.getDomainExtraResource(currentDomain.id);

  const handleToggleDomainDemo = () => {
    storageService.toggleDomainCompletionDemo(userId, currentDomain.id);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Target Domain: {currentDomain.name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your personalized learning pathway has been calibrated against your known skills.
            You are {progressPercentage}% through the {currentDomain.name} curriculum.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onOpenRoadmap}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>Explore Visual Roadmap</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
              title="Export personalized roadmap to a clean printable PDF"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Export Roadmap (PDF)</span>
            </button>
            <button
              onClick={onOpenOnboarding}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4 text-slate-400" />
              <span>Update Skill Assessment</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-2 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Roadmap Completion</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{progressPercentage}%</span>
            <span className="text-xs text-slate-400">mastered</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-2 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Completed Topics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{completedTopicsCount}</span>
            <span className="text-xs text-slate-400">/ {topics.length} topics</span>
          </div>
          <p className="text-[11px] text-slate-400">{topics.length - completedTopicsCount} topics remaining</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-2 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Courses Mastered</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{completedCoursesCount}</span>
            <span className="text-xs text-slate-400">/ {courses.length} courses</span>
          </div>
          <p className="text-[11px] text-slate-400">Hierarchy based on domain PRD</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-2 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Study Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">4 Days</span>
            <span className="text-xs text-emerald-400 font-semibold">+1 today</span>
          </div>
          <p className="text-[11px] text-slate-400">Consistent learning pace</p>
        </div>
      </div>

      {/* Strict Domain Progression Notice */}
      {currentUser?.role !== 'admin' && (
        <div className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl transition-all ${
          domainProgression.isCompleted
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              domainProgression.isCompleted
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10'
            }`}>
              {domainProgression.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {domainProgression.isCompleted
                    ? `Curriculum Mastered: ${currentDomain.name} (100%)`
                    : `Active Linear Pathway: ${currentDomain.name}`}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  domainProgression.isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                }`}>
                  {domainProgression.isCompleted ? 'Unlocked' : 'Domain Locked'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                {domainProgression.isCompleted
                  ? `You have successfully completed all ${domainProgression.totalTopics} topics in ${currentDomain.name}! All other learning domains are now completely unlocked for you to explore.`
                  : `You are currently progressing through this domain (${domainProgression.completedTopics} of ${domainProgression.totalTopics} topics completed). Under the strict sequential progression rule, other domains remain locked until all topics here are completed, and each topic unlocks sequentially.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            {domainProgression.isCompleted ? (
              <button
                onClick={onOpenOnboarding}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Switch Domain
              </button>
            ) : (
              <button
                onClick={onOpenRoadmap}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                Continue Sequential Path
              </button>
            )}
          </div>
        </div>
      )}

      {/* Domain Capstone & Important Problems Extra Resource */}
      {extraResource && (
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isDomainCompleted
            ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/20 border-amber-500/40 shadow-2xl shadow-amber-500/10'
            : 'bg-white/5 border-white/10'
        }`}>
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                isDomainCompleted
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/10 text-slate-400 border border-white/10'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Domain Extra Resource</span>
              </span>

              {isDomainCompleted ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span>Unlocked (Domain 100% Mastered)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Locked until 100% Completion</span>
                </span>
              )}

              <span className="text-[11px] text-slate-400">
                • Optional Capstone Problems & Questions (Hints only)
              </span>
            </div>

            {/* Live Testing / Demo Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleDomainDemo}
                title="Toggle domain completion to easily test both locked and unlocked states"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>⚡</span>
                <span>{isDomainCompleted ? 'Reset to In-Progress' : 'Test Unlocked (Simulate 100%)'}</span>
              </button>
            </div>
          </div>

          {/* Card Body with Blur when NOT Completed */}
          <div className="relative p-6 sm:p-7">
            {/* If NOT completed, apply blur filter to the content below */}
            <div className={`space-y-4 transition-all duration-300 ${!isDomainCompleted ? 'filter blur-md select-none pointer-events-none opacity-40' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{extraResource.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {extraResource.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => setIsCapstoneModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap self-start"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Open Capstone Problems & Hints</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                </button>
              </div>

              {/* Problems Preview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {extraResource.problems.map((prob, idx) => (
                  <div
                    key={prob.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      <span>Problem {idx + 1}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {prob.difficulty}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white line-clamp-2">
                      {prob.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      <span>{prob.hints.length} Progressive Hints (No solutions)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay Banner when Locked */}
            {!isDomainCompleted && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-950/40 backdrop-blur-[2px]">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/10 mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">
                  Domain Capstone Extra Resource is Locked
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-4 leading-relaxed">
                  Complete all {domainProgression.totalTopics} curriculum topics in <span className="font-semibold text-white">{currentDomain.name}</span> to unlock this extra resource ({domainProgression.completedTopics} of {domainProgression.totalTopics} finished).
                  <br />
                  <span className="text-slate-400 text-xs mt-1 block">
                    *Note: This extra resource contains challenging industry questions with hints only. Attempting it is completely optional and will not block domain completion.
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onOpenRoadmap}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Remaining Topics in Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleToggleDomainDemo}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    ⚡ Test Unlocked (Simulate 100%)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid: Recommendation + Skill Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Topic Recommendation Card (2 cols) */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Next Recommended Topic
              </span>
            </div>
            <span className="text-xs text-slate-400">Algorithmic Match</span>
          </div>

          {recommendation ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/20 backdrop-blur-md border border-blue-500/25 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-blue-400">
                    Course: {recommendation.course.title}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {recommendation.topic.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {recommendation.topic.description}
                  </p>
                </div>

                <button
                  onClick={() => onOpenTopic(recommendation.topic)}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all self-start cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Learning</span>
                </button>
              </div>

              {/* Recommendation reason badge */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-blue-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Why this topic:</strong> {recommendation.reason}
                </span>
              </div>

              {/* Quick Resources List */}
              {recommendation.recommendedResources.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Top Recommended Learning Material:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {recommendation.recommendedResources.map(res => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all text-left block space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 group-hover:text-blue-300">
                            {res.type}
                          </span>
                          <span className="text-[10px] text-slate-400">{res.durationOrReadTime}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{res.title}</h4>
                        <span className="text-[11px] text-slate-400 block truncate">{res.source}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Congratulations!</h3>
              <p className="text-xs text-slate-400 mt-1">
                You have completed all available topics in this roadmap.
              </p>
            </div>
          )}

          {/* Quick Roadmaps Preview Checklist */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm">Course Pathways in this Domain</h3>
              <button
                onClick={onOpenRoadmap}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Full Graph</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {courses.slice(0, 4).map((c, i) => {
                const cTopics = storageService.getTopicsByCourse(c.id);
                const cCompleted = cTopics.filter(t => completedTopicIds.has(t.id)).length;
                const cPct = cTopics.length > 0 ? Math.round((cCompleted / cTopics.length) * 100) : 0;
                
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/[0.08] flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{c.title}</h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{c.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-slate-300">{cPct}%</span>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                          style={{ width: `${cPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Skill Gap Analysis & Recent Activity */}
        <div className="space-y-6">
          {/* Skill Gap Analysis Box */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Skill Gap Analysis</h3>
              </div>
              <button
                onClick={onOpenOnboarding}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
              >
                Re-Assess
              </button>
            </div>

            <div className="p-3.5 bg-indigo-600/15 rounded-xl border border-indigo-500/25 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Initial Match Score:</span>
                <span className="font-extrabold text-indigo-300 text-sm">{skillGap.matchPercentage}%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                You already hold {skillGap.knownSkills.length} prerequisite skills.
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                Identified Missing Competencies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillGap.missingSkills.slice(0, 6).map(s => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25"
                  >
                    {s}
                  </span>
                ))}
                {skillGap.missingSkills.length > 6 && (
                  <span className="text-[11px] text-slate-400 px-1 py-0.5">
                    +{skillGap.missingSkills.length - 6} more
                  </span>
                )}
              </div>
            </div>

            {skillGap.acceleratedTopicIds.length > 0 && (
              <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/25 text-xs text-emerald-300">
                <strong>Fast-track status:</strong> {skillGap.acceleratedTopicIds.length} topics accelerated based on prior knowledge!
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Recent Activity</h3>
              <button
                onClick={onOpenAnalytics}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
              >
                View History
              </button>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 4).map(act => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0 shadow-xs shadow-blue-400" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">
                      {act.action === 'completed_topic' && `Completed "${act.topicTitle || 'Topic'}"`}
                      {act.action === 'started_topic' && `Continued "${act.topicTitle || 'Topic'}"`}
                      {act.action === 'passed_quiz' && `Passed Quiz on "${act.topicTitle || 'Topic'}"`}
                      {act.action === 'switched_domain' && `Selected ${currentDomain.name}`}
                      {act.action === 'updated_skills' && `Updated skill assessment`}
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
