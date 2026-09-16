export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  selectedDomainId: string;
  skills: string[];
  avatarUrl?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  password?: string;
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  accentColor: string;
  order: number;
}

export interface Course {
  id: string;
  domainId: string;
  title: string;
  description: string;
  order: number;
  prerequisiteCourseIds?: string[];
}

export interface Topic {
  id: string;
  courseId: string;
  domainId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  prerequisiteTopicIds: string[];
  keySkills: string[];
}

export type ResourceType = 'documentation' | 'video' | 'article' | 'practice' | 'quiz';

export interface Resource {
  id: string;
  topicId: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  durationOrReadTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: string;
  isRecommended?: boolean;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserTopicProgress {
  userId: string;
  topicId: string;
  status: 'completed' | 'in_progress' | 'locked';
  completedAt?: string;
  quizScore?: number;
}

export type UserProgress = UserTopicProgress;

export interface UserActivityLog {
  id: string;
  userId: string;
  action: 'completed_topic' | 'started_topic' | 'passed_quiz' | 'switched_domain' | 'updated_skills' | 'completed_resource';
  topicId?: string;
  topicTitle?: string;
  domainId?: string;
  timestamp: string;
  details?: string;
}

export interface SkillGapResult {
  knownSkills: string[];
  missingSkills: string[];
  totalRequiredSkills: number;
  matchPercentage: number;
  acceleratedTopicIds: string[];
  remainingTopicCount: number;
}

export interface NextTopicRecommendation {
  topic: Topic;
  course: Course;
  domain: Domain;
  reason: string;
  recommendedResources: Resource[];
  prerequisitesMet: boolean;
}

export interface OTPRecord {
  email: string;
  otp: string;
  expiresAt: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  targetTitle?: string;
  targetCategory?: 'topic' | 'course' | 'resource';
}

export interface DomainLockStatus {
  isLocked: boolean;
  reason?: string;
  activeDomain: Domain | null;
  activeDomainStats: {
    completedCount: number;
    totalCount: number;
    percentage: number;
  };
  isCurrentDomainCompleted: boolean;
}

export interface TopicLockInfo {
  isLocked: boolean;
  reason?: string;
  previousTopic?: Topic;
  unmetPrereqTopics: Topic[];
  unmetPrereqCourses: Course[];
}

export interface CachedRoadmapSnapshot {
  id: string; // e.g., 'cached-domain-{domainId}-{userId}'
  domainId: string;
  userId: string;
  domain: Domain;
  courses: Course[];
  topics: Topic[];
  resources: Resource[];
  quizzes: QuizQuestion[];
  userProgress: UserTopicProgress[];
  cachedAt: string; // ISO String
  lastAccessedAt: string; // ISO String
  totalTopicsCount: number;
  completedTopicsCount: number;
  progressPercentage: number;
  version: number;
}

export interface OfflineCacheSummary {
  totalCachedRoadmaps: number;
  lastAccessedDomainId: string | null;
  lastCachedAt: string | null;
  cachedDomains: {
    domainId: string;
    domainName: string;
    cachedAt: string;
    topicsCount: number;
    progressPercentage: number;
  }[];
}

export interface DomainProblemHint {
  id: string;
  order: number;
  label: string; // e.g., "Hint 1: Conceptual Direction", "Hint 2: Algorithmic Strategy"
  content: string; // Strictly hints, never solutions
}

export interface DomainImportantProblem {
  id: string;
  domainId: string;
  title: string;
  difficulty: 'intermediate' | 'advanced' | 'mastery';
  tags: string[];
  scenarioDescription: string;
  keyQuestionsToSolve: string[];
  hints: DomainProblemHint[]; // Strictly hints only, no solutions
  estimatedEffort: string;
  category: string;
}

export interface DomainExtraResource {
  id: string;
  domainId: string;
  title: string;
  subtitle: string;
  description: string;
  isOptional: true;
  badgeText: string;
  keyCompetencies: string[];
  problems: DomainImportantProblem[];
  externalReferences?: {
    title: string;
    url: string;
    source: string;
  }[];
}
