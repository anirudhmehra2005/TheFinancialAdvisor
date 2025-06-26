import React from 'react';
import { WelcomeSection } from './WelcomeSection';
import { InvestmentCategories } from './InvestmentCategories';
import { QuickStats } from './QuickStats';
import { UserProfile, AssessmentData } from '../lib/supabase';

interface DashboardProps {
  user: UserProfile;
  assessmentData: AssessmentData;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, assessmentData }) => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <WelcomeSection user={user} assessmentData={assessmentData} />
        <QuickStats assessmentData={assessmentData} />
        <InvestmentCategories user={user} assessmentData={assessmentData} />
      </div>
    </main>
  );
};