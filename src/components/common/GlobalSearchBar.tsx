import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Topic, Course, Domain, Resource, ResourceType, SearchHistoryItem } from '../../types';
import { 
  Search, 
  X, 
  BookOpen, 
  Layers, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Code2, 
  Video, 
  FileText, 
  HelpCircle, 
  ArrowRight,
  Filter,
  CornerDownLeft,
  Compass,
  History,
  Trash2,
  RotateCcw
} from 'lucide-react';

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

interface GlobalSearchBarProps {
  onOpenTopic?: (topic: Topic) => void;
  onNavigateTab?: (tab: string) => void;
}

type SearchCategory = 'all' | 'topics' | 'courses' | 'resources';

interface SearchResultItem {
  id: string;
  category: 'topic' | 'course' | 'resource';
  title: string;
  description: string;
  domainId: string;
  domainName: string;
  domainColor: string;
  // Topic-specific
  topic?: Topic;
  courseTitle?: string;
  estimatedMinutes?: number;
  keySkills?: string[];
  isCompleted?: boolean;
  // Course-specific
  course?: Course;
  topicCount?: number;
  courseOrder?: number;
  // Resource-specific
  resource?: Resource;
  resourceType?: ResourceType;
  source?: string;
  duration?: string;
  difficulty?: string;
  url?: string;
  parentTopicTitle?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onOpenTopic,
  onNavigateTab
}) => {
  const { currentUser, role, updateUserProfile } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [justCleared, setJustCleared] = useState<boolean>(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to storage service updates
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setSearchHistory(storageService.getSearchHistory());
    });
    return () => unsub();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => {
          const next = !prev;
          if (next) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return next;
        });
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Refresh search history when opened
  useEffect(() => {
    if (isOpen) {
      setSearchHistory(storageService.getSearchHistory());
    } else {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build searchable index
  const { allItems, domains } = useMemo(() => {
    const rawDomains = storageService.getDomains();
    const domainMap = new Map<string, Domain>();
    for (const d of rawDomains) {
      if (d && d.id && !domainMap.has(d.id)) {
        domainMap.set(d.id, d);
      }
    }
    const domainsList = Array.from(domainMap.values()).sort((a, b) => a.order - b.order);
    const coursesList = storageService.getCourses();
    const topicsList = storageService.getTopics();
    const resourcesList = storageService.getResources();
    const userProgress = currentUser ? storageService.getUserProgress(currentUser.id) : [];

    const completedTopicIds = new Set(
      userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
    );

    const courseMap = new Map(coursesList.map(c => [c.id, c]));
    const topicMap = new Map(topicsList.map(t => [t.id, t]));

    const items: SearchResultItem[] = [];

    // 1. Index Topics
    topicsList.forEach(topic => {
      const domain = domainMap.get(topic.domainId);
      const course = courseMap.get(topic.courseId);

      items.push({
        id: `topic-${topic.id}`,
        category: 'topic',
        title: topic.title,
        description: topic.description,
        domainId: topic.domainId,
        domainName: domain ? domain.name : 'General',
        domainColor: domain ? domain.accentColor : '#3b82f6',
        topic,
        courseTitle: course ? course.title : undefined,
        estimatedMinutes: topic.estimatedMinutes,
        keySkills: topic.keySkills,
        isCompleted: completedTopicIds.has(topic.id)
      });
    });

    // 2. Index Courses
    coursesList.forEach(course => {
      const domain = domainMap.get(course.domainId);
      const topicsInCourse = topicsList.filter(t => t.courseId === course.id);

      items.push({
        id: `course-${course.id}`,
        category: 'course',
        title: course.title,
        description: course.description,
        domainId: course.domainId,
        domainName: domain ? domain.name : 'General',
        domainColor: domain ? domain.accentColor : '#3b82f6',
        course,
        topicCount: topicsInCourse.length,
        courseOrder: course.order
      });
    });

    // 3. Index Resources
    resourcesList.forEach(res => {
      const topic = topicMap.get(res.topicId);
      const domain = topic ? domainMap.get(topic.domainId) : undefined;

      items.push({
        id: `resource-${res.id}`,
        category: 'resource',
        title: res.title,
        description: res.description,
        domainId: topic ? topic.domainId : 'domain-aiml',
        domainName: domain ? domain.name : 'General',
        domainColor: domain ? domain.accentColor : '#3b82f6',
        resource: res,
        resourceType: res.type,
        source: res.source,
        duration: res.durationOrReadTime,
        difficulty: res.difficulty,
        url: res.url,
        parentTopicTitle: topic ? topic.title : undefined,
        topic
      });
    });

    return { allItems: items, domains: domainsList };
  }, [currentUser]);

  // Filter items based on query, category, and domain
  const { filteredItems, counts } = useMemo(() => {
    const q = query.trim().toLowerCase();

    // First filter by query and domain
    const matched = allItems.filter(item => {
      // Domain filter
      if (selectedDomainFilter !== 'all' && item.domainId !== selectedDomainFilter) {
        return false;
      }

      // Query filter
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const domainMatch = item.domainName.toLowerCase().includes(q);
      const skillsMatch = item.keySkills?.some(s => s.toLowerCase().includes(q));
      const sourceMatch = item.source?.toLowerCase().includes(q);
      const parentTopicMatch = item.parentTopicTitle?.toLowerCase().includes(q);
      const courseTitleMatch = item.courseTitle?.toLowerCase().includes(q);

      return titleMatch || descMatch || domainMatch || skillsMatch || sourceMatch || parentTopicMatch || courseTitleMatch;
    });

    // Compute category counts
    const topicCount = matched.filter(i => i.category === 'topic').length;
    const courseCount = matched.filter(i => i.category === 'course').length;
    const resourceCount = matched.filter(i => i.category === 'resource').length;

    // Apply category filter
    const finalItems = matched.filter(item => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'topics') return item.category === 'topic';
      if (activeCategory === 'courses') return item.category === 'course';
      if (activeCategory === 'resources') return item.category === 'resource';
      return true;
    });

    return {
      filteredItems: finalItems,
      counts: {
        all: matched.length,
        topics: topicCount,
        courses: courseCount,
        resources: resourceCount
      }
    };
  }, [allItems, query, activeCategory, selectedDomainFilter]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const activeElement = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Search history handlers
  const handleSelectHistoryItem = (historyItem: SearchHistoryItem) => {
    setQuery(historyItem.query);
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = storageService.removeSearchHistoryItem(id);
    setSearchHistory(updated);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.clearSearchHistory();
    setSearchHistory([]);
    setJustCleared(true);
    setTimeout(() => {
      setJustCleared(false);
    }, 3500);
  };

  // Find history items that match current query
  const matchingHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchHistory.filter(h => h.query.toLowerCase().includes(q));
  }, [searchHistory, query]);

  // Handle selection of an item
  const handleSelectItem = (item: SearchResultItem) => {
    // Record into search history
    const updatedHistory = storageService.saveSearchHistory(
      query.trim() || item.title,
      { title: item.title, category: item.category }
    );
    setSearchHistory(updatedHistory);

    // 1. Ensure domain matches user's active domain if necessary
    if (currentUser && currentUser.selectedDomainId !== item.domainId) {
      updateUserProfile({ selectedDomainId: item.domainId });
    }

    if (item.category === 'topic' && item.topic) {
      if (onOpenTopic) {
        onOpenTopic(item.topic);
      }
      if (onNavigateTab) {
        onNavigateTab(role === 'admin' ? 'admin-topics' : 'roadmap');
      }
      setIsOpen(false);
    } else if (item.category === 'course') {
      if (onNavigateTab) {
        onNavigateTab(role === 'admin' ? 'admin-courses' : 'roadmap');
      }
      setIsOpen(false);
    } else if (item.category === 'resource' && item.resource) {
      // If resource has a parent topic, open the topic detail modal with all resources
      if (item.topic && onOpenTopic) {
        onOpenTopic(item.topic);
        if (onNavigateTab) {
          onNavigateTab(role === 'admin' ? 'admin-resources' : 'resources');
        }
      } else if (item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
      setIsOpen(false);
    }
  };

  // Keyboard navigation inside search results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      } else if (query.trim()) {
        const updated = storageService.saveSearchHistory(query.trim());
        setSearchHistory(updated);
      }
    }
  };

  const getResourceIcon = (type?: ResourceType) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'documentation':
        return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'article':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'practice':
        return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'quiz':
        return <HelpCircle className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <>
      {/* 1. Navbar Search Bar Input / Trigger */}
      {/* Mobile Icon Trigger (< md) */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center justify-center"
          title="Search topics, courses, resources"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Desktop/Tablet Full Trigger (>= md) */}
      <div className="hidden md:block relative flex-1 min-w-[140px] max-w-[200px] lg:max-w-[260px] mx-2 shrink">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200 text-xs transition-all backdrop-blur-md group shadow-xs cursor-pointer text-left"
          title="Search all topics, courses, resources (Ctrl+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors shrink-0" />
            <span className="truncate hidden lg:inline">Search courses, topics...</span>
            <span className="truncate lg:hidden">Search...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white/10 text-slate-300 border border-white/15 shrink-0">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* 2. Global Search Overlay / Command Palette */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-12 bg-slate-950/75 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div 
            className="w-full max-w-3xl bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header Input */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
              <Search className="w-5 h-5 text-blue-400 shrink-0" />
              <input
                ref={modalInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search across all learning domains, courses, and resources..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    modalInputRef.current?.focus();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors text-xs font-medium flex items-center gap-1 shrink-0"
              >
                <kbd className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded border border-white/10">Esc</kbd>
              </button>
            </div>

            {/* Category Tabs & Domain Filter Bar */}
            <div className="px-3 sm:px-4 py-2 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 bg-white/[0.01] text-xs">
              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>All</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === 'all' ? 'bg-blue-700/80 text-white' : 'bg-white/10 text-slate-300'
                  }`}>
                    {counts.all}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveCategory('topics');
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'topics'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Topics</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === 'topics' ? 'bg-blue-700/80 text-white' : 'bg-white/10 text-slate-300'
                  }`}>
                    {counts.topics}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveCategory('courses');
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'courses'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Courses</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === 'courses' ? 'bg-blue-700/80 text-white' : 'bg-white/10 text-slate-300'
                  }`}>
                    {counts.courses}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveCategory('resources');
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'resources'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Resources</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === 'resources' ? 'bg-blue-700/80 text-white' : 'bg-white/10 text-slate-300'
                  }`}>
                    {counts.resources}
                  </span>
                </button>
              </div>

              {/* Domain Filter Dropdown */}
              <div className="flex items-center gap-1.5 ml-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedDomainFilter}
                  onChange={(e) => {
                    setSelectedDomainFilter(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="bg-slate-800 text-slate-200 border border-white/15 rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Domains ({domains.length})</option>
                  {domains.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Container */}
            <div 
              ref={resultsContainerRef}
              className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 divide-y divide-white/5"
            >
              {/* If user typed a query and there are matching history searches */}
              {query.trim() && matchingHistory.length > 0 && (
                <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/25 flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-300 font-medium text-[11px] shrink-0">
                    <History className="w-3.5 h-3.5 text-blue-400" />
                    <span>Recent search match:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {matchingHistory.slice(0, 4).map(h => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleSelectHistoryItem(h)}
                        className="px-2 py-0.5 rounded-md bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/30 text-blue-200 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        title={`Re-use search: "${h.query}"`}
                      >
                        <RotateCcw className="w-2.5 h-2.5 opacity-70" />
                        <span>{h.query}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* If query is empty, show Recent Searches (from localStorage), curated suggestions and domain shortcuts */}
              {!query.trim() && (
                <div className="p-3 space-y-4">
                  {/* LocalStorage-based Recent Searches */}
                  {searchHistory.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-blue-400" />
                          <span>Recent Searches</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
                            {searchHistory.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearAllHistory}
                          className="text-[11px] text-slate-400 hover:text-rose-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                          title="Clear all search history"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear History</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchHistory.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectHistoryItem(item)}
                            className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 text-left transition-all flex items-center justify-between cursor-pointer shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                              <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-300 text-slate-400 transition-colors shrink-0">
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-white group-hover:text-blue-300 truncate">
                                  {item.query}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                  <span>{formatRelativeTime(item.timestamp)}</span>
                                  {item.targetCategory && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize text-slate-300 bg-white/5 px-1.5 py-0.2 rounded text-[9px] border border-white/5">
                                        {item.targetCategory}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 opacity-70 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                              title="Remove search"
                              aria-label="Remove search"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-400" />
                      <span>Quick Jump by Domain</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {domains.map(d => (
                        <button
                          key={d.id}
                          onClick={() => {
                            setSelectedDomainFilter(d.id);
                            modalInputRef.current?.focus();
                          }}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shadow-xs" 
                              style={{ backgroundColor: d.accentColor || '#3b82f6' }} 
                            />
                            <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {d.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Filter</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Popular Search Topics & Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Python Fundamentals', 'Neural Networks', 'Docker', 'Kubernetes', 'React Hooks', 'SQL Queries', 'FastAPI', 'Ensemble Methods'].map(term => (
                        <button
                          key={term}
                          onClick={() => {
                            setQuery(term);
                            modalInputRef.current?.focus();
                            const updated = storageService.saveSearchHistory(term);
                            setSearchHistory(updated);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Matched Results List */}
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      data-index={idx}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group p-3 rounded-xl transition-all cursor-pointer border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500/40 shadow-md shadow-blue-500/10'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon based on item category */}
                        <div className="mt-0.5 p-2 rounded-lg bg-white/10 border border-white/10 shrink-0">
                          {item.category === 'topic' && (
                            item.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-blue-400" />
                            )
                          )}
                          {item.category === 'course' && (
                            <Layers className="w-4 h-4 text-indigo-400" />
                          )}
                          {item.category === 'resource' && getResourceIcon(item.resourceType)}
                        </div>

                        {/* Text details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {/* Category Badge */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              item.category === 'topic'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : item.category === 'course'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {item.category}
                            </span>

                            {/* Domain Badge */}
                            <span className="text-[10px] font-medium text-slate-300 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              <span 
                                className="w-1.5 h-1.5 rounded-full shrink-0" 
                                style={{ backgroundColor: item.domainColor }} 
                              />
                              <span className="truncate max-w-[130px]">{item.domainName}</span>
                            </span>

                            {/* Additional metadata tags */}
                            {item.category === 'topic' && item.courseTitle && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                Course: {item.courseTitle}
                              </span>
                            )}

                            {item.category === 'course' && item.topicCount !== undefined && (
                              <span className="text-[10px] text-slate-400">
                                {item.topicCount} Topics
                              </span>
                            )}

                            {item.category === 'resource' && (
                              <>
                                <span className="text-[10px] text-slate-300 bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                                  {item.source}
                                </span>
                                {item.duration && (
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {item.duration}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <div className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors truncate">
                            {item.title}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>

                          {/* Key Skills (for topics) */}
                          {item.keySkills && item.keySkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.keySkills.slice(0, 4).map(skill => (
                                <span 
                                  key={skill} 
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/10"
                                >
                                  {skill}
                                </span>
                              ))}
                              {item.keySkills.length > 4 && (
                                <span className="text-[9px] text-slate-400 self-center">
                                  +{item.keySkills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {item.category === 'resource' && item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-white/10 text-xs flex items-center gap-1 border border-white/10 transition-colors"
                            title="Open external link directly"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <div className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                          isSelected ? 'text-blue-300 font-semibold' : 'text-slate-400'
                        }`}>
                          <span className="hidden sm:inline">Navigate</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                query.trim() && (
                  <div className="text-center py-12 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1">
                      No matching topics, courses, or resources found
                    </div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                      Try searching with a broader keyword, check your spelling, or switch the domain filter to "All Domains".
                    </p>
                    <button
                      onClick={() => {
                        setQuery('');
                        setSelectedDomainFilter('all');
                        setActiveCategory('all');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-colors cursor-pointer"
                    >
                      Clear search filters
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Footer status & shortcuts bar */}
            <div className="p-2.5 sm:px-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] border border-white/10">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] border border-white/10">↓</kbd>
                  <span className="hidden sm:inline ml-0.5">to navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] border border-white/10 flex items-center gap-0.5">
                    <CornerDownLeft className="w-2.5 h-2.5" /> Enter
                  </kbd>
                  <span className="hidden sm:inline ml-0.5">to select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] border border-white/10">Esc</kbd>
                  <span className="hidden sm:inline ml-0.5">to close</span>
                </span>
              </div>

              <div className="text-slate-400 font-medium">
                {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} across {domains.length} domains
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
