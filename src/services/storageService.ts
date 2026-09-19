import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Domain,
  Course,
  Topic,
  Resource,
  QuizQuestion,
  User,
  UserTopicProgress,
  UserActivityLog,
  OTPRecord,
  SearchHistoryItem,
  CachedRoadmapSnapshot,
  OfflineCacheSummary,
  DomainExtraResource
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DOMAINS,
  INITIAL_COURSES,
  INITIAL_TOPICS,
  INITIAL_RESOURCES,
  INITIAL_QUIZZES,
  INITIAL_USER_PROGRESS,
  INITIAL_ACTIVITY_LOGS
} from '../data/seedData';
import { DOMAIN_EXTRA_RESOURCES } from '../data/domainExtraResourcesData';

const STORAGE_KEYS = {
  USERS: 'plrrs_users',
  DOMAINS: 'plrrs_domains',
  COURSES: 'plrrs_courses',
  TOPICS: 'plrrs_topics',
  RESOURCES: 'plrrs_resources',
  QUIZZES: 'plrrs_quizzes',
  PROGRESS: 'plrrs_progress',
  ACTIVITY_LOGS: 'plrrs_activity_logs',
  OTPS: 'plrrs_otps',
  CURRENT_USER_ID: 'plrrs_current_user_id',
  SEARCH_HISTORY: 'plrrs_search_history',
  FIRESTORE_SEEDED: 'plrrs_firestore_seeded_v1',
  CACHED_ROADMAPS: 'coengineer_cached_roadmaps',
  LAST_ACCESSED_ROADMAP_ID: 'coengineer_last_accessed_roadmap',
  BOOKMARKS: 'plrrs_resource_bookmarks',
  COMPLETED_RESOURCES: 'plrrs_completed_resources'
};

// Helper for safe JSON reading
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to parse ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write ${key} to storage:`, e);
  }
}

/**
 * Deduplicates an array of objects with an `id` property, ensuring each ID appears at most once.
 * Preserves the latest object properties if duplicates are encountered.
 */
export function deduplicateById<T extends { id?: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  const map = new Map<string, T>();
  for (const item of items) {
    if (item && item.id) {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    }
  }
  return Array.from(map.values());
}

/**
 * Deduplicates progress entries keyed by `${userId}_${topicId}`.
 */
export function deduplicateProgress(items: UserTopicProgress[]): UserTopicProgress[] {
  if (!Array.isArray(items)) return [];
  const map = new Map<string, UserTopicProgress>();
  for (const item of items) {
    if (item && item.userId && item.topicId) {
      const key = `${item.userId}_${item.topicId}`;
      map.set(key, { ...(map.get(key) || {}), ...item });
    }
  }
  return Array.from(map.values());
}

// Listeners for UI real-time refresh
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (err) {
      console.error('Error notifying storage listener', err);
    }
  });
}

/**
 * Recursively removes all `undefined` values from an object or array.
 * Firestore strictly rejects documents containing fields with `undefined` values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean as T;
  }
  return data;
}

function safeFirestoreWrite(promiseOrFn: Promise<unknown> | (() => Promise<unknown>), desc: string): void {
  try {
    const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
    promise.catch((err: any) => {
      if (err?.code === 'unavailable' || err?.message?.includes('offline') || err?.message?.includes('backend')) {
        console.info(`Firestore [${desc}]: Saved locally, will sync when online.`);
      } else {
        console.warn(`Firestore [${desc}] note:`, err?.message || err);
      }
    });
  } catch (err: any) {
    console.warn(`Firestore [${desc}] synchronous call prevented crash:`, err?.message || err);
  }
}

export const storageService = {
  subscribe(listener: StorageListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Initializes storage with local cache and asynchronously syncs/seeds to Firestore Database.
   */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.DOMAINS)) {
      this.resetToDefaults();
    }

    // Trigger async Firestore sync and seed
    this.syncFromFirestore().catch(err => {
      console.warn('Firestore initial sync encountered an issue, running with cached data:', err);
    });
  },

  async syncFromFirestore(): Promise<void> {
    try {
      // If browser is explicitly offline, skip remote fetch and rely on cached data
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.info('Firestore: Client is offline, loading cached data.');
        return;
      }

      // Query collections with timeout protection
      const fetchWithTimeout = <T>(promise: Promise<T>, timeoutMs = 7000): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore operation timed out')), timeoutMs)
          )
        ]);
      };

      const [usersSnap, resourcesSnap] = await Promise.all([
        fetchWithTimeout(getDocs(collection(db, 'users'))).catch(() => null),
        fetchWithTimeout(getDocs(collection(db, 'resources'))).catch(() => null)
      ]);

      if (!usersSnap || !resourcesSnap) {
        console.info('Firestore: Backend unreachable at startup, continuing with local cached dataset.');
        return;
      }

      if (usersSnap.empty && resourcesSnap.empty) {
        // Seed initial data to Firestore database using a fast atomic batch
        await this.seedInitialDataToFirestore();
      } else {
        // Load cloud data from Firestore into local cache to keep real-time parity
        if (!usersSnap.empty) {
          const cloudUsers: User[] = [];
          usersSnap.forEach(docSnap => {
            const data = docSnap.data() as User;
            if (data) cloudUsers.push({ ...data, id: data.id || docSnap.id });
          });
          if (cloudUsers.length > 0) {
            saveToStorage(STORAGE_KEYS.USERS, deduplicateById(cloudUsers));
          }
        }

        if (!resourcesSnap.empty) {
          const cloudResources: Resource[] = [];
          resourcesSnap.forEach(docSnap => {
            const data = docSnap.data() as Resource;
            if (data) cloudResources.push({ ...data, id: data.id || docSnap.id });
          });
          if (cloudResources.length > 0) {
            saveToStorage(STORAGE_KEYS.RESOURCES, deduplicateById(cloudResources));
          }
        }

        // Pull domains, courses, topics, progress in parallel with error tolerance
        const [domainsSnap, coursesSnap, topicsSnap, progressSnap] = await Promise.all([
          getDocs(collection(db, 'domains')).catch(() => null),
          getDocs(collection(db, 'courses')).catch(() => null),
          getDocs(collection(db, 'topics')).catch(() => null),
          getDocs(collection(db, 'progress')).catch(() => null)
        ]);

        if (domainsSnap && !domainsSnap.empty) {
          const cloudDomains: Domain[] = [];
          domainsSnap.forEach(d => {
            const data = d.data() as Domain;
            if (data) cloudDomains.push({ ...data, id: data.id || d.id });
          });
          const cleanDomains = deduplicateById(cloudDomains).sort((a, b) => a.order - b.order);
          saveToStorage(STORAGE_KEYS.DOMAINS, cleanDomains);
        }

        if (coursesSnap && !coursesSnap.empty) {
          const cloudCourses: Course[] = [];
          coursesSnap.forEach(d => {
            const data = d.data() as Course;
            if (data) cloudCourses.push({ ...data, id: data.id || d.id });
          });
          const cleanCourses = deduplicateById(cloudCourses).sort((a, b) => a.order - b.order);
          saveToStorage(STORAGE_KEYS.COURSES, cleanCourses);
        }

        if (topicsSnap && !topicsSnap.empty) {
          const cloudTopics: Topic[] = [];
          topicsSnap.forEach(d => {
            const data = d.data() as Topic;
            if (data) cloudTopics.push({ ...data, id: data.id || d.id });
          });
          const cleanTopics = deduplicateById(cloudTopics).sort((a, b) => a.order - b.order);
          saveToStorage(STORAGE_KEYS.TOPICS, cleanTopics);
        }

        if (progressSnap && !progressSnap.empty) {
          const cloudProgress: UserTopicProgress[] = [];
          progressSnap.forEach(d => {
            const data = d.data() as UserTopicProgress;
            if (data) cloudProgress.push(data);
          });
          saveToStorage(STORAGE_KEYS.PROGRESS, deduplicateProgress(cloudProgress));
        }

        notifyListeners();
      }
    } catch (error) {
      console.info('Firestore: Synced with cached data (offline mode active)');
    }
  },

  /**
   * Seeds initial datasets (Users, Resources, Domains, Courses, Topics, Quizzes) into Firestore in an atomic batch.
   */
  async seedInitialDataToFirestore(): Promise<void> {
    try {
      console.log('Seeding initial records to Firestore database via batch...');
      const batch = writeBatch(db);

      for (const user of INITIAL_USERS) {
        batch.set(doc(db, 'users', user.id), sanitizeForFirestore(user));
      }
      for (const res of INITIAL_RESOURCES) {
        batch.set(doc(db, 'resources', res.id), sanitizeForFirestore(res));
      }
      for (const domain of INITIAL_DOMAINS) {
        batch.set(doc(db, 'domains', domain.id), sanitizeForFirestore(domain));
      }
      for (const course of INITIAL_COURSES) {
        batch.set(doc(db, 'courses', course.id), sanitizeForFirestore(course));
      }
      for (const topic of INITIAL_TOPICS) {
        batch.set(doc(db, 'topics', topic.id), sanitizeForFirestore(topic));
      }
      for (const quiz of INITIAL_QUIZZES) {
        batch.set(doc(db, 'quizzes', quiz.id), sanitizeForFirestore(quiz));
      }
      for (const prog of INITIAL_USER_PROGRESS) {
        const progDocId = `${prog.userId}_${prog.topicId}`;
        batch.set(doc(db, 'progress', progDocId), sanitizeForFirestore(prog));
      }

      await batch.commit();
      localStorage.setItem(STORAGE_KEYS.FIRESTORE_SEEDED, 'true');
      console.log('Successfully seeded database in Firestore.');
    } catch (error) {
      console.warn('Firestore initial batch seed note (will retry or operate offline):', error);
    }
  },

  resetToDefaults() {
    saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveToStorage(STORAGE_KEYS.DOMAINS, INITIAL_DOMAINS);
    saveToStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    saveToStorage(STORAGE_KEYS.TOPICS, INITIAL_TOPICS);
    saveToStorage(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    saveToStorage(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
    saveToStorage(STORAGE_KEYS.PROGRESS, INITIAL_USER_PROGRESS);
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    saveToStorage(STORAGE_KEYS.OTPS, []);
    // Do not auto-login to any account by default; require user to sign in
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  // Current user session
  getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  setCurrentUserId(id: string | null) {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
    notifyListeners();
  },

  // Users - Read & Write to Firestore Database
  getUsers(): User[] {
    const rawStored = getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const stored = deduplicateById(rawStored);
    const missing = INITIAL_USERS.filter(u => !stored.some(s => s.id === u.id));
    const merged = deduplicateById([...stored, ...missing]);
    if (rawStored.length !== merged.length) {
      saveToStorage(STORAGE_KEYS.USERS, merged);
    }
    return merged;
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const updated = deduplicateById([
      ...users.filter(u => u.id !== user.id),
      user
    ]);
    saveToStorage(STORAGE_KEYS.USERS, updated);
    notifyListeners();

    // Persist immediately to Firestore database
    safeFirestoreWrite(() => setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user)), `persist user ${user.id}`);
  },

  updateUserStatus(userId: string, status: 'active' | 'suspended'): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      saveToStorage(STORAGE_KEYS.USERS, users);
      notifyListeners();

      // Persist to Firestore
      safeFirestoreWrite(() => setDoc(doc(db, 'users', userId), { status }, { merge: true }), `update status ${userId}`);
    }
  },

  updateUserRole(userId: string, role: 'admin' | 'user'): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      saveToStorage(STORAGE_KEYS.USERS, users);
      notifyListeners();

      // Persist to Firestore
      safeFirestoreWrite(() => setDoc(doc(db, 'users', userId), { role }, { merge: true }), `update role ${userId}`);
    }
  },

  deleteUser(userId: string): void {
    const users = this.getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    saveToStorage(STORAGE_KEYS.USERS, updatedUsers);

    // Clean up local progress records & logs for this user
    const allProgress = getFromStorage<UserTopicProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_USER_PROGRESS);
    saveToStorage(STORAGE_KEYS.PROGRESS, allProgress.filter(p => p.userId !== userId));

    const allLogs = getFromStorage<UserActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, allLogs.filter(l => l.userId !== userId));

    notifyListeners();

    // Persist deletion to Firestore database
    safeFirestoreWrite(() => deleteDoc(doc(db, 'users', userId)), `delete user ${userId}`);
  },

  // Resource Library Bookmarks & Completion
  getBookmarkedResources(userId: string): string[] {
    const all = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.BOOKMARKS, {});
    return all[userId] || [];
  },

  toggleBookmarkResource(userId: string, resourceId: string): boolean {
    const all = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.BOOKMARKS, {});
    const list = all[userId] || [];
    const exists = list.includes(resourceId);
    const updated = exists ? list.filter(id => id !== resourceId) : [...list, resourceId];
    all[userId] = updated;
    saveToStorage(STORAGE_KEYS.BOOKMARKS, all);
    notifyListeners();
    return !exists;
  },

  getCompletedResources(userId: string): string[] {
    const all = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.COMPLETED_RESOURCES, {});
    return all[userId] || [];
  },

  toggleCompleteResource(userId: string, resourceId: string): boolean {
    const all = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.COMPLETED_RESOURCES, {});
    const list = all[userId] || [];
    const exists = list.includes(resourceId);
    const updated = exists ? list.filter(id => id !== resourceId) : [...list, resourceId];
    all[userId] = updated;
    saveToStorage(STORAGE_KEYS.COMPLETED_RESOURCES, all);
    notifyListeners();
    return !exists;
  },

  // Domains
  getDomains(): Domain[] {
    const rawStored = getFromStorage<Domain[]>(STORAGE_KEYS.DOMAINS, INITIAL_DOMAINS);
    const stored = deduplicateById(rawStored);
    const missing = INITIAL_DOMAINS.filter(d => !stored.some(s => s.id === d.id));
    const merged = deduplicateById([...stored, ...missing]).sort((a, b) => a.order - b.order);
    if (rawStored.length !== merged.length) {
      saveToStorage(STORAGE_KEYS.DOMAINS, merged);
    }
    return merged;
  },

  saveDomain(domain: Domain): void {
    const domains = this.getDomains();
    const updated = deduplicateById([
      ...domains.filter(d => d.id !== domain.id),
      domain
    ]).sort((a, b) => a.order - b.order);
    saveToStorage(STORAGE_KEYS.DOMAINS, updated);
    notifyListeners();

    // Persist to Firestore
    safeFirestoreWrite(() => setDoc(doc(db, 'domains', domain.id), sanitizeForFirestore(domain)), `save domain ${domain.id}`);
  },

  deleteDomain(id: string): void {
    const domains = this.getDomains().filter(d => d.id !== id);
    saveToStorage(STORAGE_KEYS.DOMAINS, domains);
    notifyListeners();

    // Delete in Firestore
    safeFirestoreWrite(() => deleteDoc(doc(db, 'domains', id)), `delete domain ${id}`);
  },

  // Courses
  getCourses(): Course[] {
    const rawStored = getFromStorage<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    const stored = deduplicateById(rawStored);
    const missing = INITIAL_COURSES.filter(c => !stored.some(s => s.id === c.id));
    const merged = deduplicateById([...stored, ...missing]).sort((a, b) => a.order - b.order);
    if (rawStored.length !== merged.length) {
      saveToStorage(STORAGE_KEYS.COURSES, merged);
    }
    return merged;
  },

  getCoursesByDomain(domainId: string): Course[] {
    return this.getCourses()
      .filter(c => c.domainId === domainId)
      .sort((a, b) => a.order - b.order);
  },

  saveCourse(course: Course): void {
    const courses = this.getCourses();
    const updated = deduplicateById([
      ...courses.filter(c => c.id !== course.id),
      course
    ]).sort((a, b) => a.order - b.order);
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    notifyListeners();

    // Persist to Firestore
    safeFirestoreWrite(() => setDoc(doc(db, 'courses', course.id), sanitizeForFirestore(course)), `save course ${course.id}`);
  },

  deleteCourse(id: string): void {
    const courses = this.getCourses().filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.COURSES, courses);
    // Also cleanup topics belonging to course
    const topics = this.getTopics().filter(t => t.courseId !== id);
    saveToStorage(STORAGE_KEYS.TOPICS, topics);
    notifyListeners();

    // Delete in Firestore
    safeFirestoreWrite(() => deleteDoc(doc(db, 'courses', id)), `delete course ${id}`);
  },

  // Topics
  getTopics(): Topic[] {
    const rawStored = getFromStorage<Topic[]>(STORAGE_KEYS.TOPICS, INITIAL_TOPICS);
    const stored = deduplicateById(rawStored);
    const missing = INITIAL_TOPICS.filter(t => !stored.some(s => s.id === t.id));
    const merged = deduplicateById([...stored, ...missing]).sort((a, b) => a.order - b.order);
    if (rawStored.length !== merged.length) {
      saveToStorage(STORAGE_KEYS.TOPICS, merged);
    }
    return merged;
  },

  getTopicsByDomain(domainId: string): Topic[] {
    return this.getTopics().filter(t => t.domainId === domainId);
  },

  getTopicsByCourse(courseId: string): Topic[] {
    return this.getTopics()
      .filter(t => t.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },

  saveTopic(topic: Topic): void {
    const topics = this.getTopics();
    const updated = deduplicateById([
      ...topics.filter(t => t.id !== topic.id),
      topic
    ]).sort((a, b) => a.order - b.order);
    saveToStorage(STORAGE_KEYS.TOPICS, updated);
    notifyListeners();

    // Persist to Firestore
    safeFirestoreWrite(() => setDoc(doc(db, 'topics', topic.id), sanitizeForFirestore(topic)), `save topic ${topic.id}`);
  },

  deleteTopic(id: string): void {
    const topics = this.getTopics().filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TOPICS, topics);
    // Also remove any prerequisites pointing to this topic
    const cleaned = topics.map(t => ({
      ...t,
      prerequisiteTopicIds: t.prerequisiteTopicIds.filter(pid => pid !== id)
    }));
    saveToStorage(STORAGE_KEYS.TOPICS, cleaned);
    // Clean up resources for this topic
    const resources = this.getResources().filter(r => r.topicId !== id);
    saveToStorage(STORAGE_KEYS.RESOURCES, resources);
    notifyListeners();

    // Delete in Firestore
    safeFirestoreWrite(() => deleteDoc(doc(db, 'topics', id)), `delete topic ${id}`);
  },

  // Resources - Read & Write to Firestore Database
  getResources(): Resource[] {
    const rawStored = getFromStorage<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const stored = deduplicateById(rawStored);
    const missing = INITIAL_RESOURCES.filter(r => !stored.some(s => s.id === r.id));
    const merged = deduplicateById([...stored, ...missing]);
    if (rawStored.length !== merged.length) {
      saveToStorage(STORAGE_KEYS.RESOURCES, merged);
    }
    return merged;
  },

  getResourcesByTopic(topicId: string): Resource[] {
    return this.getResources().filter(r => r.topicId === topicId);
  },

  saveResource(resource: Resource): void {
    const resources = this.getResources();
    const updated = deduplicateById([
      ...resources.filter(r => r.id !== resource.id),
      resource
    ]);
    saveToStorage(STORAGE_KEYS.RESOURCES, updated);
    notifyListeners();

    // Persist to Firestore database
    safeFirestoreWrite(() => setDoc(doc(db, 'resources', resource.id), sanitizeForFirestore(resource)), `persist resource ${resource.id}`);
  },

  deleteResource(id: string): void {
    const resources = this.getResources().filter(r => r.id !== id);
    saveToStorage(STORAGE_KEYS.RESOURCES, resources);
    notifyListeners();

    // Delete from Firestore database
    safeFirestoreWrite(() => deleteDoc(doc(db, 'resources', id)), `delete resource ${id}`);
  },

  // Quizzes
  getQuizzes(): QuizQuestion[] {
    const rawStored = getFromStorage<QuizQuestion[]>(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
    const stored = deduplicateById(rawStored);
    const missing = INITIAL_QUIZZES.filter(q => !stored.some(s => s.id === q.id));
    const merged = deduplicateById([...stored, ...missing]);
    if (rawStored.length !== merged.length) {
      saveToStorage(STORAGE_KEYS.QUIZZES, merged);
    }
    return merged;
  },

  getQuizzesByTopic(topicId: string): QuizQuestion[] {
    return this.getQuizzes().filter(q => q.topicId === topicId);
  },

  saveQuiz(quiz: QuizQuestion): void {
    const quizzes = this.getQuizzes();
    const updated = deduplicateById([
      ...quizzes.filter(q => q.id !== quiz.id),
      quiz
    ]);
    saveToStorage(STORAGE_KEYS.QUIZZES, updated);
    notifyListeners();

    // Persist to Firestore
    safeFirestoreWrite(() => setDoc(doc(db, 'quizzes', quiz.id), sanitizeForFirestore(quiz)), `persist quiz ${quiz.id}`);
  },

  // Progress
  getUserProgress(userId: string): UserTopicProgress[] {
    const all = getFromStorage<UserTopicProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_USER_PROGRESS);
    return all.filter(p => p.userId === userId);
  },

  setUserTopicStatus(userId: string, topicId: string, status: 'completed' | 'in_progress' | 'locked', score?: number): void {
    const all = getFromStorage<UserTopicProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_USER_PROGRESS);
    const existingIndex = all.findIndex(p => p.userId === userId && p.topicId === topicId);
    
    const record: UserTopicProgress = {
      userId,
      topicId,
      status
    };

    if (status === 'completed') {
      record.completedAt = new Date().toISOString();
    } else if (existingIndex >= 0 && all[existingIndex].completedAt) {
      record.completedAt = all[existingIndex].completedAt;
    }

    const resolvedScore = score !== undefined ? score : (existingIndex >= 0 ? all[existingIndex].quizScore : undefined);
    if (resolvedScore !== undefined) {
      record.quizScore = resolvedScore;
    }

    if (existingIndex >= 0) {
      all[existingIndex] = record;
    } else {
      all.push(record);
    }

    saveToStorage(STORAGE_KEYS.PROGRESS, all);
    notifyListeners();

    // Persist to Firestore database safely
    const progDocId = `${userId}_${topicId}`;
    const sanitizedRecord = sanitizeForFirestore(record);
    safeFirestoreWrite(() => setDoc(doc(db, 'progress', progDocId), sanitizedRecord), `progress ${progDocId}`);
  },

  // Activity Logs
  getActivityLogs(userId?: string): UserActivityLog[] {
    const logs = getFromStorage<UserActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    if (userId) {
      return logs.filter(l => l.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  logActivity(log: Omit<UserActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.getActivityLogs();
    const newLog: UserActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 100 entries
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, logs.slice(0, 100));
    notifyListeners();

    // Persist to Firestore safely
    const sanitizedLog = sanitizeForFirestore(newLog);
    safeFirestoreWrite(() => setDoc(doc(db, 'activityLogs', newLog.id), sanitizedLog), `activityLog ${newLog.id}`);
  },

  // OTP simulation
  saveOTP(email: string, otp: string): void {
    const otps = getFromStorage<OTPRecord[]>(STORAGE_KEYS.OTPS, []);
    const filtered = otps.filter(o => o.email.toLowerCase() !== email.toLowerCase());
    filtered.push({
      email: email.toLowerCase(),
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    });
    saveToStorage(STORAGE_KEYS.OTPS, filtered);
  },

  verifyOTP(email: string, otp: string): boolean {
    const otps = getFromStorage<OTPRecord[]>(STORAGE_KEYS.OTPS, []);
    const record = otps.find(o => o.email.toLowerCase() === email.toLowerCase() && o.otp === otp);
    if (!record) return false;
    if (Date.now() > record.expiresAt) return false;
    return true;
  },

  // Search History
  getSearchHistory(): SearchHistoryItem[] {
    return getFromStorage<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
  },

  saveSearchHistory(query: string, target?: { title: string; category: 'topic' | 'course' | 'resource' }): SearchHistoryItem[] {
    const trimmed = query.trim();
    if (!trimmed && !target) return this.getSearchHistory();

    const history = this.getSearchHistory();
    // Filter out duplicate query (case-insensitive) or same target
    const filtered = history.filter(item => {
      if (trimmed && item.query.toLowerCase() === trimmed.toLowerCase()) return false;
      if (!trimmed && target && item.targetTitle === target.title) return false;
      return true;
    });

    const newItem: SearchHistoryItem = {
      id: `sh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      query: trimmed || (target ? target.title : ''),
      timestamp: new Date().toISOString(),
      targetTitle: target?.title,
      targetCategory: target?.category
    };

    const updated = [newItem, ...filtered].slice(0, 15);
    saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, updated);
    notifyListeners();
    return updated;
  },

  removeSearchHistoryItem(id: string): SearchHistoryItem[] {
    const history = this.getSearchHistory();
    const updated = history.filter(item => item.id !== id);
    saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, updated);
    notifyListeners();
    return updated;
  },

  clearSearchHistory(): void {
    saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, []);
    notifyListeners();
  },

  // ==========================================
  // OFFLINE ROADMAP CACHING LAYER
  // ==========================================

  cacheRoadmapSnapshot(domainId: string, userId: string): CachedRoadmapSnapshot | null {
    try {
      const domain = this.getDomains().find(d => d.id === domainId);
      if (!domain) return null;

      const courses = this.getCoursesByDomain(domainId);
      const topics = this.getTopicsByDomain(domainId);
      const topicIds = new Set(topics.map(t => t.id));
      const resources = this.getResources().filter(r => topicIds.has(r.topicId));
      const quizzes = this.getQuizzes().filter(q => topicIds.has(q.topicId));
      const userProgress = this.getUserProgress(userId).filter(p => topicIds.has(p.topicId));

      const completedTopicsCount = userProgress.filter(p => p.status === 'completed').length;
      const progressPercentage = topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0;

      const snapshot: CachedRoadmapSnapshot = {
        id: `cached-${domainId}-${userId}`,
        domainId,
        userId,
        domain,
        courses,
        topics,
        resources,
        quizzes,
        userProgress,
        cachedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        totalTopicsCount: topics.length,
        completedTopicsCount,
        progressPercentage,
        version: 1
      };

      const cachedList = getFromStorage<CachedRoadmapSnapshot[]>(STORAGE_KEYS.CACHED_ROADMAPS, []);
      // Filter out existing snapshot for this domain and user
      const filtered = cachedList.filter(item => !(item.domainId === domainId && item.userId === userId));
      const updatedList = [snapshot, ...filtered];

      saveToStorage(STORAGE_KEYS.CACHED_ROADMAPS, updatedList);
      saveToStorage(STORAGE_KEYS.LAST_ACCESSED_ROADMAP_ID, domainId);
      notifyListeners();
      return snapshot;
    } catch (err) {
      console.error('Error caching roadmap snapshot for offline:', err);
      return null;
    }
  },

  getCachedRoadmaps(userId?: string): CachedRoadmapSnapshot[] {
    const list = getFromStorage<CachedRoadmapSnapshot[]>(STORAGE_KEYS.CACHED_ROADMAPS, []);
    const map = new Map<string, CachedRoadmapSnapshot>();
    for (const item of list) {
      if (item && item.domainId) {
        const key = item.id || `${item.domainId}_${item.userId || ''}`;
        if (!map.has(key)) {
          map.set(key, item);
        }
      }
    }
    const uniqueList = Array.from(map.values());
    if (userId) {
      return uniqueList.filter(item => item.userId === userId);
    }
    return uniqueList;
  },

  getCachedRoadmap(domainId: string, userId?: string): CachedRoadmapSnapshot | null {
    const list = this.getCachedRoadmaps(userId);
    return list.find(item => item.domainId === domainId) || null;
  },

  isRoadmapCached(domainId: string, userId?: string): boolean {
    return Boolean(this.getCachedRoadmap(domainId, userId));
  },

  getLastAccessedRoadmap(userId?: string): CachedRoadmapSnapshot | null {
    const lastDomainId = getFromStorage<string | null>(STORAGE_KEYS.LAST_ACCESSED_ROADMAP_ID, null);
    const list = this.getCachedRoadmaps(userId);
    if (lastDomainId) {
      const found = list.find(item => item.domainId === lastDomainId);
      if (found) return found;
    }
    return list[0] || null;
  },

  setLastAccessedRoadmapId(domainId: string): void {
    saveToStorage(STORAGE_KEYS.LAST_ACCESSED_ROADMAP_ID, domainId);
    notifyListeners();
  },

  removeCachedRoadmap(domainId: string, userId?: string): void {
    const list = getFromStorage<CachedRoadmapSnapshot[]>(STORAGE_KEYS.CACHED_ROADMAPS, []);
    const filtered = list.filter(item => {
      if (userId) {
        return !(item.domainId === domainId && item.userId === userId);
      }
      return item.domainId !== domainId;
    });
    saveToStorage(STORAGE_KEYS.CACHED_ROADMAPS, filtered);
    notifyListeners();
  },

  clearAllCachedRoadmaps(): void {
    saveToStorage(STORAGE_KEYS.CACHED_ROADMAPS, []);
    saveToStorage(STORAGE_KEYS.LAST_ACCESSED_ROADMAP_ID, null);
    notifyListeners();
  },

  getOfflineCacheSummary(userId?: string): OfflineCacheSummary {
    const list = this.getCachedRoadmaps(userId);
    const lastAccessedDomainId = getFromStorage<string | null>(STORAGE_KEYS.LAST_ACCESSED_ROADMAP_ID, null);
    return {
      totalCachedRoadmaps: list.length,
      lastAccessedDomainId,
      lastCachedAt: list.length > 0 ? list[0].cachedAt : null,
      cachedDomains: list.map(item => ({
        domainId: item.domainId,
        domainName: item.domain.name,
        cachedAt: item.cachedAt,
        topicsCount: item.totalTopicsCount,
        progressPercentage: item.progressPercentage
      }))
    };
  },

  // Domain Extra Resource (Capstone & Important Problems)
  getDomainExtraResource(domainId: string): DomainExtraResource | undefined {
    return DOMAIN_EXTRA_RESOURCES[domainId];
  },

  getAllDomainExtraResources(): DomainExtraResource[] {
    return Object.values(DOMAIN_EXTRA_RESOURCES);
  },

  /**
   * Checks if user has completed all regular topics in the domain (100% completion).
   * Note: Touching or solving the extra capstone resource is optional and does NOT block domain completion!
   */
  isDomainFullyCompleted(userId: string, domainId: string): boolean {
    const topics = this.getTopicsByDomain(domainId);
    if (topics.length === 0) return false;
    const progress = this.getUserProgress(userId);
    const completedIds = new Set(progress.filter(p => p.status === 'completed').map(p => p.topicId));
    return topics.every(t => completedIds.has(t.id));
  },

  /**
   * Demo & Testing convenience method:
   * Quickly toggles all topics in the target domain between 100% completed and in-progress.
   * Enables immediate live testing of both locked/blurred and unlocked states!
   */
  toggleDomainCompletionDemo(userId: string, domainId: string): boolean {
    const topics = this.getTopicsByDomain(domainId);
    const isCompleted = this.isDomainFullyCompleted(userId, domainId);
    
    if (isCompleted) {
      // Reset back to partial state (keep first 2 topics completed, rest in-progress or locked)
      topics.forEach((t, idx) => {
        if (idx === 0) {
          this.setUserTopicStatus(userId, t.id, 'completed', 100);
        } else if (idx === 1) {
          this.setUserTopicStatus(userId, t.id, 'in_progress');
        } else {
          this.setUserTopicStatus(userId, t.id, 'locked');
        }
      });
      return false; // Now incomplete
    } else {
      // Mark all topics as completed
      topics.forEach(t => {
        this.setUserTopicStatus(userId, t.id, 'completed', 100);
      });
      return true; // Now 100% completed
    }
  }
};
