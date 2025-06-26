import React, { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { FinancialAssessment } from './components/FinancialAssessment';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { useAuth } from './hooks/useAuth';
import { useAssessment } from './hooks/useAssessment';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { assessmentData, loading: assessmentLoading } = useAssessment(user?.id || null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');

  const handleLogout = async () => {
    await signOut();
  };

  const handleAssessmentComplete = () => {
    // The assessment hook will automatically refetch the data
    // No need to do anything here as the component will re-render
  };

  const toggleAuthMode = (mode: 'login' | 'signup' | 'reset') => {
    setAuthMode(mode);
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if no user
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AuthScreen 
          mode={authMode}
          onToggleMode={toggleAuthMode}
        />
      </div>
    );
  }

  // Show loading while fetching assessment data
  if (assessmentLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={profile} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show assessment if user hasn't completed it
  if (!assessmentData) {
    return (
      <FinancialAssessment 
        userId={user.id}
        onComplete={handleAssessmentComplete} 
      />
    );
  }

  // Show dashboard if user is logged in and assessment is complete
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={profile} onLogout={handleLogout} />
      <Dashboard user={profile} assessmentData={assessmentData} />
    </div>
  );
}

export default App;