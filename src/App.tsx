import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider, useOffline } from './context/OfflineContext';
import { Navbar } from './components/common/Navbar';
import { OfflineBanner } from './components/common/OfflineBanner';
import { OfflineManagerModal } from './components/common/OfflineManagerModal';
import { LearnerDashboard } from './components/learner/LearnerDashboard';
import { RoadmapView } from './components/learner/RoadmapView';
import { ResourcesHub } from './components/learner/ResourcesHub';
import { UserAnalytics } from './components/learner/UserAnalytics';
import { TopicDetailModal } from './components/learner/TopicDetailModal';
import { OnboardingWizard } from './components/learner/OnboardingWizard';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { DomainManager } from './components/admin/DomainManager';
import { CourseManager } from './components/admin/CourseManager';
import { TopicManager } from './components/admin/TopicManager';
import { ResourceManager } from './components/admin/ResourceManager';
import { RoadmapBuilder } from './components/admin/RoadmapBuilder';
import { UserManager } from './components/admin/UserManager';
import { AnalyticsCenter } from './components/admin/AnalyticsCenter';

import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { AuthGateScreen } from './components/auth/AuthGateScreen';

import { storageService } from './services/storageService';
import { Topic } from './types';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { 
  Sparkles, 
  Map, 
  BookOpen, 
  BarChart2, 
  BrainCircuit, 
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, isDemoAdmin } = useAuth();
  const { isOfflineModalOpen, setIsOfflineModalOpen } = useOffline();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Topic Modal State
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // Onboarding Wizard State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Auth Modals State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleOpenTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsTopicModalOpen(true);
  };

  const handleOpenTopicById = (topicId: string) => {
    const foundTopic = storageService.getTopics().find(t => t.id === topicId);
    if (foundTopic) {
      setSelectedTopic(foundTopic);
      setIsTopicModalOpen(true);
    }
  };

  // Resolve current topic course and domain for modal
  const domains = storageService.getDomains();
  const allCourses = storageService.getCourses();
  const currentTopicCourse = selectedTopic ? allCourses.find(c => c.id === selectedTopic.courseId) : undefined;
  const currentTopicDomain = selectedTopic ? domains.find(d => d.id === selectedTopic.domainId) : undefined;

  const isSuspended = currentUser?.status === 'suspended';

  // If user is not authenticated, show dedicated full-screen Sign In / Register landing gate
  if (!currentUser) {
    return <AuthGateScreen onSuccess={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-blue-600 selection:text-white font-sans">
      {/* Ambient background glow elements for Frosted Glass design */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] bg-blue-600/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[25%] right-[15%] w-[30vw] h-[30vw] max-w-[450px] max-h-[450px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[25vw] h-[25vw] max-w-[400px] max-h-[400px] bg-cyan-600/10 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenTopic={handleOpenTopic}
        />

        {/* Offline Mode Banner */}
        <OfflineBanner
          onSelectDomain={() => setActiveTab('roadmap')}
          onOpenCacheManager={() => setIsOfflineModalOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Account Suspended Alert */}
          {isSuspended && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/40 backdrop-blur-md border border-red-500/30 text-red-300 flex items-center gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Account Suspended:</span> Your account has been suspended by an administrator. Progress logging is read-only.
              </div>
            </div>
          )}

        {/* Tab Router */}
        {/* LEARNER VIEWS */}
        {activeTab === 'dashboard' && (
          <LearnerDashboard
            onOpenRoadmap={() => setActiveTab('roadmap')}
            onOpenTopic={handleOpenTopic}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenResources={() => setActiveTab('resources')}
            onOpenAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView onOpenTopic={handleOpenTopic} />
        )}

        {activeTab === 'resources' && (
          <ResourcesHub onOpenTopicById={handleOpenTopicById} />
        )}

        {activeTab === 'analytics' && (
          <UserAnalytics />
        )}

        {/* ADMIN VIEWS */}
        {activeTab === 'admin-dashboard' && (
          <AdminDashboard onNavigate={setActiveTab} />
        )}

        {activeTab === 'admin-domains' && (
          <DomainManager />
        )}

        {activeTab === 'admin-courses' && (
          <CourseManager />
        )}

        {activeTab === 'admin-topics' && (
          <TopicManager />
        )}

        {activeTab === 'admin-resources' && (
          <ResourceManager />
        )}

        {activeTab === 'admin-builder' && (
          <RoadmapBuilder />
        )}

        {activeTab === 'admin-users' && (
          <UserManager />
        )}

        {activeTab === 'admin-analytics' && (
          <AnalyticsCenter />
        )}
      </main>

      {/* Modals */}
      <ErrorBoundary fallbackTitle="Could not load topic details" onReset={() => setIsTopicModalOpen(false)}>
        <TopicDetailModal
          topic={selectedTopic}
          course={currentTopicCourse}
          domain={currentTopicDomain}
          userId={currentUser?.id || 'user-1'}
          isOpen={isTopicModalOpen}
          onClose={() => setIsTopicModalOpen(false)}
          onSelectTopic={handleOpenTopic}
          onStatusChanged={() => {
            // Force refresh
            setSelectedTopic(prev => (prev ? { ...prev } : null));
          }}
        />
      </ErrorBoundary>

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCompleted={() => {
          setActiveTab('dashboard');
        }}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onSwitchToForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotPasswordOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onCompleted={() => {
          setIsOnboardingOpen(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onBackToLogin={() => {
          setIsForgotPasswordOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <OfflineManagerModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onSelectDomain={() => setActiveTab('roadmap')}
      />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <MainAppContent />
      </OfflineProvider>
    </AuthProvider>
  );
}
