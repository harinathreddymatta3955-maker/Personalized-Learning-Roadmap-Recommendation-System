import React, { useState, useEffect } from 'react';
import { Resource } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Star, 
  CheckCircle2, 
  Clock, 
  Compass, 
  BookOpen, 
  Video, 
  FileText, 
  Code2, 
  HelpCircle, 
  AlertCircle,
  Share2,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface ResourceViewerModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTopicById?: (topicId: string) => void;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=0&rel=0`;
      if (parsed.pathname.startsWith('/embed/')) return url;
    } else if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('?')[0];
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
  } catch {
    return null;
  }
  return null;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  resource,
  isOpen,
  onClose,
  onOpenTopicById
}) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'user-1';

  const [copied, setCopied] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Sync state on resource open
  useEffect(() => {
    if (resource && isOpen) {
      setPopupBlocked(false);
      setCopied(false);
      const bookmarks = storageService.getBookmarkedResources(userId);
      setIsBookmarked(bookmarks.includes(resource.id));
      const completed = storageService.getCompletedResources(userId);
      setIsCompleted(completed.includes(resource.id));
    }
  }, [resource, isOpen, userId]);

  if (!isOpen || !resource) return null;

  const topics = storageService.getTopics();
  const courses = storageService.getCourses();
  const topic = topics.find(t => t.id === resource.topicId);
  const course = topic ? courses.find(c => c.id === topic.courseId) : null;

  const embedUrl = getYouTubeEmbedUrl(resource.url);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resource.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenExternal = () => {
    try {
      const win = window.open(resource.url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        setPopupBlocked(true);
      } else {
        setPopupBlocked(false);
      }
    } catch {
      setPopupBlocked(true);
    }
  };

  const toggleBookmark = () => {
    const updated = storageService.toggleBookmarkResource(userId, resource.id);
    setIsBookmarked(updated);
  };

  const toggleCompleted = () => {
    const updated = storageService.toggleCompleteResource(userId, resource.id);
    setIsCompleted(updated);
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'documentation':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'article':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'practice':
        return <Code2 className="w-4 h-4 text-purple-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-white/10 relative max-h-[92vh] flex flex-col text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
          <div className="space-y-1.5 flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {getResourceTypeIcon(resource.type)}
                <span>{resource.type}</span>
              </span>

              <span className="text-xs text-slate-400 font-medium">
                {resource.source}
              </span>

              <span className="text-slate-600">•</span>

              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {resource.durationOrReadTime}
              </span>

              <span className="text-slate-600">•</span>

              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-white/10 text-slate-300 border border-white/10">
                {resource.difficulty}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {resource.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Embedded YouTube Player if video */}
          {embedUrl ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-lg">
              <iframe
                src={embedUrl}
                title={resource.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-transparent border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Verified Educational Content
                </span>
                <span className="text-[11px] text-slate-400">{resource.source}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {resource.description}
              </p>
            </div>
          )}

          {/* Fallback alert if browser popup was blocked */}
          {popupBlocked && (
            <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-300">Popup Blocked by Browser</span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed mt-0.5">
                    Your browser or iframe environment blocked opening this window automatically. Click the button below to open the link directly, or copy the destination URL.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Open URL Directly</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied URL!' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Description overview if embedded video */}
          {embedUrl && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs">
              <span className="font-semibold text-slate-300 block">Lesson Description:</span>
              <p className="text-slate-400 leading-relaxed">{resource.description}</p>
            </div>
          )}

          {/* Curriculum Link */}
          {topic && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="text-[11px] text-blue-300 font-medium block">
                  Curriculum Placement:
                </span>
                <span className="text-white font-bold truncate block">
                  {course ? `${course.title} › ` : ''}{topic.title}
                </span>
              </div>

              {onOpenTopicById && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTopicById(topic.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer text-xs"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Roadmap Step</span>
                </button>
              )}
            </div>
          )}

          {/* Direct Destination Link Display */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-400 truncate text-[11px]">
              {resource.url}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center gap-1 shrink-0 transition-colors text-[11px] cursor-pointer"
              title="Copy destination link to clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleBookmark}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save to Library'}</span>
            </button>

            <button
              type="button"
              onClick={toggleCompleted}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isCompleted ? 'Completed' : 'Mark as Done'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenExternal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <span>Launch in New Window</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
