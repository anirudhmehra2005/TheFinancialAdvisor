import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialAssessment {
  id: string;
  user_id: string;
  age: string;
  monthly_income: string;
  current_savings: string;
  primary_goal: string;
  secondary_goals: string[];
  investment_timeline: string;
  monthly_investment: string;
  risk_tolerance: string;
  experience_level: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentData {
  age: string;
  monthlyIncome: string;
  currentSavings: string;
  primaryGoal: string;
  secondaryGoals: string[];
  investmentTimeline: string;
  monthlyInvestment: string;
  riskTolerance: string;
  experienceLevel: string;
}