import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { User, UserProgress } from '../../types';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Ban, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  BookOpen, 
  X,
  Sparkles
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userProgressModal, setUserProgressModal] = useState<UserProgress[] | null>(null);

  const domains = storageService.getDomains();
  const allTopics = storageService.getTopics();

  const refreshUsers = () => {
    setUsers(storageService.getUsers());
  };

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      refreshUsers();
    });
    return () => unsub();
  }, []);

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    storageService.updateUserStatus(user.id, newStatus);
    refreshUsers();
  };

  const handleToggleRole = (user: User) => {
    if (user.id === 'user-admin') {
      alert('The root system administrator role cannot be modified.');
      return;
    }
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    storageService.updateUserRole(user.id, newRole);
    refreshUsers();
  };

  const handleViewProgress = (user: User) => {
    setSelectedUser(user);
    const progress = storageService.getUserProgress(user.id);
    setUserProgressModal(progress);
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-xs shadow-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Access Governance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit enrolled learners, inspect individual curriculum progress, and activate or suspend accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 border border-white/10">
            {users.length} Total Users
          </span>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email address..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold">
              <tr>
                <th className="p-3">User Profile</th>
                <th className="p-3">Role</th>
                <th className="p-3">Target Domain</th>
                <th className="p-3">Known Skills</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map(user => {
                const domain = domains.find(d => d.id === user.selectedDomainId);
                const progress = storageService.getUserProgress(user.id);
                const completedCount = progress.filter(p => p.status === 'completed').length;

                return (
                  <tr key={user.id} className="hover:bg-white/[0.06] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">
                      {domain ? domain.name : 'Unassigned'}
                    </td>
                    <td className="p-3 text-slate-400">
                      {user.skills.length} skills ({user.skills.slice(0, 2).join(', ')}...)
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        user.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleViewProgress(user)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                      >
                        Inspect Progress ({completedCount})
                      </button>

                      {user.id !== 'user-admin' && (
                        <button
                          onClick={() => handleToggleRole(user)}
                          title={user.role === 'admin' ? 'Demote to learner role' : 'Promote to platform administrator'}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                            user.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
                              : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15'
                          }`}
                        >
                          {user.role === 'admin' ? 'Demote to Learner' : 'Make Admin'}
                        </button>
                      )}

                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                            user.status === 'active'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                          }`}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Inspector Modal */}
      {userProgressModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/10 relative max-h-[85vh] flex flex-col text-white">
            <button
              onClick={() => setUserProgressModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                Learner Progress Record: {selectedUser.name}
              </h3>
              <p className="text-xs text-slate-400">{selectedUser.email}</p>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-3">
              {userProgressModal.length > 0 ? (
                userProgressModal.map(p => {
                  const topic = allTopics.find(t => t.id === p.topicId);
                  return (
                    <div
                      key={p.topicId}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {topic ? topic.title : p.topicId}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Updated: {new Date(p.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.quizScore !== undefined && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                            Score: {p.quizScore}%
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          p.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  This user has not interacted with any curriculum topics yet.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setUserProgressModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/25 cursor-pointer transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
