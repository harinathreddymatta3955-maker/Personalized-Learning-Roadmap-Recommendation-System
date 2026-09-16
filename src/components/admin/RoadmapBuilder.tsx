import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Domain, Course, Topic } from '../../types';
import { 
  GitFork, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Layers, 
  Clock, 
  BookOpen,
  Info
} from 'lucide-react';

export const RoadmapBuilder: React.FC = () => {
  const domains = storageService.getDomains();
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || 'domain-aiml');
  
  const courses = storageService.getCoursesByDomain(selectedDomainId);
  const [topics, setTopics] = useState<Topic[]>(() => storageService.getTopicsByDomain(selectedDomainId));
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(topics[0] || null);

  const refreshTopics = (dId = selectedDomainId) => {
    const updated = storageService.getTopicsByDomain(dId);
    setTopics(updated);
    if (selectedTopic) {
      const refreshedSelected = updated.find(t => t.id === selectedTopic.id);
      setSelectedTopic(refreshedSelected || updated[0] || null);
    } else {
      setSelectedTopic(updated[0] || null);
    }
  };

  const handleDomainChange = (dId: string) => {
    setSelectedDomainId(dId);
    const updated = storageService.getTopicsByDomain(dId);
    setTopics(updated);
    setSelectedTopic(updated[0] || null);
  };

  const handleAddPrerequisite = (prereqId: string) => {
    if (!selectedTopic || selectedTopic.prerequisiteTopicIds.includes(prereqId)) return;
    const updatedTopic: Topic = {
      ...selectedTopic,
      prerequisiteTopicIds: [...selectedTopic.prerequisiteTopicIds, prereqId]
    };
    storageService.saveTopic(updatedTopic);
    refreshTopics();
  };

  const handleRemovePrerequisite = (prereqId: string) => {
    if (!selectedTopic) return;
    const updatedTopic: Topic = {
      ...selectedTopic,
      prerequisiteTopicIds: selectedTopic.prerequisiteTopicIds.filter(id => id !== prereqId)
    };
    storageService.saveTopic(updatedTopic);
    refreshTopics();
  };

  const currentDomain = domains.find(d => d.id === selectedDomainId) || domains[0];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visual Graph Builder
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Roadmap & Prerequisite Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Construct the directed learning acyclic graph (DAG). Connect prerequisites (e.g., Python → NumPy → Pandas → Machine Learning).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Active Track:</span>
            <select
              value={selectedDomainId}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-white/10 bg-slate-900/90 text-white font-semibold focus:ring-2 focus:ring-purple-500"
            >
              {domains.map(d => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Dependency Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pathway Stages Flow */}
        <div className="lg:col-span-2 space-y-6">
          {courses.map((course, cIdx) => {
            const courseTopics = topics.filter(t => t.courseId === course.id);

            return (
              <div key={course.id} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center">
                      {cIdx + 1}
                    </span>
                    <h3 className="font-bold text-white text-sm">{course.title}</h3>
                  </div>
                  <span className="text-xs text-slate-400">{courseTopics.length} topics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courseTopics.map(topic => {
                    const isSelected = selectedTopic?.id === topic.id;
                    const prereqCount = topic.prerequisiteTopicIds.length;

                    return (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20 backdrop-blur-md'
                            : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/[0.08]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Seq #{topic.order}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-white/10 text-slate-300 border border-white/10">
                            {prereqCount} Prereqs
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-xs mb-1 truncate">
                          {topic.title}
                        </h4>

                        <div className="flex flex-wrap gap-1">
                          {topic.keySkills.slice(0, 2).map(skill => (
                            <span key={skill} className="px-1 py-0.5 rounded bg-white/10 border border-white/10 text-slate-300 text-[9px] font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Topic Prerequisite Node Inspector */}
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl space-y-5 sticky top-20 text-white">
            {selectedTopic ? (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 rounded-full">
                    Node Inspector
                  </span>
                  <h3 className="font-extrabold text-white text-base mt-2">
                    {selectedTopic.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{selectedTopic.description}</p>
                </div>

                {/* Direct Prerequisites List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Direct Prerequisites</span>
                    <span className="text-purple-400 font-semibold">
                      {selectedTopic.prerequisiteTopicIds.length} required
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedTopic.prerequisiteTopicIds.map(pid => {
                      const prereqTopic = topics.find(t => t.id === pid);
                      return (
                        <div
                          key={pid}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200"
                        >
                          <span className="font-medium text-white truncate max-w-[170px]">
                            {prereqTopic ? prereqTopic.title : pid}
                          </span>
                          <button
                            onClick={() => handleRemovePrerequisite(pid)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/10 cursor-pointer transition-colors"
                            title="Remove prerequisite dependency"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                    {selectedTopic.prerequisiteTopicIds.length === 0 && (
                      <p className="text-xs text-slate-400 italic p-2 bg-white/5 rounded-lg border border-white/5">
                        No prerequisites required (Foundational node).
                      </p>
                    )}
                  </div>
                </div>

                {/* Add Prerequisite Dependency */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Link Prior Topic Dependency:
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddPrerequisite(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-slate-900/90 font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">Select prerequisite topic to link...</option>
                    {topics
                      .filter(t => t.id !== selectedTopic.id && !selectedTopic.prerequisiteTopicIds.includes(t.id))
                      .map(t => (
                        <option key={t.id} value={t.id} className="bg-slate-900 text-white">{t.title}</option>
                      ))}
                  </select>
                </div>

                <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    When a learner enrolls, this topic will stay locked until all {selectedTopic.prerequisiteTopicIds.length} dependencies are completed.
                  </span>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a topic node from the pathway to edit its prerequisite connections.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
