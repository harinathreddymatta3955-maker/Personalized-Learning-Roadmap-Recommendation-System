import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { Resource, ResourceType, Topic, Course, Domain } from '../../types';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Code2, 
  HelpCircle, 
  Search, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  LayoutGrid, 
  List, 
  Compass, 
  GraduationCap, 
  Clock, 
  RotateCcw, 
  Check, 
  ChevronRight, 
  Sparkles,
  Flame,
  Layers,
  Eye,
  X,
  Star,
  Award,
  ArrowUpRight,
  Filter,
  Printer,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen
} from 'lucide-react';
import { RoadmapPrintModal } from './RoadmapPrintModal';

interface ResourcesHubProps {
  onOpenTopicById: (topicId: string) => void;
}

type ViewMode = 'pathway' | 'grid' | 'table';
type SortOption = 'curriculum' | 'duration-asc' | 'duration-desc' | 'title-asc';

const BOOKMARKS_STORAGE_KEY = 'plrrs_bookmarked_resources';
const COMPLETED_RESOURCES_KEY = 'plrrs_completed_resources';

const QUICK_TAGS = [
  'All',
  'Java',
  'Python',
  'Spring Boot',
  'FastAPI',
  'React',
  'Data Structures',
  'Machine Learning',
  'Docker',
  'Beginner Friendly',
  'Videos'
];

export const ResourcesHub: React.FC<ResourcesHubProps> = ({ onOpenTopicById }) => {
  const { currentUser } = useAuth();

  // Primary navigation tab
  const [activeTab, setActiveTab] = useState<string>('all'); // 'all', domainId, 'saved', 'completed'
  
  // Secondary filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('curriculum');
  const [viewMode, setViewMode] = useState<ViewMode>('pathway');

  // Collapse state for module accordions
  const [collapsedCourseIds, setCollapsedCourseIds] = useState<Set<string>>(new Set());

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Preview Modal state
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence States
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(COMPLETED_RESOURCES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem(COMPLETED_RESOURCES_KEY, JSON.stringify(completedIds));
  }, [completedIds]);

  // Set user's active domain if available and default to it
  useEffect(() => {
    if (currentUser?.selectedDomainId && activeTab === 'all') {
      setActiveTab(currentUser.selectedDomainId);
    }
  }, [currentUser?.selectedDomainId]);

  // Dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch core data
  const domains = storageService.getDomains();
  const allCourses = storageService.getCourses();
  const allTopics = storageService.getTopics();
  const allResources = storageService.getResources();

  // Fast lookups
  const topicMap = useMemo(() => {
    const map = new Map<string, Topic>();
    allTopics.forEach(t => map.set(t.id, t));
    return map;
  }, [allTopics]);

  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    allCourses.forEach(c => map.set(c.id, c));
    return map;
  }, [allCourses]);

  const domainMap = useMemo(() => {
    const map = new Map<string, Domain>();
    domains.forEach(d => map.set(d.id, d));
    return map;
  }, [domains]);

  // Toggle Handlers
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds(prev => {
      const isSaved = prev.includes(id);
      const updated = isSaved ? prev.filter(item => item !== id) : [...prev, id];
      setToastMessage(isSaved ? 'Removed from your Saved Library' : 'Saved to your Personal Library! ⭐');
      return updated;
    });
  };

  const toggleCompleted = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompletedIds(prev => {
      const isDone = prev.includes(id);
      const updated = isDone ? prev.filter(item => item !== id) : [...prev, id];
      
      if (!isDone && currentUser) {
        const res = allResources.find(r => r.id === id);
        storageService.logActivity({
          userId: currentUser.id,
          action: 'completed_resource',
          topicId: res?.topicId,
          details: `Completed learning resource: ${res?.title || id}`
        });
        setToastMessage('Marked as Completed! 🎉 Activity logged.');
      } else {
        setToastMessage('Marked as Incomplete');
      }
      return updated;
    });
  };

  // Helper to parse duration minutes
  const parseMinutes = (dur: string): number => {
    if (!dur) return 30;
    const lower = dur.toLowerCase();
    const match = lower.match(/\d+(\.\d+)?/);
    if (!match) return 30;
    const val = parseFloat(match[0]);
    if (lower.includes('hour') || lower.includes('hr')) return Math.round(val * 60);
    return Math.round(val);
  };

  const isFiltered = searchQuery !== '' || selectedType !== 'all' || selectedDifficulty !== 'all';

  // Filtered list
  const filteredResources = useMemo(() => {
    return allResources.filter(res => {
      const topic = topicMap.get(res.topicId);
      const domainId = topic?.domainId;

      // Active Tab Filter
      if (activeTab === 'saved') {
        if (!bookmarkedIds.includes(res.id)) return false;
      } else if (activeTab === 'completed') {
        if (!completedIds.includes(res.id)) return false;
      } else if (activeTab !== 'all') {
        if (domainId !== activeTab) return false;
      }

      // Type Filter
      if (selectedType !== 'all' && res.type !== selectedType) {
        return false;
      }

      // Difficulty Filter
      if (selectedDifficulty !== 'all' && res.difficulty !== selectedDifficulty) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const course = topic ? courseMap.get(topic.courseId) : null;
        const domain = domainId ? domainMap.get(domainId) : null;

        const matches = 
          res.title.toLowerCase().includes(q) ||
          res.description.toLowerCase().includes(q) ||
          res.source.toLowerCase().includes(q) ||
          (topic && topic.title.toLowerCase().includes(q)) ||
          (course && course.title.toLowerCase().includes(q)) ||
          (domain && domain.name.toLowerCase().includes(q));

        if (!matches) return false;
      }

      return true;
    });
  }, [
    allResources, 
    activeTab, 
    selectedType, 
    selectedDifficulty, 
    searchQuery, 
    bookmarkedIds, 
    completedIds, 
    topicMap, 
    courseMap, 
    domainMap
  ]);

  // Sorted list
  const sortedResources = useMemo(() => {
    const list = [...filteredResources];

    list.sort((a, b) => {
      if (sortOption === 'curriculum') {
        const topicA = topicMap.get(a.topicId);
        const topicB = topicMap.get(b.topicId);
        const courseA = topicA ? courseMap.get(topicA.courseId) : null;
        const courseB = topicB ? courseMap.get(topicB.courseId) : null;

        const cOrderA = courseA?.order ?? 999;
        const cOrderB = courseB?.order ?? 999;
        if (cOrderA !== cOrderB) return cOrderA - cOrderB;

        const tOrderA = topicA?.order ?? 999;
        const tOrderB = topicB?.order ?? 999;
        if (tOrderA !== tOrderB) return tOrderA - tOrderB;

        return a.title.localeCompare(b.title);
      }

      if (sortOption === 'duration-asc') {
        return parseMinutes(a.durationOrReadTime) - parseMinutes(b.durationOrReadTime);
      }

      if (sortOption === 'duration-desc') {
        return parseMinutes(b.durationOrReadTime) - parseMinutes(a.durationOrReadTime);
      }

      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      }

      return 0;
    });

    return list;
  }, [filteredResources, sortOption, topicMap, courseMap]);

  // Featured Spotlight Resource (LetsUpgrade "Featured Resource of the Week")
  const featuredResource = useMemo(() => {
    // Pick the highest priority uncompleted resource for user's domain, or fallback to first resource
    const targetDomainId = currentUser?.selectedDomainId || domains[0]?.id;
    const domainResources = allResources.filter(r => {
      const topic = topicMap.get(r.topicId);
      return topic?.domainId === targetDomainId;
    });

    const uncompleted = domainResources.find(r => !completedIds.includes(r.id));
    return uncompleted || domainResources[0] || allResources[0] || null;
  }, [allResources, currentUser?.selectedDomainId, domains, completedIds, topicMap]);

  // Structured Pathway Grouping for Curriculum Sequence
  const pathwayDomainGroups = useMemo(() => {
    // Determine target domains based on active tab
    let targetDomains: Domain[] = [];

    if (activeTab === 'all' || activeTab === 'saved' || activeTab === 'completed') {
      targetDomains = [...domains].sort((a, b) => a.order - b.order);
    } else {
      const selected = domainMap.get(activeTab);
      if (selected) targetDomains = [selected];
    }

    const domainGroups = [];

    for (const domain of targetDomains) {
      const domainCourses = allCourses
        .filter(c => c.domainId === domain.id)
        .sort((a, b) => a.order - b.order);

      const courseGroups = [];

      for (const course of domainCourses) {
        const courseTopics = allTopics
          .filter(t => t.courseId === course.id)
          .sort((a, b) => a.order - b.order);

        const topicGroups = [];

        for (const topic of courseTopics) {
          // Resources belonging to this topic from filtered resources
          let topicResources = filteredResources.filter(r => r.topicId === topic.id);

          // Apply sort inside topic if user chose duration or title sort
          if (sortOption === 'duration-asc') {
            topicResources = [...topicResources].sort((a, b) => parseMinutes(a.durationOrReadTime) - parseMinutes(b.durationOrReadTime));
          } else if (sortOption === 'duration-desc') {
            topicResources = [...topicResources].sort((a, b) => parseMinutes(b.durationOrReadTime) - parseMinutes(a.durationOrReadTime));
          } else if (sortOption === 'title-asc') {
            topicResources = [...topicResources].sort((a, b) => a.title.localeCompare(b.title));
          }

          const completedCount = topicResources.filter(r => completedIds.includes(r.id)).length;

          // If filtering/search is active, only show topics with matching resources
          // In normal browsing, show topic step so the pathway syllabus remains complete
          const isFilterActive = isFiltered || activeTab === 'saved' || activeTab === 'completed';
          if (!isFilterActive || topicResources.length > 0) {
            topicGroups.push({
              topic,
              resources: topicResources,
              completedCount
            });
          }
        }

        if (topicGroups.length > 0) {
          const totalResources = topicGroups.reduce((acc, tg) => acc + tg.resources.length, 0);
          const completedResources = topicGroups.reduce((acc, tg) => acc + tg.completedCount, 0);
          courseGroups.push({
            course,
            topicGroups,
            totalResources,
            completedResources
          });
        }
      }

      const totalResources = courseGroups.reduce((acc, cg) => acc + cg.totalResources, 0);
      const completedResources = courseGroups.reduce((acc, cg) => acc + cg.completedResources, 0);
      const totalTopics = courseGroups.reduce((acc, cg) => acc + cg.topicGroups.length, 0);

      // Only include domain if it has resources or if directly selected
      const isFilterActive = isFiltered || activeTab === 'saved' || activeTab === 'completed';
      if (!isFilterActive || totalResources > 0) {
        domainGroups.push({
          domain,
          courseGroups,
          totalTopics,
          totalResources,
          completedResources,
          isUserDomain: currentUser?.selectedDomainId === domain.id
        });
      }
    }

    return domainGroups;
  }, [
    domains, 
    activeTab, 
    domainMap, 
    allCourses, 
    allTopics, 
    filteredResources, 
    sortOption, 
    isFiltered, 
    completedIds, 
    currentUser?.selectedDomainId
  ]);

  // Collapse / Expand toggle helpers
  const toggleCourseCollapse = (courseId: string) => {
    setCollapsedCourseIds(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const expandAllCourses = () => {
    setCollapsedCourseIds(new Set());
  };

  const collapseAllCourses = () => {
    const allCourseIds = new Set(allCourses.map(c => c.id));
    setCollapsedCourseIds(allCourseIds);
  };

  // Quick Tag click handler
  const handleQuickTag = (tag: string) => {
    if (tag === 'All') {
      setSearchQuery('');
      setSelectedType('all');
      setSelectedDifficulty('all');
    } else if (tag === 'Videos') {
      setSelectedType('video');
    } else if (tag === 'Beginner Friendly') {
      setSelectedDifficulty('beginner');
    } else {
      setSearchQuery(tag);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setActiveTab(currentUser?.selectedDomainId || 'all');
    setSortOption('curriculum');
  };

  // Format Badges & Colors helper
  const getFormatBadge = (type: ResourceType) => {
    switch (type) {
      case 'documentation':
        return {
          label: 'Documentation',
          icon: <BookOpen className="w-3.5 h-3.5 text-sky-400" />,
          classes: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
        };
      case 'video':
        return {
          label: 'Video Class',
          icon: <Video className="w-3.5 h-3.5 text-rose-400" />,
          classes: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        };
      case 'practice':
        return {
          label: 'Hands-on Lab',
          icon: <Code2 className="w-3.5 h-3.5 text-emerald-400" />,
          classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        };
      case 'article':
        return {
          label: 'Deep Dive',
          icon: <FileText className="w-3.5 h-3.5 text-amber-400" />,
          classes: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        };
      case 'quiz':
        return {
          label: 'Knowledge Check',
          icon: <HelpCircle className="w-3.5 h-3.5 text-purple-400" />,
          classes: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
        };
      default:
        return {
          label: 'Resource',
          icon: <BookOpen className="w-3.5 h-3.5 text-blue-400" />,
          classes: 'bg-blue-500/10 text-blue-300 border-blue-500/30'
        };
    }
  };

  const getDifficultyBadge = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    switch (difficulty) {
      case 'beginner':
        return { label: 'Beginner', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'intermediate':
        return { label: 'Intermediate', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
      case 'advanced':
        return { label: 'Advanced', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white border border-blue-500/30 shadow-2xl px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. HERO BANNER - Inspired by LetsUpgrade Free Learning Hub */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Soft atmospheric gradient accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>LetsUpgrade-Inspired Learning Vault • 100% Free</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Curated Study Kits & Learning Vault
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Master essential engineering concepts with industry-vetted documentation, video masterclasses, interactive coding sandboxes, and cheat sheets — organized directly into your personalized learning pathway.
            </p>

            {/* Quick Stats bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span><strong className="text-white font-bold">{allResources.length}</strong> Total Resources</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-emerald-400 font-bold">{completedIds.length}</strong> Studied</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                <Star className="w-4 h-4 text-amber-400" />
                <span><strong className="text-amber-400 font-bold">{bookmarkedIds.length}</strong> in Library</span>
              </div>

              {currentUser?.selectedDomainId && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Enrolled: {domainMap.get(currentUser.selectedDomainId)?.name}</span>
                </div>
              )}

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-xs font-semibold text-blue-200 hover:text-white transition-colors cursor-pointer shadow-xs"
                title="Export your current personalized roadmap to a clean, printable PDF"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Roadmap (PDF)</span>
              </button>
            </div>
          </div>

          {/* Quick Action Spotlight Card / Search Highlight */}
          {featuredResource && (
            <div className="lg:w-80 shrink-0 bg-slate-900/90 border border-blue-500/30 hover:border-blue-400/50 transition-all rounded-2xl p-4 shadow-xl relative group">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wide border border-amber-500/30">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Editor's Choice
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {featuredResource.durationOrReadTime}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1 mb-1">
                {featuredResource.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {featuredResource.description}
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={featuredResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Start Learning</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => onOpenTopicById(featuredResource.topicId)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
                  title="View this topic in the Roadmap"
                >
                  Roadmap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. DISCOVERY & SEARCH BAR WITH QUICK TAGS (LetsUpgrade Signature Bar) */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, framework, source (e.g. React, Python, LeetCode, Harvard, Docker)..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/5 text-white placeholder:text-slate-400 backdrop-blur-md transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('pathway')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'pathway'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Pathway Structure View (Sequential Modules & Topics)"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Pathway Structure</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Explore Grid</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dense Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Quick Table</span>
            </button>
          </div>
        </div>

        {/* Quick Search Tags Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0">Popular:</span>
          {QUICK_TAGS.map(tag => {
            const isSelected = 
              (tag === 'All' && searchQuery === '' && selectedType === 'all' && selectedDifficulty === 'all') ||
              (tag === 'Videos' && selectedType === 'video') ||
              (tag === 'Beginner Friendly' && selectedDifficulty === 'beginner') ||
              searchQuery.toLowerCase() === tag.toLowerCase();

            return (
              <button
                key={tag}
                onClick={() => handleQuickTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. LETS-UPGRADE TRACK NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Career Tracks</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono">
            {allResources.length}
          </span>
        </button>

        {domains.map(domain => {
          const count = allResources.filter(r => {
            const t = topicMap.get(r.topicId);
            return t?.domainId === domain.id;
          }).length;

          const isSelected = activeTab === domain.id;
          const isUserDomain = currentUser?.selectedDomainId === domain.id;

          return (
            <button
              key={domain.id}
              onClick={() => setActiveTab(domain.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{domain.name}</span>
              {isUserDomain && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Your enrolled track" />
              )}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono">
                {count}
              </span>
            </button>
          );
        })}

        {/* My Saved Library Tab */}
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${activeTab === 'saved' ? 'fill-white' : 'text-amber-400'}`} />
          <span>My Saved Library</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono">
            {bookmarkedIds.length}
          </span>
        </button>

        {/* Completed Tab */}
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Completed ({completedIds.length})</span>
        </button>
      </div>

      {/* 4. SUB-FILTER CHIPS & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Format Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="documentation">Documentation & Guides</option>
              <option value="video">Video Masterclasses</option>
              <option value="practice">Hands-on Labs & Coding</option>
              <option value="article">Deep Dive Articles</option>
              <option value="quiz">Concept Quizzes</option>
            </select>
          </div>

          {/* Level Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Level:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner Friendly</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced Specialist</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="curriculum">Roadmap Order</option>
              <option value="duration-asc">Shortest Time First</option>
              <option value="duration-desc">Longest Deep Dive First</option>
              <option value="title-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Reset Button */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">
            Showing <strong className="text-white font-semibold">{sortedResources.length}</strong> resources
          </span>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. MAIN CONTENT AREA */}

      {/* EMPTY STATE */}
      {sortedResources.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Resources Found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              No learning items match your active filters or search term "{searchQuery}". Try clearing filters or exploring other career tracks.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* VIEW 1: EXPLORE GRID (LetsUpgrade Clean Card Layout) */}
      {viewMode === 'grid' && sortedResources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedResources.map(res => {
            const isBookmarked = bookmarkedIds.includes(res.id);
            const isDone = completedIds.includes(res.id);
            const badge = getFormatBadge(res.type);
            const diff = getDifficultyBadge(res.difficulty);
            const topic = topicMap.get(res.topicId);
            const course = topic ? courseMap.get(topic.courseId) : null;

            return (
              <div
                key={res.id}
                className="bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 hover:border-blue-500/40 p-5 flex flex-col justify-between transition-all duration-200 group shadow-md hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="space-y-3">
                  {/* Top Bar: Format Badge, Difficulty, and Quick Action Toggles */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${badge.classes}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${diff.color}`}>
                        {diff.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Bookmark toggle */}
                      <button
                        onClick={(e) => toggleBookmark(res.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked 
                            ? 'text-amber-400 bg-amber-500/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                        title={isBookmarked ? 'Saved in library' : 'Save to library'}
                      >
                        <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Completed toggle */}
                      <button
                        onClick={(e) => toggleCompleted(res.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDone 
                            ? 'text-emerald-400 bg-emerald-500/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                        title={isDone ? 'Completed' : 'Mark as done'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Resource Title */}
                  <h3 
                    onClick={() => setPreviewResource(res)}
                    className="font-bold text-white text-sm leading-snug group-hover:text-blue-300 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {res.title}
                  </h3>

                  {/* Description preview */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Course / Topic Roadmap Context Pill */}
                  {topic && (
                    <div className="pt-1">
                      <button
                        onClick={() => onOpenTopicById(topic.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-blue-300 text-[11px] font-medium border border-white/5 transition-colors cursor-pointer max-w-full truncate"
                        title="Jump to associated curriculum topic"
                      >
                        <Compass className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{course?.title ? `${course.title} › ` : ''}{topic.title}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Meta & Actions */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 truncate">
                    <span className="text-slate-300 font-semibold truncate">{res.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {res.durationOrReadTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setPreviewResource(res)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <span>Access</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: STEP-BY-STEP CURRICULUM FLOW (Pathway Mode - Grouped in Order) */}
      {viewMode === 'pathway' && sortedResources.length > 0 && (
        <div className="space-y-8">
          {/* Pathway Controls & Overview Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Structured Pathway Progression
              </span>
              <span className="text-xs text-slate-400">
                ({pathwayDomainGroups.length} {pathwayDomainGroups.length === 1 ? 'Career Path' : 'Career Paths'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={expandAllCourses}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Expand all modules"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Expand All</span>
              </button>
              <button
                onClick={collapseAllCourses}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Collapse all modules"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Collapse All</span>
              </button>
            </div>
          </div>

          {pathwayDomainGroups.map(domainGroup => {
            const { domain, courseGroups, totalResources, completedResources, totalTopics, isUserDomain } = domainGroup;
            const domainPercent = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

            return (
              <div 
                key={domain.id} 
                className="space-y-4 rounded-3xl border border-white/15 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl shadow-xl"
              >
                {/* Domain / Pathway Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                      <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        {domain.name}
                      </h2>
                      {isUserDomain && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                          <Award className="w-3 h-3" />
                          Enrolled Track
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {domain.description}
                    </p>
                  </div>

                  {/* Pathway Progress Card */}
                  <div className="shrink-0 flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">
                        {completedResources} / {totalResources} Completed
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {courseGroups.length} Stages • {totalTopics} Steps
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center font-mono text-xs font-extrabold text-blue-400 bg-blue-500/10">
                      {domainPercent}%
                    </div>
                  </div>
                </div>

                {/* Modules in Curriculum Order */}
                <div className="space-y-4 pt-2">
                  {courseGroups.map(({ course, topicGroups, totalResources: courseResCount, completedResources: courseCompletedCount }) => {
                    const isCollapsed = collapsedCourseIds.has(course.id);
                    const coursePercent = courseResCount > 0 ? Math.round((courseCompletedCount / courseResCount) * 100) : 0;

                    return (
                      <div 
                        key={course.id}
                        className="bg-slate-900/80 rounded-2xl border border-white/10 overflow-hidden shadow-md transition-all duration-200"
                      >
                        {/* Course / Module Header Banner */}
                        <div 
                          onClick={() => toggleCourseCollapse(course.id)}
                          className="bg-slate-950/90 px-4 sm:px-5 py-3.5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-950 transition-colors select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-400/30 shrink-0">
                              Module {course.order}
                            </span>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                                <span>{course.title}</span>
                                {courseCompletedCount === courseResCount && courseResCount > 0 && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </h3>
                              <p className="text-xs text-slate-400 line-clamp-1">{course.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            {/* Course Progress pill */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400 text-[11px]">
                                <strong className="text-slate-200 font-semibold">{courseCompletedCount}</strong>/{courseResCount} items
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                  style={{ width: `${coursePercent}%` }}
                                />
                              </div>
                            </div>

                            <button 
                              type="button"
                              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                              aria-label={isCollapsed ? "Expand module" : "Collapse module"}
                            >
                              {isCollapsed ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Topics & Resources under this Course Module */}
                        {!isCollapsed && (
                          <div className="p-4 sm:p-5 space-y-6 divide-y divide-white/5">
                            {topicGroups.map(({ topic, resources: topicResources, completedCount: topicDoneCount }) => (
                              <div key={topic.id} className="pt-5 first:pt-0 space-y-3">
                                {/* Topic Progression Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                                      {topic.order}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-100">
                                      {topic.title}
                                    </h4>
                                    <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                                      ~{topic.estimatedMinutes}m duration
                                    </span>
                                    {topicResources.length > 0 && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                                        {topicDoneCount}/{topicResources.length} Studied
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => onOpenTopicById(topic.id)}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <span>Open Topic in Roadmap</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Curated Resources under this Topic */}
                                {topicResources.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 sm:pl-8">
                                    {topicResources.map(res => {
                                      const isDone = completedIds.includes(res.id);
                                      const isBookmarked = bookmarkedIds.includes(res.id);
                                      const badge = getFormatBadge(res.type);
                                      const diff = getDifficultyBadge(res.difficulty);

                                      return (
                                        <div 
                                          key={res.id}
                                          className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all duration-200 group ${
                                            isDone 
                                              ? 'bg-emerald-950/20 border-emerald-500/30' 
                                              : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-blue-500/40'
                                          }`}
                                        >
                                          <div className="space-y-2">
                                            {/* Top row: Format Badge, Difficulty, Actions */}
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex items-center gap-1.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${badge.classes}`}>
                                                  {badge.icon}
                                                  <span>{badge.label}</span>
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${diff.color}`}>
                                                  {diff.label}
                                                </span>
                                              </div>

                                              <div className="flex items-center gap-1">
                                                <button
                                                  onClick={(e) => toggleBookmark(res.id, e)}
                                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                    isBookmarked 
                                                      ? 'text-amber-400 bg-amber-500/20' 
                                                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                                  }`}
                                                  title={isBookmarked ? 'Saved in library' : 'Save to library'}
                                                >
                                                  <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                                                </button>

                                                <button
                                                  onClick={(e) => toggleCompleted(res.id, e)}
                                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                    isDone 
                                                      ? 'text-emerald-400 bg-emerald-500/20' 
                                                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                                  }`}
                                                  title={isDone ? 'Completed' : 'Mark as done'}
                                                >
                                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* Title */}
                                            <h5 
                                              onClick={() => setPreviewResource(res)}
                                              className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                                            >
                                              {res.title}
                                            </h5>

                                            {/* Description snippet */}
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                              {res.description}
                                            </p>
                                          </div>

                                          {/* Footer: Publisher, Duration, Quick Preview & Access Link */}
                                          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                                            <div className="flex items-center gap-2 truncate">
                                              <span className="font-medium text-slate-300 truncate">{res.source}</span>
                                              <span>•</span>
                                              <span className="shrink-0">{res.durationOrReadTime}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <button
                                                onClick={() => setPreviewResource(res)}
                                                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
                                                title="Preview details"
                                              >
                                                Preview
                                              </button>

                                              <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
                                                title="Open resource in new tab"
                                              >
                                                <span>Access</span>
                                                <ExternalLink className="w-3 h-3" />
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="pl-0 sm:pl-8 text-xs text-slate-400 italic py-2">
                                    No curated resources match active filters for this step.
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: COMPACT TABLE VIEW */}
      {viewMode === 'table' && sortedResources.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-white/10 font-semibold">
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Publisher</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedResources.map(res => {
                  const isDone = completedIds.includes(res.id);
                  const isBookmarked = bookmarkedIds.includes(res.id);
                  const badge = getFormatBadge(res.type);
                  const diff = getDifficultyBadge(res.difficulty);
                  const topic = topicMap.get(res.topicId);

                  return (
                    <tr key={res.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                        <div 
                          onClick={() => setPreviewResource(res)}
                          className="font-bold text-white hover:text-blue-300 transition-colors truncate cursor-pointer"
                        >
                          {res.title}
                        </div>
                        {topic && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            Topic: {topic.title}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium ${badge.classes}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${diff.color}`}>
                          {diff.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {res.durationOrReadTime}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-medium">
                        {res.source}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => toggleBookmark(res.id, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isBookmarked ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Save"
                          >
                            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                          </button>

                          <button
                            onClick={(e) => toggleCompleted(res.id, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDone ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Done"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. RESOURCE QUICK PREVIEW MODAL */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const badge = getFormatBadge(previewResource.type);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold ${badge.classes}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  );
                })()}

                {(() => {
                  const diff = getDifficultyBadge(previewResource.difficulty);
                  return (
                    <span className={`px-2.5 py-1 rounded-xl border text-xs font-medium ${diff.color}`}>
                      {diff.label}
                    </span>
                  );
                })()}
              </div>

              <button
                onClick={() => setPreviewResource(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white leading-snug">
                {previewResource.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="font-semibold text-slate-300">Publisher: {previewResource.source}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {previewResource.durationOrReadTime}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
              <span className="text-slate-400 text-xs font-semibold block">Overview & Learning Objectives:</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {previewResource.description}
              </p>
            </div>

            {/* Associated Curriculum Topic */}
            {(() => {
              const topic = topicMap.get(previewResource.topicId);
              const course = topic ? courseMap.get(topic.courseId) : null;
              if (!topic) return null;

              return (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs">
                  <div>
                    <span className="text-[11px] text-blue-300 font-medium block">Associated Roadmap Step:</span>
                    <span className="text-white font-bold">{course?.title ? `${course.title} › ` : ''}{topic.title}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPreviewResource(null);
                      onOpenTopicById(topic.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>View Step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(previewResource.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    bookmarkedIds.includes(previewResource.id)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${bookmarkedIds.includes(previewResource.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{bookmarkedIds.includes(previewResource.id) ? 'Saved' : 'Save to Library'}</span>
                </button>

                <button
                  onClick={() => toggleCompleted(previewResource.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    completedIds.includes(previewResource.id)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{completedIds.includes(previewResource.id) ? 'Completed' : 'Mark as Done'}</span>
                </button>
              </div>

              <a
                href={previewResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-500/20"
              >
                <span>Launch Resource</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRINTABLE ROADMAP PDF EXPORT MODAL */}
      {(() => {
        const printDomain = (currentUser?.selectedDomainId ? domainMap.get(currentUser.selectedDomainId) : null) || domains[0];
        if (!printDomain) return null;

        return (
          <RoadmapPrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            domain={printDomain}
            courses={allCourses.filter(c => c.domainId === printDomain.id)}
            topics={allTopics.filter(t => t.domainId === printDomain.id)}
            userProgress={currentUser ? storageService.getUserProgress(currentUser.id) : []}
            resources={allResources}
          />
        );
      })()}
    </div>
  );
};
