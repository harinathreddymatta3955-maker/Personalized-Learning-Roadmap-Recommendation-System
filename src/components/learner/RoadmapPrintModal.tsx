import React, { useState } from 'react';
import { Domain, Course, Topic, Resource, UserTopicProgress } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  FileText, 
  Award,
  Layers,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';

interface RoadmapPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: Domain;
  courses: Course[];
  topics: Topic[];
  userProgress: UserTopicProgress[];
  resources: Resource[];
}

export const RoadmapPrintModal: React.FC<RoadmapPrintModalProps> = ({
  isOpen,
  onClose,
  domain,
  courses,
  topics,
  userProgress,
  resources,
}) => {
  const { currentUser } = useAuth();

  const [includeResources, setIncludeResources] = useState(true);
  const [includeNotesSection, setIncludeNotesSection] = useState(true);

  if (!isOpen) return null;

  const completedTopicIds = new Set(
    userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
  );

  const completedCount = topics.filter(t => completedTopicIds.has(t.id)).length;
  const progressPercentage = topics.length > 0
    ? Math.round((completedCount / topics.length) * 100)
    : 0;

  const totalMinutes = topics.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handler for printing
  const handlePrint = () => {
    window.print();
  };

  // Handler for downloading Markdown / Text file
  const handleDownloadMarkdown = () => {
    let md = `# PERSONALIZED LEARNING ROADMAP & SYLLABUS\n`;
    md += `Target Track: ${domain.name}\n`;
    md += `Learner: ${currentUser?.name || 'Learner'} (${currentUser?.email || 'N/A'})\n`;
    md += `Exported Date: ${currentDate}\n`;
    md += `Mastery Progress: ${completedCount}/${topics.length} topics completed (${progressPercentage}%)\n`;
    md += `Total Estimated Study Time: ~${totalHours} hours\n\n`;
    md += `--------------------------------------------------------\n\n`;

    courses.sort((a, b) => a.order - b.order).forEach(course => {
      md += `## Course Stage ${course.order}: ${course.title}\n`;
      md += `${course.description}\n\n`;

      const courseTopics = topics
        .filter(t => t.courseId === course.id)
        .sort((a, b) => a.order - b.order);

      courseTopics.forEach(topic => {
        const isDone = completedTopicIds.has(topic.id);
        md += `### [${isDone ? 'X' : ' '}] Step ${topic.order}: ${topic.title} (~${topic.estimatedMinutes}m)\n`;
        md += `${topic.description}\n`;
        if (topic.keySkills.length > 0) {
          md += `Key Skills: ${topic.keySkills.join(', ')}\n`;
        }

        if (includeResources) {
          const topicResources = resources.filter(r => r.topicId === topic.id);
          if (topicResources.length > 0) {
            md += `Curated Learning Resources:\n`;
            topicResources.forEach(res => {
              md += `  - [${res.type.toUpperCase()}] ${res.title} (${res.durationOrReadTime}) - ${res.source}\n    Link: ${res.url}\n`;
            });
          }
        }
        md += `\n`;
      });
      md += `\n`;
    });

    if (includeNotesSection) {
      md += `## Offline Study Notes & Log\n`;
      md += `[ ] Week 1 Study Milestone: ____________________________\n`;
      md += `[ ] Week 2 Study Milestone: ____________________________\n`;
      md += `[ ] Week 3 Study Milestone: ____________________________\n`;
      md += `[ ] Final Capstone Milestone: __________________________\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${domain.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-roadmap.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Controls (Hidden during browser print) */}
        <div className="no-print p-5 bg-slate-950/80 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Printable Roadmap (PDF Export)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                  A4 / Letter Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ready for offline reference, printing, or saving as PDF via your browser's Print dialog.
              </p>
            </div>
          </div>

          {/* Actions & Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={includeResources} 
                onChange={(e) => setIncludeResources(e.target.checked)}
                className="rounded border-white/20 text-blue-600 focus:ring-0"
              />
              <span>Include Resources</span>
            </label>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download offline Markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer ml-1"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40 custom-scrollbar">
          
          {/* THE OFFICIAL PRINT DOCUMENT LAYOUT (Styled for High Contrast & Clean Paper Print) */}
          <div 
            id="printable-roadmap"
            className="bg-white text-slate-900 rounded-2xl shadow-xl p-6 sm:p-10 max-w-3xl mx-auto space-y-6 font-sans text-xs sm:text-sm border border-slate-200"
          >
            {/* Header / Brand Banner */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-blue-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CO-ENGINEER • Personalized Learning & Recommendation System</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-950 mt-1 tracking-tight">
                    {domain.name} Learning Pathway
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl">
                    Official syllabus and sequential milestone tracker calibrated to your personalized learning profile.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block border-2 border-blue-600 rounded-xl px-3 py-2 text-center bg-blue-50">
                    <span className="block text-[10px] uppercase font-bold text-blue-800">Mastery Status</span>
                    <span className="text-xl font-black text-blue-900">{progressPercentage}%</span>
                    <span className="block text-[10px] text-blue-700">{completedCount}/{topics.length} Done</span>
                  </div>
                </div>
              </div>

              {/* Learner Meta Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Learner</span>
                  <span className="font-bold text-slate-900">{currentUser?.name || 'Registered Learner'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Email</span>
                  <span className="font-medium text-slate-700 truncate block">{currentUser?.email || 'learner@domain.com'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Target Career</span>
                  <span className="font-bold text-slate-900">{domain.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Export Date</span>
                  <span className="font-medium text-slate-700">{currentDate}</span>
                </div>
              </div>

              {/* Verified Known Skills (if calibrated) */}
              {currentUser?.skills && currentUser.skills.length > 0 && (
                <div className="mt-3 text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 mr-2">Calibrated Starting Skills:</span>
                  <span className="text-slate-700">{currentUser.skills.join(' • ')}</span>
                </div>
              )}
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-100 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Curriculum Courses</span>
                <span className="text-base font-extrabold text-slate-900">{courses.length} Stages</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Topics</span>
                <span className="text-base font-extrabold text-slate-900">{topics.length} Sections</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimated Study Time</span>
                <span className="text-base font-extrabold text-slate-900">~{totalHours} Hours</span>
              </div>
            </div>

            {/* COURSE STAGES & TOPICS (PRINTABLE SYLLABUS) */}
            <div className="space-y-6">
              {courses.sort((a, b) => a.order - b.order).map(course => {
                const courseTopics = topics
                  .filter(t => t.courseId === course.id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <div 
                    key={course.id}
                    className="print-avoid-break border border-slate-300 rounded-xl overflow-hidden"
                  >
                    {/* Course Banner */}
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
                          Stage {course.order}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {course.title}
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {courseTopics.length} Topics
                      </span>
                    </div>

                    {/* Topics Checklist Table */}
                    <div className="p-3 space-y-3">
                      {courseTopics.map(topic => {
                        const isDone = completedTopicIds.has(topic.id);
                        const topicResources = resources.filter(r => r.topicId === topic.id);

                        return (
                          <div 
                            key={topic.id}
                            className="border-b border-slate-200 last:border-b-0 pb-3 last:pb-0"
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Offline pencil checkbox */}
                              <div className="mt-0.5 shrink-0 text-slate-800">
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400" />
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-xs">
                                      Step {topic.order}: {topic.title}
                                    </span>
                                    {isDone && (
                                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                        Completed
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-600 font-mono">
                                    {topic.estimatedMinutes} min
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-600 mt-0.5">
                                  {topic.description}
                                </p>

                                {/* Key Skills */}
                                {topic.keySkills && topic.keySkills.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    <span className="text-[10px] font-semibold text-slate-500 mr-1">Skills:</span>
                                    {topic.keySkills.map(skill => (
                                      <span 
                                        key={skill}
                                        className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Curated Resources (if enabled) */}
                                {includeResources && topicResources.length > 0 && (
                                  <div className="mt-2 pl-2 border-l-2 border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                      Curated Study Resources:
                                    </span>
                                    {topicResources.map(res => (
                                      <div key={res.id} className="text-[11px] flex items-center justify-between text-slate-700">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <span className="font-mono text-[9px] uppercase px-1 rounded bg-slate-200 text-slate-800">
                                            {res.type}
                                          </span>
                                          <span className="font-medium truncate">{res.title}</span>
                                          <span className="text-slate-400 text-[10px]">({res.source})</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 shrink-0 font-mono ml-2">
                                          {res.durationOrReadTime}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* OFFLINE NOTES & SIGN-OFF SECTION */}
            {includeNotesSection && (
              <div className="print-avoid-break mt-6 pt-5 border-t-2 border-slate-300 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Offline Study Notes & Milestone Sign-off
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <span className="font-bold text-slate-700 block mb-1">Key Takeaways & Code Experiments:</span>
                    <div className="h-16 border-b border-dashed border-slate-300 mb-2" />
                    <div className="h-16 border-b border-dashed border-slate-300" />
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Milestone Verification:</span>
                      <p className="text-[11px] text-slate-600">
                        Check off each step upon passing quizzes or coding assignments.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
                      <div>
                        <span>Learner Signature: __________________</span>
                      </div>
                      <div>
                        <span>Date: ____________</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <span>Personalized Learning Roadmap System • Generated for {currentUser?.name || 'Learner'}</span>
              <span>Page 1 of Syllabus</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="no-print p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Tip: In the print dialog, select <strong>"Save as PDF"</strong> as the destination to create an offline PDF file.
          </span>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Open Print Dialog</span>
          </button>
        </div>

      </div>
    </div>
  );
};
