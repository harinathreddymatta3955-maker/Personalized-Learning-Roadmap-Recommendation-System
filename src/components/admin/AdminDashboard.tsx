import React from 'react';
import { storageService } from '../../services/storageService';
import { 
  Users, 
  Layers, 
  BookOpen, 
  FileCode2, 
  ShieldCheck, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  ExternalLink,
  Award
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const users = storageService.getUsers();
  const domains = storageService.getDomains();
  const courses = storageService.getCourses();
  const topics = storageService.getTopics();
  const resources = storageService.getResources();
  const allProgress = storageService.getUserProgress('');

  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const completedTopicsCount = allProgress.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 backdrop-blur-xl text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Administrative Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Curriculum & System Management
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Monitor real-time user registrations, maintain domain pathways, construct prerequisite graphs, and govern educational resources.
          </p>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Users</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{users.length}</div>
          <p className="text-[10px] text-emerald-400 font-semibold">{activeUsersCount} active</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Domains</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{domains.length}</div>
          <p className="text-[10px] text-slate-400">4 PRD Tracks</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Courses</span>
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{courses.length}</div>
          <p className="text-[10px] text-slate-400">Structured modules</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Topics</span>
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{topics.length}</div>
          <p className="text-[10px] text-slate-400">Competencies</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Resources</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{resources.length}</div>
          <p className="text-[10px] text-slate-400">Curated materials</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Completions</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{completedTopicsCount}</div>
          <p className="text-[10px] text-emerald-400 font-semibold">Active learning</p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Quick Content Management Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('admin-domains')}
            className="p-4 rounded-xl border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 text-left transition-all group bg-white/5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs">
                Domain Manager
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-300">Create, edit, or customize learning tracks and accents.</p>
          </button>

          <button
            onClick={() => onNavigate('admin-courses')}
            className="p-4 rounded-xl border border-white/10 hover:border-blue-400/50 hover:bg-white/10 text-left transition-all group bg-white/5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-xs">
                Course Manager
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-300">Reorder course sequences and configure syllabus hierarchies.</p>
          </button>

          <button
            onClick={() => onNavigate('admin-topics')}
            className="p-4 rounded-xl border border-white/10 hover:border-emerald-400/50 hover:bg-white/10 text-left transition-all group bg-white/5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                Topic & Skill Manager
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-300">Define competencies, estimated time, and direct prerequisites.</p>
          </button>

          <button
            onClick={() => onNavigate('admin-builder')}
            className="p-4 rounded-xl border border-white/10 hover:border-purple-400/50 hover:bg-white/10 text-left transition-all group bg-white/5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs">
                Roadmap Builder
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-300">Visually configure prerequisite chains and dependency graphs.</p>
          </button>
        </div>
      </div>

      {/* Domain Breakdown Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Domain Status Overview</h3>
          <button
            onClick={() => onNavigate('admin-domains')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            Manage All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Domain Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Courses</th>
                <th className="p-3">Topics</th>
                <th className="p-3">Enrolled Learners</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {domains.map((d, index) => {
                const domainCourses = courses.filter(c => c.domainId === d.id);
                const domainTopics = topics.filter(t => t.domainId === d.id);
                const enrolled = users.filter(u => u.selectedDomainId === d.id).length;

                return (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-slate-400">#{index + 1}</td>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.accentColor || '#3b82f6' }} />
                      <span>{d.name}</span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono">{d.slug}</td>
                    <td className="p-3 font-semibold text-slate-300">{domainCourses.length} courses</td>
                    <td className="p-3 font-semibold text-slate-300">{domainTopics.length} topics</td>
                    <td className="p-3 font-bold text-indigo-400">{enrolled} students</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onNavigate('admin-builder')}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        Edit Roadmap
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
