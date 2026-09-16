import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { Domain } from '../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Layers, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const DomainManager: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>(() => storageService.getDomains());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [order, setOrder] = useState(domains.length + 1);

  const refreshList = () => {
    setDomains(storageService.getDomains());
  };

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      refreshList();
    });
    return () => unsub();
  }, []);

  const handleOpenCreate = () => {
    setEditingDomain(null);
    setName('');
    setSlug('');
    setDescription('');
    setAccentColor('#3b82f6');
    setOrder(domains.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Domain) => {
    setEditingDomain(d);
    setName(d.name);
    setSlug(d.slug);
    setDescription(d.description);
    setAccentColor(d.accentColor);
    setOrder(d.order);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, domainName: string) => {
    if (window.confirm(`Are you sure you want to delete the domain "${domainName}" and all associated curriculum data?`)) {
      storageService.deleteDomain(id);
      refreshList();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    const newDomain: Domain = {
      id: editingDomain ? editingDomain.id : `domain-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim(),
      iconName: editingDomain ? editingDomain.iconName : 'Layers',
      accentColor,
      order: Number(order) || 1
    };

    storageService.saveDomain(newDomain);
    setIsModalOpen(false);
    refreshList();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Curriculum Architecture
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Domain Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, update, and manage top-level career tracks and educational pathways.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Domain</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {domains.map((domain) => {
          const courses = storageService.getCoursesByDomain(domain.id);
          const topics = storageService.getTopicsByDomain(domain.id);

          return (
            <div
              key={domain.id}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl hover:bg-white/[0.08] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: domain.accentColor }}
                    />
                    <div>
                      <h3 className="font-bold text-white text-base">{domain.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">slug: {domain.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(domain)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Edit Domain"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(domain.id, domain.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Delete Domain"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{domain.description}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Display Order: #{domain.order}</span>
                <span className="font-semibold text-slate-300">
                  {courses.length} Courses • {topics.length} Topics
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Domain Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 relative text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingDomain ? 'Edit Domain Details' : 'Create New Educational Domain'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cloud Computing & DevOps"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. cloud-devops"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Scope
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Overview of this specialized career roadmap..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{accentColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer transition-all"
                >
                  Save Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
