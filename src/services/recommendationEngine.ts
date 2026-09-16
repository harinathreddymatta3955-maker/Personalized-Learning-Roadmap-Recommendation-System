import { storageService } from './storageService';
import { 
  Topic, 
  Course,
  Domain,
  SkillGapResult, 
  NextTopicRecommendation, 
  Resource,
  TopicLockInfo,
  DomainLockStatus
} from '../types';

export const recommendationEngine = {
  /**
   * Identifies gaps between user's current skills and the target domain requirements.
   */
  analyzeSkillGap(userSkills: string[], domainId: string): SkillGapResult {
    const topics = storageService.getTopicsByDomain(domainId);
    
    // Normalize skills to lower-case for comparison
    const normalizedUserSkills = new Set(userSkills.map(s => s.trim().toLowerCase()));
    
    // Collect all domain required skills
    const domainSkillsSet = new Set<string>();
    topics.forEach(t => {
      t.keySkills.forEach(skill => domainSkillsSet.add(skill));
    });

    const totalRequiredSkills = domainSkillsSet.size;
    const knownSkills: string[] = [];
    const missingSkills: string[] = [];

    domainSkillsSet.forEach(skill => {
      if (normalizedUserSkills.has(skill.toLowerCase())) {
        knownSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Detect topics that match known skills
    const acceleratedTopicIds: string[] = [];
    topics.forEach(t => {
      const allTopicSkillsKnown = t.keySkills.length > 0 && t.keySkills.every(s => 
        normalizedUserSkills.has(s.toLowerCase())
      );
      if (allTopicSkillsKnown) {
        acceleratedTopicIds.push(t.id);
      }
    });

    const matchPercentage = totalRequiredSkills > 0 
      ? Math.round((knownSkills.length / totalRequiredSkills) * 100) 
      : 0;

    return {
      knownSkills,
      missingSkills,
      totalRequiredSkills,
      matchPercentage,
      acceleratedTopicIds,
      remainingTopicCount: Math.max(0, topics.length - acceleratedTopicIds.length)
    };
  },

  /**
   * Returns all topics for a given domain in strictly ordered sequential pathway:
   * Sorted by course order ascending, then topic order within that course ascending.
   */
  getDomainTopicSequence(domainId: string): Topic[] {
    const courses = storageService.getCoursesByDomain(domainId);
    courses.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

    const sequence: Topic[] = [];
    for (const course of courses) {
      const courseTopics = storageService.getTopicsByCourse(course.id);
      courseTopics.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
      sequence.push(...courseTopics);
    }
    return sequence;
  },

  /**
   * Detailed inspection of why a topic is locked or unlocked for a given user.
   * Enforces strict sequential progression:
   * - If user is at topic 1, subsequent topics are locked until topic 1 is completed.
   * - Once current topic is completed, the next topic unlocks.
   */
  getTopicLockInfo(userId: string, topic: Topic): TopicLockInfo {
    const userProgress = storageService.getUserProgress(userId);
    const completedTopicIds = new Set(
      userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
    );

    // If already completed, it's not locked
    if (completedTopicIds.has(topic.id)) {
      return {
        isLocked: false,
        unmetPrereqTopics: [],
        unmetPrereqCourses: []
      };
    }

    const sequence = this.getDomainTopicSequence(topic.domainId);
    const topicIdx = sequence.findIndex(t => t.id === topic.id);

    // 1. Strict Sequential check: Must complete the immediately prior topic in the sequence
    if (topicIdx > 0) {
      const previousTopic = sequence[topicIdx - 1];
      if (!completedTopicIds.has(previousTopic.id)) {
        return {
          isLocked: true,
          reason: `Locked: Please complete "${previousTopic.title}" first before proceeding to this topic.`,
          previousTopic,
          unmetPrereqTopics: [previousTopic],
          unmetPrereqCourses: []
        };
      }
    }

    // 2. Explicit topic prerequisites check
    if (topic.prerequisiteTopicIds && topic.prerequisiteTopicIds.length > 0) {
      const allTopics = storageService.getTopics();
      const unmetTopics: Topic[] = [];
      for (const pid of topic.prerequisiteTopicIds) {
        if (!completedTopicIds.has(pid)) {
          const found = allTopics.find(t => t.id === pid);
          if (found) unmetTopics.push(found);
        }
      }
      if (unmetTopics.length > 0) {
        return {
          isLocked: true,
          reason: `Locked: Requires prerequisite topic "${unmetTopics[0].title}".`,
          unmetPrereqTopics: unmetTopics,
          unmetPrereqCourses: []
        };
      }
    }

    // 3. Course prerequisites check
    const allCourses = storageService.getCourses();
    const course = allCourses.find(c => c.id === topic.courseId);
    if (course?.prerequisiteCourseIds && course.prerequisiteCourseIds.length > 0) {
      const unmetCourses: Course[] = [];
      for (const cid of course.prerequisiteCourseIds) {
        const prereqCourseTopics = storageService.getTopicsByCourse(cid);
        const allCompleted = prereqCourseTopics.length > 0 && prereqCourseTopics.every(t => completedTopicIds.has(t.id));
        if (!allCompleted) {
          const prereqCourse = allCourses.find(c => c.id === cid);
          if (prereqCourse) unmetCourses.push(prereqCourse);
        }
      }
      if (unmetCourses.length > 0) {
        return {
          isLocked: true,
          reason: `Locked: Requires completing prerequisite course "${unmetCourses[0].title}".`,
          unmetPrereqTopics: [],
          unmetPrereqCourses: unmetCourses
        };
      }
    }

    // Unlocked and ready to study!
    return {
      isLocked: false,
      unmetPrereqTopics: [],
      unmetPrereqCourses: []
    };
  },

  /**
   * Computes each topic's status ('completed' | 'in_progress' | 'locked')
   * taking into account sequential progression and prerequisite dependency graphs.
   */
  getTopicStatus(userId: string, topic: Topic): 'completed' | 'in_progress' | 'locked' {
    const userProgress = storageService.getUserProgress(userId);
    const completedTopicIds = new Set(
      userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
    );

    if (completedTopicIds.has(topic.id)) {
      return 'completed';
    }

    const lockInfo = this.getTopicLockInfo(userId, topic);
    if (lockInfo.isLocked) {
      return 'locked';
    }

    return 'in_progress';
  },

  /**
   * Returns progression statistics for a given domain and user.
   */
  getDomainProgression(userId: string, domainId: string) {
    const topics = storageService.getTopicsByDomain(domainId);
    const userProgress = storageService.getUserProgress(userId);
    const completedTopicIds = new Set(
      userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
    );
    const inProgressTopicIds = new Set(
      userProgress.filter(p => p.status === 'in_progress').map(p => p.topicId)
    );

    const completedTopics = topics.filter(t => completedTopicIds.has(t.id)).length;
    const inProgressTopics = topics.filter(t => inProgressTopicIds.has(t.id)).length;

    // Check if user has started any topic (either completed, in_progress, or in activity logs)
    const hasProgressRecord = topics.some(t => completedTopicIds.has(t.id) || inProgressTopicIds.has(t.id));
    const hasActivity = storageService.getActivityLogs(userId).some(l => 
      l.domainId === domainId && (l.action === 'started_topic' || l.action === 'completed_topic' || l.action === 'passed_quiz')
    );
    const hasStarted = hasProgressRecord || hasActivity;

    const isCompleted = topics.length > 0 && completedTopics === topics.length;
    const percentage = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;

    return {
      totalTopics: topics.length,
      completedTopics,
      inProgressTopics,
      isCompleted,
      hasStarted,
      percentage
    };
  },

  /**
   * Evaluates domain locking status for a user:
   * If student selects a domain and starts any of topic from it,
   * then other domains are LOCKED until the current domain is 100% completed.
   */
  isDomainLockedForUser(userId: string, targetDomainId: string): DomainLockStatus {
    const user = storageService.getUsers().find(u => u.id === userId);
    const domains = storageService.getDomains();

    // Admins have unrestricted access
    if (user?.role === 'admin') {
      return {
        isLocked: false,
        activeDomain: null,
        activeDomainStats: { completedCount: 0, totalCount: 0, percentage: 0 },
        isCurrentDomainCompleted: true
      };
    }

    const currentDomainId = user?.selectedDomainId || domains[0]?.id || 'domain-aiml';
    const activeDomain = domains.find(d => d.id === currentDomainId) || domains[0] || null;
    const currentProgression = this.getDomainProgression(userId, currentDomainId);

    const activeDomainStats = {
      completedCount: currentProgression.completedTopics,
      totalCount: currentProgression.totalTopics,
      percentage: currentProgression.percentage
    };

    // The user's active/current domain is never locked for them
    if (targetDomainId === currentDomainId) {
      return {
        isLocked: false,
        activeDomain,
        activeDomainStats,
        isCurrentDomainCompleted: currentProgression.isCompleted
      };
    }

    // If the student has started ANY topic in their current domain and has NOT finished all topics:
    if (currentProgression.hasStarted && !currentProgression.isCompleted) {
      return {
        isLocked: true,
        reason: `Domain Locked: You are currently enrolled in "${activeDomain?.name || 'your domain'}". You must complete all ${currentProgression.totalTopics} topics (${currentProgression.completedTopics}/${currentProgression.totalTopics} completed) before starting or switching to another domain.`,
        activeDomain,
        activeDomainStats,
        isCurrentDomainCompleted: false
      };
    }

    // Otherwise, other domains are unlocked (user hasn't started yet or current domain is 100% completed)
    return {
      isLocked: false,
      activeDomain,
      activeDomainStats,
      isCurrentDomainCompleted: currentProgression.isCompleted
    };
  },

  /**
   * Recommends the next optimal topic to learn with curated resources.
   * In a strict sequential model, this returns the first uncompleted topic
   * whose prerequisites are satisfied (which is the active unlocked topic).
   */
  getNextTopicRecommendation(userId: string, domainId: string): NextTopicRecommendation | null {
    const domain = storageService.getDomains().find(d => d.id === domainId);
    if (!domain) return null;

    const sequence = this.getDomainTopicSequence(domainId);
    const userProgress = storageService.getUserProgress(userId);
    const completedTopicIds = new Set(
      userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
    );

    const courses = storageService.getCoursesByDomain(domainId);

    // Look for first uncompleted topic in the strict sequential order
    for (const topic of sequence) {
      if (!completedTopicIds.has(topic.id)) {
        const lockInfo = this.getTopicLockInfo(userId, topic);
        if (!lockInfo.isLocked) {
          const course = courses.find(c => c.id === topic.courseId) || courses[0];
          const resources = storageService.getResourcesByTopic(topic.id);
          const reason = lockInfo.previousTopic
            ? `Immediate next topic after completing "${lockInfo.previousTopic.title}". Ready to study!`
            : 'Foundational entry topic to begin your learning roadmap.';

          return {
            topic,
            course,
            domain,
            reason,
            recommendedResources: resources.slice(0, 3),
            prerequisitesMet: true
          };
        }
      }
    }

    // If all topics in sequence completed
    if (sequence.length > 0 && courses.length > 0) {
      const lastTopic = sequence[sequence.length - 1];
      const lastCourse = courses.find(c => c.id === lastTopic.courseId) || courses[0];
      return {
        topic: lastTopic,
        course: lastCourse,
        domain,
        reason: 'Entire curriculum completed! Review final capstone material.',
        recommendedResources: storageService.getResourcesByTopic(lastTopic.id),
        prerequisitesMet: true
      };
    }

    return null;
  },

  /**
   * Filter and prioritize resources by learner's preferred type and difficulty.
   */
  getFilteredResources(topicId: string, filterType?: string, search?: string): Resource[] {
    let resources = storageService.getResourcesByTopic(topicId);
    
    if (filterType && filterType !== 'all') {
      resources = resources.filter(r => r.type === filterType);
    }

    if (search && search.trim()) {
      const query = search.toLowerCase();
      resources = resources.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.description.toLowerCase().includes(query) ||
        r.source.toLowerCase().includes(query)
      );
    }

    return resources;
  }
};
