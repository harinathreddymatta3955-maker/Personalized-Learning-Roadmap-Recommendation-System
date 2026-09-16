import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { Resource, ResourceType, Topic, Domain } from '../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  X, 
  Search, 
  Filter, 
  BookOpen, 
  Video, 
  FileText, 
  Code2, 
  HelpCircle 
} from 'lucide-react';

export const ResourceManager: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(() => storageService.getResources());
  const domains = storageService.getDomains();
  const topics = storageService.getTopics();

  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form
  const [targetTopicId, setTargetTopicId] = useState(topics[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('documentation');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [durationOrReadTime, setDurationOrReadTime] = useState('15 mins read');
  const [source, setSource] = useState('Official Documentation');

  const refreshList = () => {
    setResources(storageService.getResources());
  };

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      refreshList();
    });
    return () => unsub();
  }, []);

  const handleOpenCreate = () => {
    setEditingResource(null);
    setTargetTopicId(topics[0]?.id || '');
    setTitle('');
    setDescription('');
    setType('documentation');
    setUrl('');
    setDifficulty('beginner');
    setDurationOrReadTime('15 mins read');
    setSource('Official Documentation');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setTargetTopicId(res.topicId);
    setTitle(res.title);
    setDescription(res.description);
    setType(res.type);
    setUrl(res.url);
    setDifficulty(res.difficulty);
    setDurationOrReadTime(res.durationOrReadTime);
    setSource(res.source);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, resTitle: string) => {
    if (window.confirm(`Delete educational resource "${resTitle}"?`)) {
      storageService.deleteResource(id);
      refreshList();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !targetTopicId) return;

    const resourceRecord: Resource = {
      id: editingResource ? editingResource.id : `res-${Date.now()}`,
      topicId: targetTopicId,
      title: title.trim(),
      description: description.trim(),
      type,
      url: url.trim(),
      difficulty,
      durationOrReadTime: durationOrReadTime.trim(),
      source: source.trim(),
      isRecommended: true
    };

    storageService.saveResource(resourceRecord);
    setIsModalOpen(false);
    refreshList();
  };

  const filtered = resources.filter(r => {
    if (selectedTopicFilter !== 'all' && r.topicId !== selectedTopicFilter) return false;
    if (selectedTypeFilter !== 'all' && r.type !== selectedTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.source.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Content Catalog
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Resource Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain curated links, video lectures, documentation, articles, and interactive quizzes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-3 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, provider, or topic..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-white/10 bg-slate-900/90 font-medium text-white max-w-xs focus:ring-2 focus:ring-amber-500"
          >
            <option value="all" className="bg-slate-900 text-white">All Topics ({topics.length})</option>
            {topics.map(t => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-white">{t.title}</option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-white/10 bg-slate-900/90 font-medium text-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="all" className="bg-slate-900 text-white">All Types</option>
            <option value="documentation" className="bg-slate-900 text-white">Documentation</option>
            <option value="video" className="bg-slate-900 text-white">Video</option>
            <option value="article" className="bg-slate-900 text-white">Article</option>
            <option value="practice" className="bg-slate-900 text-white">Practice</option>
            <option value="quiz" className="bg-slate-900 text-white">Quiz</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold">
              <tr>
                <th className="p-3">Title & Source</th>
                <th className="p-3">Type</th>
                <th className="p-3">Associated Topic</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Duration</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map(res => {
                const topic = topics.find(t => t.id === res.topicId);

                return (
                  <tr key={res.id} className="hover:bg-white/[0.06] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{res.title}</div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <span>{res.source}</span>
                        <span>•</span>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-0.5"
                        >
                          link <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/10 text-slate-200">
                        {res.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">
                      {topic ? topic.title : 'Unassigned'}
                    </td>
                    <td className="p-3 capitalize font-medium text-slate-300">
                      {res.difficulty}
                    </td>
                    <td className="p-3 text-slate-400">
                      {res.durationOrReadTime}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(res)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(res.id, res.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/10 relative my-6 text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingResource ? 'Edit Educational Resource' : 'Register New Learning Resource'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Curriculum Topic
                </label>
                <select
                  value={targetTopicId}
                  onChange={(e) => setTargetTopicId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {topics.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scikit-Learn Ensemble Methods Official Guide"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL / Target Link
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="documentation" className="bg-slate-900 text-white">Documentation</option>
                    <option value="video" className="bg-slate-900 text-white">Video</option>
                    <option value="article" className="bg-slate-900 text-white">Article</option>
                    <option value="practice" className="bg-slate-900 text-white">Practice Problems</option>
                    <option value="quiz" className="bg-slate-900 text-white">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="beginner" className="bg-slate-900 text-white">Beginner</option>
                    <option value="intermediate" className="bg-slate-900 text-white">Intermediate</option>
                    <option value="advanced" className="bg-slate-900 text-white">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Platform / Author Source
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration / Read Time
                  </label>
                  <input
                    type="text"
                    value={durationOrReadTime}
                    onChange={(e) => setDurationOrReadTime(e.target.value)}
                    placeholder="e.g. 20 mins read"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brief Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Summary of this material..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-500/25 cursor-pointer transition-all"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
