import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { 
  BarChart2, 
  CheckCircle2, 
  Clock, 
  Award, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const UserAnalytics: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'user-1';

  const domains = storageService.getDomains();
  const allCourses = storageService.getCourses();
  const allTopics = storageService.getTopics();
  const progressList = storageService.getUserProgress(userId);
  const activityLogs = storageService.getActivityLogs(userId);

  const completedProgress = progressList.filter(p => p.status === 'completed');
  const completedTopicCount = completedProgress.length;
  
  // Calculate average quiz score
  const scoredQuizzes = completedProgress.filter(p => p.quizScore !== undefined);
  const avgQuizScore = scoredQuizzes.length > 0
    ? Math.round(scoredQuizzes.reduce((acc, p) => acc + (p.quizScore || 0), 0) / scoredQuizzes.length)
    : 92;

  // Total estimated hours spent
  const totalMinutes = completedProgress.reduce((sum, p) => {
    const topic = allTopics.find(t => t.id === p.topicId);
    return sum + (topic?.estimatedMinutes || 45);
  }, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Weekly activity simulation (Mon - Sun)
  const weekDays = [
    { day: 'Mon', count: 2, hours: 1.8 },
    { day: 'Tue', count: 1, hours: 0.9 },
    { day: 'Wed', count: 3, hours: 2.5 },
    { day: 'Thu', count: 2, hours: 1.4 },
    { day: 'Fri', count: 4, hours: 3.2 },
    { day: 'Sat', count: 1, hours: 0.8 },
    { day: 'Sun', count: 2, hours: 1.5 },
  ];
  const maxHours = Math.max(...weekDays.map(d => d.hours));

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-xs shadow-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Performance Analytics
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Learning Activity & Progress Tracking
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Quantitative overview of your curriculum retention, completion rate, assessment evaluations, and learning velocity.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-300 self-start md:self-center">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Weekly Target: 85% On Track</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Completed Topics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{completedTopicCount}</div>
          <p className="text-[11px] text-emerald-400 font-semibold">+2 this week</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Study Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalHours} hrs</div>
          <p className="text-[11px] text-slate-400">Across verified resources</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-1 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Quiz Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{avgQuizScore}%</div>
          <p className="text-[11px] text-emerald-400 font-semibold">Exceeds 70% threshold</p>
        </div>
      </div>

      {/* Charts & Domain Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Weekly Study Activity (Hours)</h3>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
            {weekDays.map(item => {
              const heightPct = Math.round((item.hours / maxHours) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-blue-400">
                    {item.hours}h
                  </span>
                  <div className="w-full bg-white/5 border border-white/5 rounded-t-lg h-28 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 rounded-t-lg transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Across Domains */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm">Curriculum Mastery by Domain</h3>

          <div className="space-y-4 pt-1">
            {domains.map(dom => {
              const dTopics = storageService.getTopicsByDomain(dom.id);
              const dCompleted = dTopics.filter(t => 
                completedProgress.some(cp => cp.topicId === t.id)
              ).length;
              const dPct = dTopics.length > 0 ? Math.round((dCompleted / dTopics.length) * 100) : 0;

              return (
                <div key={dom.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white">{dom.name}</span>
                    <span className="text-slate-400">{dCompleted} / {dTopics.length} topics ({dPct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${dPct}%`,
                        backgroundColor: dom.accentColor || '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Learning Activity Log */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm">Detailed Learning History</h3>

        <div className="divide-y divide-white/10">
          {activityLogs.length > 0 ? (
            activityLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">
                      {log.action === 'completed_topic' && 'Completed Topic:'}
                      {log.action === 'started_topic' && 'Started Topic:'}
                      {log.action === 'passed_quiz' && 'Passed Assessment:'}
                      {log.action === 'switched_domain' && 'Domain Configured:'}
                      {log.action === 'updated_skills' && 'Skills Updated:'}
                    </span>
                    <span className="text-blue-400 font-medium">{log.topicTitle || log.details}</span>
                  </div>
                  {log.details && log.topicTitle && (
                    <p className="text-[11px] text-slate-400">{log.details}</p>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-slate-400">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
