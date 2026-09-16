import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { recommendationEngine } from '../../services/recommendationEngine';
import { COMMON_SKILLS_LIST } from '../../data/seedData';
import { 
  X, 
  Sparkles, 
  BrainCircuit, 
  BarChart3, 
  ShieldAlert, 
  Globe, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
  Coffee,
  Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onCompleted
}) => {
  const { currentUser, updateUserProfile } = useAuth();
  const domains = storageService.getDomains();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDomainId, setSelectedDomainId] = useState(
    currentUser?.selectedDomainId || domains[0]?.id || 'domain-aiml'
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentUser?.skills || ['Python', 'SQL', 'Git']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  // Run real-time gap analysis for preview
  const gapAnalysis = recommendationEngine.analyzeSkillGap(selectedSkills, selectedDomainId);
  const selectedDomain = domains.find(d => d.id === selectedDomainId) || domains[0];

  const handleFinish = () => {
    updateUserProfile({
      selectedDomainId,
      skills: selectedSkills
    });

    storageService.logActivity({
      userId: currentUser?.id || 'user-1',
      action: 'updated_skills',
      domainId: selectedDomainId,
      details: `Updated assessment: ${selectedSkills.length} known skills, ${gapAnalysis.matchPercentage}% baseline alignment`
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    if (onCompleted) onCompleted();
    onClose();
  };

  const getDomainIcon = (slug: string) => {
    switch (slug) {
      case 'ai-ml':
        return <BrainCircuit className="w-6 h-6 text-blue-600" />;
      case 'data-science':
        return <BarChart3 className="w-6 h-6 text-sky-600" />;
      case 'cybersecurity':
        return <ShieldAlert className="w-6 h-6 text-emerald-600" />;
      case 'web-development':
        return <Globe className="w-6 h-6 text-indigo-600" />;
      case 'programming-java':
        return <Coffee className="w-6 h-6 text-amber-500" />;
      case 'programming-python':
        return <Terminal className="w-6 h-6 text-sky-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative my-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Stepper Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Personalized Onboarding
            </span>
            <span className="text-xs text-slate-400">Step {step} of 3</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {step === 1 && 'Step 1: Choose Your Career Domain'}
            {step === 2 && 'Step 2: Assess Your Existing Skill Set'}
            {step === 3 && 'Step 3: Skill Gap Analysis & Custom Roadmap'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {step === 1 && 'Select the specialized engineering or data pathway you want to conquer.'}
            {step === 2 && 'Tell us what you already know so we can eliminate redundant prerequisites and accelerate your track.'}
            {step === 3 && 'Here is your personalized roadmap calculation based on your identified skill gaps.'}
          </p>

          {/* Stepper indicator */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-blue-500 shadow-xs shadow-blue-500/50' : 'bg-white/10'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-blue-500 shadow-xs shadow-blue-500/50' : 'bg-white/10'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-blue-500 shadow-xs shadow-blue-500/50' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* Step 1: Select Domain */}
        {step === 1 && (() => {
          const currentUserId = currentUser?.id || 'user-1';
          const userCurrentDomainId = currentUser?.selectedDomainId || domains[0]?.id || 'domain-aiml';
          const activeDomainProgression = recommendationEngine.getDomainProgression(currentUserId, userCurrentDomainId);
          const activeDomain = domains.find(d => d.id === userCurrentDomainId) || domains[0];
          const hasActiveLock = currentUser?.role !== 'admin' && activeDomainProgression.hasStarted && !activeDomainProgression.isCompleted;

          return (
            <div className="space-y-4">
              {hasActiveLock && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Domain Lock Active</span>
                    <span className="text-amber-200/90 leading-relaxed">
                      You are actively progressing through <strong>{activeDomain.name}</strong> ({activeDomainProgression.completedTopics}/{activeDomainProgression.totalTopics} topics completed). Other career domains remain locked until your current domain is 100% completed.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {domains.map(domain => {
                  const isSelected = selectedDomainId === domain.id;
                  const lockStatus = recommendationEngine.isDomainLockedForUser(currentUserId, domain.id);
                  const isLocked = lockStatus.isLocked;

                  return (
                    <div
                      key={domain.id}
                      onClick={() => {
                        if (!isLocked) {
                          setSelectedDomainId(domain.id);
                        }
                      }}
                      className={`p-4 rounded-xl border text-left transition-all relative ${
                        isLocked
                          ? 'border-white/5 bg-white/[0.02] opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30 cursor-pointer'
                          : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/[0.08] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2 rounded-lg bg-white/10 border border-white/10">
                          {getDomainIcon(domain.slug)}
                        </div>
                        {isSelected && !isLocked && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isLocked && (
                          <div className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-white mt-3 text-base flex items-center gap-1.5">
                        {domain.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{domain.description}</p>
                      {isLocked && (
                        <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
                          Complete "{activeDomain.name}" first
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <span>Continue to Skill Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Step 2: Skill Assessment */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Select programming languages, tools, and technical concepts you are familiar with:
                </span>
                <span className="text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                  {selectedSkills.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-52 overflow-y-auto">
                {COMMON_SKILLS_LIST.map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-102'
                          : 'bg-white/5 text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom skill input */}
            <form onSubmit={handleAddCustomSkill} className="flex gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Add other skill (e.g. PyTorch, Rust, Kubernetes...)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 cursor-pointer transition-colors"
              >
                Add Skill
              </button>
            </form>

            <div className="pt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Analyze Skill Gaps</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Skill Gap Analysis & Roadmap Generation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs text-slate-400">Target Track:</span>
                  <div className="font-bold text-white text-base flex items-center gap-2">
                    {getDomainIcon(selectedDomain.slug)}
                    {selectedDomain.name}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Skill Alignment Baseline:</span>
                  <div className="text-2xl font-extrabold text-blue-400">
                    {gapAnalysis.matchPercentage}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-white/5 rounded-xl border border-emerald-500/30">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Skills You Possess ({gapAnalysis.knownSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {gapAnalysis.knownSkills.length > 0 ? (
                      gapAnalysis.knownSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No direct overlap yet. Great starting point!</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-amber-500/30">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Skill Gaps to Close ({gapAnalysis.missingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {gapAnalysis.missingSkills.slice(0, 8).map(s => (
                      <span key={s} className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                        {s}
                      </span>
                    ))}
                    {gapAnalysis.missingSkills.length > 8 && (
                      <span className="text-[11px] text-slate-400 px-1">
                        +{gapAnalysis.missingSkills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {gapAnalysis.acceleratedTopicIds.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    <strong>Acceleration Applied!</strong> Based on your known skills, {gapAnalysis.acceleratedTopicIds.length} topics can be streamlined.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Adjust Skills</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <span>Generate My Personalized Roadmap</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
