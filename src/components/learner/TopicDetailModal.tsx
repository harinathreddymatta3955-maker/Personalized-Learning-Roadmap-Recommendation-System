import React, { useState, useEffect } from 'react';
import { Topic, Course, Domain, Resource, ResourceType } from '../../types';
import { storageService } from '../../services/storageService';
import { recommendationEngine } from '../../services/recommendationEngine';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Video, 
  FileText, 
  Code2, 
  HelpCircle, 
  ExternalLink, 
  Sparkles,
  Check,
  RotateCcw,
  Play,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopicDetailModalProps {
  topic: Topic | null;
  course?: Course;
  domain?: Domain;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged: () => void;
  onSelectTopic?: (topic: Topic) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  course,
  domain,
  userId,
  isOpen,
  onClose,
  onStatusChanged,
  onSelectTopic
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'quiz' | 'notes'>('resources');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  
  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const lockInfo = topic ? recommendationEngine.getTopicLockInfo(userId, topic) : { isLocked: false, unmetPrereqTopics: [], unmetPrereqCourses: [] };

  // Automatically mark topic as in_progress when opened by the learner if unlocked and not already started
  useEffect(() => {
    if (isOpen && topic && !lockInfo.isLocked) {
      const userProgressList = storageService.getUserProgress(userId);
      const currentProgress = userProgressList.find(p => p.topicId === topic.id);
      if (!currentProgress) {
        storageService.setUserTopicStatus(userId, topic.id, 'in_progress');
        storageService.logActivity({
          userId,
          action: 'started_topic',
          topicId: topic.id,
          topicTitle: topic.title,
          domainId: topic.domainId,
          details: 'Started studying topic'
        });
        onStatusChanged();
      }
    }
  }, [isOpen, topic?.id, userId, lockInfo.isLocked]);

  if (!isOpen || !topic) return null;

  // Render locked notice if topic is not unlocked in the sequential pathway
  if (lockInfo.isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative text-slate-100 text-center space-y-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Sequential Learning Lock
            </span>
            <h2 className="text-xl font-bold text-white pt-1">{topic.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lockInfo.reason || 'This topic is locked until preceding topics are completed.'}
            </p>
          </div>

          {lockInfo.previousTopic && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Required Prerequisite:
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-white truncate">
                  {lockInfo.previousTopic.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 shrink-0">
                  Prerequisite Topic
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            {lockInfo.previousTopic && onSelectTopic && (
              <button
                onClick={() => {
                  onSelectTopic(lockInfo.previousTopic!);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                Go to "{lockInfo.previousTopic.title}"
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              Return to Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resources = storageService.getResourcesByTopic(topic.id);
  const quizzes = storageService.getQuizzesByTopic(topic.id);
  const userProgressList = storageService.getUserProgress(userId);
  const currentProgress = userProgressList.find(p => p.topicId === topic.id);
  const isCompleted = currentProgress?.status === 'completed';

  const filteredResources = resourceFilter === 'all' 
    ? resources 
    : resources.filter(r => r.type === resourceFilter);

  const handleToggleCompleted = () => {
    const newStatus = isCompleted ? 'in_progress' : 'completed';
    storageService.setUserTopicStatus(userId, topic.id, newStatus, quizScore || undefined);
    
    storageService.logActivity({
      userId,
      action: newStatus === 'completed' ? 'completed_topic' : 'started_topic',
      topicId: topic.id,
      topicTitle: topic.title,
      domainId: topic.domainId,
      details: newStatus === 'completed' ? 'Marked topic completed by learner' : 'Reopened topic'
    });

    if (newStatus === 'completed') {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }

    onStatusChanged();
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizzes.length === 0) return;

    let correctCount = 0;
    quizzes.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / quizzes.length) * 100);
    setQuizScore(scorePercent);
    setQuizSubmitted(true);

    if (scorePercent >= 70) {
      storageService.setUserTopicStatus(userId, topic.id, 'completed', scorePercent);
      storageService.logActivity({
        userId,
        action: 'passed_quiz',
        topicId: topic.id,
        topicTitle: topic.title,
        domainId: topic.domainId,
        details: `Passed quiz with ${scorePercent}% score`
      });
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch {
        // ignore
      }
      onStatusChanged();
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'documentation':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'article':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'practice':
        return <Code2 className="w-4 h-4 text-emerald-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative my-6 max-h-[90vh] flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs">
              <span className="font-semibold text-blue-400 uppercase tracking-wide">
                {domain?.name || 'Curriculum'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{course?.title || 'Course Module'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{topic.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{topic.estimatedMinutes} mins study time
              </span>
              <span>•</span>
              <div className="flex flex-wrap gap-1">
                {topic.keySkills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 font-medium text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleCompleted}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 pt-3 border-b border-white/10 text-sm font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'resources'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curated Resources ({resources.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'quiz'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Quiz ({quizzes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Topic Overview</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* TAB 1: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-3">
              {/* Filter pills */}
              <div className="flex flex-wrap gap-1.5 pb-2 text-xs">
                {['all', 'documentation', 'video', 'article', 'practice'].map(type => (
                  <button
                    key={type}
                    onClick={() => setResourceFilter(type)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition-all cursor-pointer ${
                      resourceFilter === type
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {filteredResources.length > 0 ? (
                <div className="space-y-3">
                  {filteredResources.map(res => (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-white/10 hover:border-blue-400/40 hover:bg-white/[0.06] transition-all bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-white/10 border border-white/10">
                            {getResourceIcon(res.type)}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            {res.type}
                          </span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs font-medium text-slate-400">{res.source}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/10 text-slate-300 capitalize border border-white/10">
                            {res.difficulty}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{res.title}</h4>
                        <p className="text-xs text-slate-300">{res.description}</p>
                        <span className="text-[11px] text-slate-400 block pt-0.5">
                          Est. Duration: {res.durationOrReadTime}
                        </span>
                      </div>

                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start sm:self-center shrink-0 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        <span>Open Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-xl border border-dashed border-white/20">
                  <p className="text-sm text-slate-400">No resources found matching this filter.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERACTIVE QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {quizzes.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-xl border border-dashed border-white/20">
                  <p className="text-sm text-slate-400">No quiz questions generated for this topic yet.</p>
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit} className="space-y-5">
                  {quizzes.map((q, qIndex) => {
                    const selectedOpt = selectedAnswers[q.id];
                    const isAnswered = selectedOpt !== undefined;

                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                            Q{qIndex + 1}
                          </span>
                          <h4 className="font-semibold text-white text-sm">{q.question}</h4>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIndex) => {
                            const isChosen = selectedOpt === optIndex;
                            let optionClass = 'border-white/10 bg-white/5 hover:border-white/20 text-slate-200';

                            if (quizSubmitted) {
                              if (optIndex === q.correctIndex) {
                                optionClass = 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-semibold';
                              } else if (isChosen && optIndex !== q.correctIndex) {
                                optionClass = 'border-rose-500/40 bg-rose-500/20 text-rose-300';
                              }
                            } else if (isChosen) {
                              optionClass = 'border-blue-500 bg-blue-500/20 text-white font-medium ring-1 ring-blue-500/40';
                            }

                            return (
                              <label
                                key={optIndex}
                                onClick={() => handleAnswerSelect(q.id, optIndex)}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${optionClass}`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-${q.id}`}
                                  checked={isChosen}
                                  onChange={() => handleAnswerSelect(q.id, optIndex)}
                                  disabled={quizSubmitted}
                                  className="text-blue-500 focus:ring-blue-400 bg-slate-800 border-white/20"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                            <span className="font-bold text-white">Explanation:</span>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Submission and score bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {quizSubmitted ? (
                      <div className="flex items-center gap-3">
                        <div className={`text-sm font-bold px-3 py-1.5 rounded-xl border ${
                          (quizScore || 0) >= 70 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          Score: {quizScore}% {((quizScore || 0) >= 70) ? '— Passed! 🎉' : '— Needs Review'}
                        </div>
                        <button
                          type="button"
                          onClick={resetQuiz}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retry Quiz
                        </button>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={Object.keys(selectedAnswers).length < quizzes.length}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                      >
                        Submit Answers for Grading
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: TOPIC OVERVIEW */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm">Description & Learning Objectives</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{topic.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm">Key Skill Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {topic.keySkills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {topic.prerequisiteTopicIds.length > 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-sm">Direct Prerequisites</h4>
                  <p className="text-xs text-slate-400">
                    Mastery of earlier concepts ensures smooth comprehension of this topic.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
