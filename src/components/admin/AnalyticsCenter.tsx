import React from 'react';
import { storageService } from '../../services/storageService';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const AnalyticsCenter: React.FC = () => {
  const users = storageService.getUsers();
  const domains = storageService.getDomains();
  const courses = storageService.getCourses();
  const topics = storageService.getTopics();
  const resources = storageService.getResources();
  const allProgress = storageService.getUserProgress('');

  const completedProgress = allProgress.filter(p => p.status === 'completed');

  // Domain popularity
  const domainPopularity = domains.map(d => {
    const enrolled = users.filter(u => u.selectedDomainId === d.id).length;
    const dTopics = topics.filter(t => t.domainId === d.id);
    const dCompleted = completedProgress.filter(p => dTopics.some(t => t.id === p.topicId)).length;
    return {
      domain: d,
      enrolled,
      completedTopics: dCompleted
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Institutional Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">System Analytics Center</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Curriculum analytics, learner engagement rates, domain adoption trends, and completion performance.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs font-semibold self-start md:self-center">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Active Engagement Pulse</span>
          </div>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Enrolled Learners</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{users.length}</div>
          <p className="text-[11px] text-emerald-400 font-semibold">+100% platform retention</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Course Stages</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{courses.length}</div>
          <p className="text-[11px] text-slate-400">Across 4 major specializations</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Topics Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{completedProgress.length}</div>
          <p className="text-[11px] text-emerald-400 font-semibold">Active topic completions</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Indexed Resources</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{resources.length}</div>
          <p className="text-[11px] text-slate-400">Verified learning assets</p>
        </div>
      </div>

      {/* Domain Breakdown Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Popular Domains & Enrolment Distribution</h3>

        <div className="space-y-4 pt-1">
          {domainPopularity.map(item => {
            const sharePct = users.length > 0 ? Math.round((item.enrolled / users.length) * 100) : 0;
            return (
              <div key={item.domain.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.domain.accentColor }} />
                    <span className="font-bold text-white text-sm">{item.domain.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white text-xs">{item.enrolled} learners</span>
                    <span className="text-[11px] text-slate-400 ml-1">({sharePct}% share)</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.max(sharePct, 8)}%`,
                      backgroundColor: item.domain.accentColor || '#3b82f6'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Completed topic milestones in track: {item.completedTopics}</span>
                  <span className="font-semibold text-slate-300">PRD Standard Curriculum</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Resources Leaderboard */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Curriculum Content Coverage by Format</h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {['documentation', 'video', 'article', 'practice', 'quiz'].map(fmt => {
            const count = resources.filter(r => r.type === fmt).length;
            return (
              <div key={fmt} className="p-4 rounded-xl border border-white/10 bg-white/5 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block capitalize">
                  {fmt}
                </span>
                <span className="text-xl font-extrabold text-white">{count}</span>
                <span className="text-[10px] text-slate-400 block">assets</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
