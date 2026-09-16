import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { dispatchOtpEmail } from '../services/emailService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, confirmPassword: string, domainId: string, skills: string[]) => { success: boolean; error?: string };
  logout: () => void;
  forgotPassword: (email: string) => { success: boolean; error?: string };
  verifyOtpAndResetPassword: (email: string, otp: string, newPassword: string) => { success: boolean; error?: string };
  verifyOtpAndLogin: (email: string, otp: string) => { success: boolean; error?: string };
  verifyOtpOnly: (email: string, otp: string) => { success: boolean; error?: string };
  switchUser: (userId: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  allUsers: User[];
  lastDispatchedEmailOTP: { email: string; otp: string; timestamp: number } | null;
  clearDispatchedEmailOTP: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  // We do NOT expose the raw secret OTP code to the UI
  const [lastDispatchedEmailOTP, setLastDispatchedEmailOTP] = useState<{ email: string; otp: string; timestamp: number } | null>(null);

  // Initialize storage and load user
  useEffect(() => {
    storageService.init();
    const users = storageService.getUsers();
    setAllUsers(users);

    const currentId = storageService.getCurrentUserId();
    const existing = currentId ? users.find(u => u.id === currentId) || null : null;
    setCurrentUser(existing);

    // Subscribe to cloud/storage updates
    const unsubscribe = storageService.subscribe(() => {
      const updatedUsers = storageService.getUsers();
      setAllUsers(updatedUsers);
      const activeId = storageService.getCurrentUserId();
      const updatedUser = activeId ? updatedUsers.find(u => u.id === activeId) || null : null;
      setCurrentUser(updatedUser);
    });

    return () => unsubscribe();
  }, []);

  const refreshUsers = () => {
    const users = storageService.getUsers();
    setAllUsers(users);
    const currentId = storageService.getCurrentUserId();
    const existing = currentId ? users.find(u => u.id === currentId) || null : null;
    setCurrentUser(existing);
  };

  const login = (email: string, password?: string) => {
    const user = storageService.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No registered account found with this email address.' };
    }
    if (user.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended by an administrator. Please contact support.' };
    }
    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Invalid password credentials. Please try again or use Forgot Password.' };
    }

    storageService.setCurrentUserId(user.id);
    setCurrentUser(user);
    return { success: true };
  };

  const register = (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    domainId: string,
    skills: string[]
  ) => {
    if (!name.trim() || !email.trim() || !password) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const existing = storageService.getUserByEmail(email);
    if (existing) {
      return { success: false, error: 'An account with this email is already registered.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'user',
      selectedDomainId: domainId || 'domain-aiml',
      skills: skills || [],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      password
    };

    storageService.saveUser(newUser);
    storageService.setCurrentUserId(newUser.id);
    refreshUsers();
    
    storageService.logActivity({
      userId: newUser.id,
      action: 'switched_domain',
      domainId: newUser.selectedDomainId,
      details: 'Registered and completed initial onboarding'
    });

    return { success: true };
  };

  const logout = () => {
    storageService.setCurrentUserId(null);
    setCurrentUser(null);
  };

  const forgotPassword = (email: string) => {
    const user = storageService.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Email address not found in our database.' };
    }

    // Generate secure 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storageService.saveOTP(email, otp);

    // Send OTP directly to the user's provided email address (SMTP & Firebase)
    dispatchOtpEmail(email, otp);

    // Clear any previous in-app dispatched OTP - we do NOT display OTP inside the app!
    setLastDispatchedEmailOTP(null);

    return { success: true };
  };

  const verifyOtpAndResetPassword = (email: string, otp: string, newPassword: string) => {
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    const isValid = storageService.verifyOTP(email, otp);
    if (!isValid) {
      return { success: false, error: 'Invalid or expired OTP verification code.' };
    }

    const user = storageService.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User record could not be found.' };
    }

    user.password = newPassword;
    storageService.saveUser(user);
    refreshUsers();
    setLastDispatchedEmailOTP(null);

    return { success: true };
  };

  const verifyOtpOnly = (email: string, otp: string) => {
    const isValid = storageService.verifyOTP(email, otp);
    if (!isValid) {
      return { success: false, error: 'Invalid or expired OTP verification code.' };
    }
    return { success: true };
  };

  const verifyOtpAndLogin = (email: string, otp: string) => {
    const isValid = storageService.verifyOTP(email, otp);
    if (!isValid) {
      return { success: false, error: 'Invalid or expired OTP verification code.' };
    }
    const user = storageService.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No registered user account found with this email address.' };
    }
    if (user.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended by an administrator.' };
    }

    storageService.setCurrentUserId(user.id);
    setCurrentUser(user);
    setLastDispatchedEmailOTP(null);
    return { success: true };
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      storageService.setCurrentUserId(user.id);
      setCurrentUser(user);
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      ...updates
    };
    storageService.saveUser(updated);
    refreshUsers();
  };

  const clearDispatchedEmailOTP = () => {
    setLastDispatchedEmailOTP(null);
  };

  const role = currentUser?.role || 'user';
  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated,
        login,
        register,
        logout,
        forgotPassword,
        verifyOtpAndResetPassword,
        verifyOtpAndLogin,
        verifyOtpOnly,
        switchUser,
        updateUserProfile,
        allUsers,
        lastDispatchedEmailOTP,
        clearDispatchedEmailOTP
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
