import React, { useState, useEffect } from 'react';
import { Domain, DomainExtraResource, DomainImportantProblem } from '../../types';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  Award, 
  ExternalLink, 
  FileText, 
  BookOpen, 
  Save, 
  AlertCircle,
  HelpCircle,
  Clock,
  Tag
} from 'lucide-react';

interface DomainCapstoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: Domain;
  extraResource: DomainExtraResource;
  isDomainCompleted: boolean;
}

export const DomainCapstoneModal: React.FC<DomainCapstoneModalProps> = ({
  isOpen,
  onClose,
  domain,
  extraResource,
  isDomainCompleted
}) => {
  const [activeProblemId, setActiveProblemId] = useState<string>(
    extraResource.problems[0]?.id || ''
  );
  
  // Set of revealed hint IDs: e.g. 'h-aiml-1-1'
  const [revealedHintIds, setRevealedHintIds] = useState<Set<string>>(new Set());

  // Personal notes per problem
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(`plrrs_capstone_notes_${domain.id}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Practiced problems set (optional self-tracking)
  const [practicedProblemIds, setPracticedProblemIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(`plrrs_capstone_practiced_${domain.id}`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [savedNotesToast, setSavedNotesToast] = useState<boolean>(false);

  useEffect(() => {
    if (extraResource.problems.length > 0 && !activeProblemId) {
      setActiveProblemId(extraResource.problems[0].id);
    }
  }, [extraResource, activeProblemId]);

  if (!isOpen) return null;

  const currentProblem = extraResource.problems.find(p => p.id === activeProblemId) || extraResource.problems[0];

  const toggleHint = (hintId: string) => {
    setRevealedHintIds(prev => {
      const next = new Set(prev);
      if (next.has(hintId)) {
        next.delete(hintId);
      } else {
        next.add(hintId);
      }
      return next;
    });
  };

  const handleNotesChange = (text: string) => {
    if (!currentProblem) return;
    const updated = { ...notes, [currentProblem.id]: text };
    setNotes(updated);
    try {
      localStorage.setItem(`plrrs_capstone_notes_${domain.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSaveNotes = () => {
    setSavedNotesToast(true);
    setTimeout(() => setSavedNotesToast(false), 2000);
  };

  const togglePracticed = (problemId: string) => {
    setPracticedProblemIds(prev => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        next.delete(problemId);
      } else {
        next.add(problemId);
      }
      try {
        localStorage.setItem(`plrrs_capstone_practiced_${domain.id}`, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-amber-500/30 text-white shadow-2xl shadow-amber-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-purple-500/10 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Domain Extra Resource</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Domain 100% Completed</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-slate-300 border border-white/10">
                Optional Capstone
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {extraResource.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              {extraResource.subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Guidance Ribbon */}
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Hints Only Architecture:</strong> This extra resource provides guided hints only — solutions are intentionally omitted to cultivate authentic problem-solving.
            </span>
          </div>
          <span className="text-[11px] text-amber-300/80 italic shrink-0">
            *Optional: Your domain remains completed even if left untouched.
          </span>
        </div>

        {/* Modal Body: Left Problem Selector + Right Problem Details */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {/* Left Column: Problem List (4 cols) */}
          <div className="lg:col-span-4 p-4 space-y-3 bg-white/[0.01]">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span>CURATED PROBLEMS ({extraResource.problems.length})</span>
              <span>{practicedProblemIds.size} practiced</span>
            </div>

            <div className="space-y-2">
              {extraResource.problems.map((prob, idx) => {
                const isActive = prob.id === activeProblemId;
                const isPracticed = practicedProblemIds.has(prob.id);

                return (
                  <button
                    key={prob.id}
                    onClick={() => setActiveProblemId(prob.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10 text-white'
                        : 'bg-white/5 border-white/10 hover:bg-white/[0.08] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Problem {idx + 1} • {prob.difficulty}
                      </span>
                      {isPracticed && (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Practiced
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                      {prob.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {prob.estimatedEffort}
                      </span>
                      <span>•</span>
                      <span>{prob.hints.length} hints available</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Key Competencies Summary */}
            <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Target Competencies Mastered
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {extraResource.keyCompetencies.map(comp => (
                  <li key={comp} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Problem Scenario, Inquiries & Hints (8 cols) */}
          <div className="lg:col-span-8 p-5 sm:p-6 space-y-6 overflow-y-auto">
            {currentProblem ? (
              <>
                {/* Header & Meta */}
                <div className="space-y-2 pb-4 border-b border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {currentProblem.category}
                    </span>
                    <button
                      onClick={() => togglePracticed(currentProblem.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        practicedProblemIds.has(currentProblem.id)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{practicedProblemIds.has(currentProblem.id) ? 'Marked as Practiced' : 'Mark as Practiced'}</span>
                    </button>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {currentProblem.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentProblem.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scenario & Context */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Real-World Scenario & Context</span>
                  </h4>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {currentProblem.scenarioDescription}
                  </div>
                </div>

                {/* Key Questions to Solve */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Key Engineering Questions to Address</span>
                  </h4>
                  <div className="space-y-2">
                    {currentProblem.keyQuestionsToSolve.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/25 flex items-start gap-2.5 text-xs sm:text-sm text-blue-100"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <span className="leading-relaxed">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progressive Hints Section (ONLY hints, NO solutions) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Progressive Hints (No Solutions Provided)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Reveal step-by-step
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentProblem.hints.map(hint => {
                      const isRevealed = revealedHintIds.has(hint.id);

                      return (
                        <div
                          key={hint.id}
                          className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] overflow-hidden transition-all"
                        >
                          <button
                            onClick={() => toggleHint(hint.id)}
                            className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-amber-500/10 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                                {hint.order}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-amber-200">
                                {hint.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                              {isRevealed ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Hide Hint</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Reveal Hint</span>
                                </>
                              )}
                            </div>
                          </button>

                          {isRevealed && (
                            <div className="p-3.5 bg-amber-500/10 border-t border-amber-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed animate-in fade-in duration-150">
                              {hint.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Learner Architectural Notes & Scratchpad */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Your Solution Strategy & Architectural Notes</span>
                    </h4>
                    {savedNotesToast && (
                      <span className="text-xs text-emerald-400 font-semibold animate-in fade-in">
                        ✓ Saved locally
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={notes[currentProblem.id] || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Jot down your architectural approach, tradeoffs, calculations, or pseudocode here. Saved automatically in your browser."
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Notes persist across sessions in local storage.</span>
                    <button
                      onClick={handleManualSaveNotes}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-200 cursor-pointer text-xs"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>

                {/* External References */}
                {extraResource.externalReferences && extraResource.externalReferences.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Recommended Engineering References
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {extraResource.externalReferences.map(ref => (
                        <a
                          key={ref.url}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1.5 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>{ref.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            <span className="font-semibold text-white">{domain.name}</span> Capstone Suite • {extraResource.problems.length} challenging problems
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
