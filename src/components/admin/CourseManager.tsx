import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Course, Domain } from '../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  BookOpen, 
  Layers 
} from 'lucide-react';

export const CourseManager: React.FC = () => {
  const domains = storageService.getDomains();
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || 'domain-aiml');
  const [courses, setCourses] = useState<Course[]>(() => storageService.getCoursesByDomain(selectedDomainId));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);

  const refreshCourses = (dId = selectedDomainId) => {
    setCourses(storageService.getCoursesByDomain(dId));
  };

  const handleDomainChange = (newDomainId: string) => {
    setSelectedDomainId(newDomainId);
    refreshCourses(newDomainId);
  };

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setTitle('');
    setDescription('');
    setOrder(courses.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setDescription(c.description);
    setOrder(c.order);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, courseTitle: string) => {
    if (window.confirm(`Delete course "${courseTitle}" and all its contained topics?`)) {
      storageService.deleteCourse(id);
      refreshCourses();
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= courses.length) return;

    const currentCourse = courses[index];
    const targetCourse = courses[targetIndex];

    const tempOrder = currentCourse.order;
    currentCourse.order = targetCourse.order;
    targetCourse.order = tempOrder;

    storageService.saveCourse(currentCourse);
    storageService.saveCourse(targetCourse);
    refreshCourses();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const courseRecord: Course = {
      id: editingCourse ? editingCourse.id : `c-${selectedDomainId}-${Date.now()}`,
      domainId: selectedDomainId,
      title: title.trim(),
      description: description.trim(),
      order: Number(order) || courses.length + 1
    };

    storageService.saveCourse(courseRecord);
    setIsModalOpen(false);
    refreshCourses();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-xs shadow-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Curriculum Sequence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Course Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize syllabi, reorder pathway stages, and maintain prerequisites.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course Stage</span>
        </button>
      </div>

      {/* Domain Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {domains.map(d => {
          const isSelected = d.id === selectedDomainId;
          return (
            <button
              key={d.id}
              onClick={() => handleDomainChange(d.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-white/20 text-white border border-white/20 shadow-md backdrop-blur-md'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.accentColor }} />
              <span>{d.name}</span>
            </button>
          );
        })}
      </div>

      {/* Course List with Reordering Controls */}
      <div className="space-y-3">
        {courses.map((course, index) => {
          const topics = storageService.getTopicsByCourse(course.id);

          return (
            <div
              key={course.id}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-lg hover:bg-white/[0.08] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/15 shadow-xs">
                  {course.order}
                </span>

                <div>
                  <h3 className="font-bold text-white text-sm">{course.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{course.description}</p>
                  <span className="text-[11px] text-blue-400 font-semibold block pt-1">
                    {topics.length} topics linked
                  </span>
                </div>
              </div>

              {/* Reorder & Action Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Up/Down reorder arrows */}
                <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    title="Move earlier in roadmap"
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === courses.length - 1}
                    title="Move later in roadmap"
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(course)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Edit Course"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(course.id, course.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {courses.length === 0 && (
          <div className="p-10 text-center bg-white/5 backdrop-blur-xl rounded-2xl border border-dashed border-white/15">
            <p className="text-slate-400 text-xs">No courses registered for this domain yet. Click 'Add Course Stage' to create one.</p>
          </div>
        )}
      </div>

      {/* Course Modal */}
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
              {editingCourse ? 'Edit Course Stage' : 'Add Course Stage'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Object-Oriented Programming"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Syllabus
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Summary of this course stage..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sequence Order Position
                </label>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 cursor-pointer transition-all"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
