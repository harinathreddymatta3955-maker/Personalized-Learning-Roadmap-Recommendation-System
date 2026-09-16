import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { Topic, Course, Domain } from '../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Clock, 
  Check, 
  FileCode2,
  HelpCircle
} from 'lucide-react';

export const TopicManager: React.FC = () => {
  const domains = storageService.getDomains();
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || 'domain-aiml');
  
  const courses = storageService.getCoursesByDomain(selectedDomainId);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'all');

  const [topics, setTopics] = useState<Topic[]>(() => {
    return storageService.getTopicsByDomain(selectedDomainId);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Form fields
  const [targetCourseId, setTargetCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [keySkillsInput, setKeySkillsInput] = useState('');
  const [selectedPrereqIds, setSelectedPrereqIds] = useState<string[]>([]);
  const [order, setOrder] = useState(1);

  const refreshTopics = (dId = selectedDomainId, cId = selectedCourseId) => {
    if (cId === 'all') {
      setTopics(storageService.getTopicsByDomain(dId));
    } else {
      setTopics(storageService.getTopicsByCourse(cId));
    }
  };

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      refreshTopics();
    });
    return () => unsub();
  }, [selectedDomainId, selectedCourseId]);

  const handleDomainChange = (dId: string) => {
    setSelectedDomainId(dId);
    const domainCourses = storageService.getCoursesByDomain(dId);
    const firstCourseId = domainCourses[0]?.id || 'all';
    setSelectedCourseId(firstCourseId);
    refreshTopics(dId, firstCourseId);
  };

  const handleCourseChange = (cId: string) => {
    setSelectedCourseId(cId);
    refreshTopics(selectedDomainId, cId);
  };

  const handleOpenCreate = () => {
    setEditingTopic(null);
    setTargetCourseId(courses[0]?.id || '');
    setTitle('');
    setDescription('');
    setEstimatedMinutes(45);
    setKeySkillsInput('');
    setSelectedPrereqIds([]);
    setOrder(topics.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Topic) => {
    setEditingTopic(t);
    setTargetCourseId(t.courseId);
    setTitle(t.title);
    setDescription(t.description);
    setEstimatedMinutes(t.estimatedMinutes);
    setKeySkillsInput(t.keySkills.join(', '));
    setSelectedPrereqIds(t.prerequisiteTopicIds || []);
    setOrder(t.order);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, topicTitle: string) => {
    if (window.confirm(`Delete topic "${topicTitle}"?`)) {
      storageService.deleteTopic(id);
      refreshTopics();
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const currentTopic = topics[index];
    const targetTopic = topics[targetIndex];

    const tempOrder = currentTopic.order;
    currentTopic.order = targetTopic.order;
    targetTopic.order = tempOrder;

    storageService.saveTopic(currentTopic);
    storageService.saveTopic(targetTopic);
    refreshTopics();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetCourseId) return;

    const skills = keySkillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const topicRecord: Topic = {
      id: editingTopic ? editingTopic.id : `t-${Date.now()}`,
      courseId: targetCourseId,
      domainId: selectedDomainId,
      title: title.trim(),
      description: description.trim(),
      order: Number(order) || topics.length + 1,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      prerequisiteTopicIds: selectedPrereqIds,
      keySkills: skills
    };

    storageService.saveTopic(topicRecord);
    setIsModalOpen(false);
    refreshTopics();
  };

  const allDomainTopics = storageService.getTopicsByDomain(selectedDomainId);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Granular Competencies
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Topic Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Define learning objectives, skill tags, study times, and prerequisite dependencies.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Topic</span>
        </button>
      </div>

      {/* Selectors Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Select Domain
          </label>
          <select
            value={selectedDomainId}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="w-full text-xs py-2 px-3 rounded-lg border border-white/10 bg-slate-900/90 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {domains.map(d => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-white">{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Select Course Stage
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full text-xs py-2 px-3 rounded-lg border border-white/10 bg-slate-900/90 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all" className="bg-slate-900 text-white">All Courses in this Domain</option>
            {courses.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">Stage {c.order}: {c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {topics.map((topic, index) => {
          const course = courses.find(c => c.id === topic.courseId);
          const resources = storageService.getResourcesByTopic(topic.id);

          return (
            <div
              key={topic.id}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-lg hover:bg-white/[0.08] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded">
                    {course ? course.title : 'Course'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {topic.estimatedMinutes}m
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{topic.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-1">{topic.description}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {topic.keySkills.map(skill => (
                    <span key={skill} className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-slate-300 text-[10px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs text-slate-400 font-medium mr-1">
                  {resources.length} resources
                </span>

                <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === topics.length - 1}
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(topic)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(topic.id, topic.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topic Modal */}
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
              {editingTopic ? 'Edit Topic' : 'Add Topic to Course'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Parent Course Stage
                </label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      Stage {c.order}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Model Evaluation & Cross Validation"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="What will the learner master in this module?"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Order In Course
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={keySkillsInput}
                  onChange={(e) => setKeySkillsInput(e.target.value)}
                  placeholder="e.g. Precision, Recall, ROC AUC, F1 Score"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Direct Prerequisite Topics
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-white/5 border border-white/10 rounded-lg space-y-1">
                  {allDomainTopics
                    .filter(t => t.id !== editingTopic?.id)
                    .map(t => {
                      const isChecked = selectedPrereqIds.includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:bg-white/10 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedPrereqIds(prev =>
                                isChecked ? prev.filter(id => id !== t.id) : [...prev, t.id]
                              );
                            }}
                            className="rounded text-emerald-500 focus:ring-emerald-400"
                          />
                          <span className="truncate">{t.title}</span>
                        </label>
                      );
                    })}
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
