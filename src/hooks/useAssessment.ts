import { useState, useEffect } from 'react';
import { supabase, FinancialAssessment, AssessmentData } from '../lib/supabase';

export const useAssessment = (userId: string | null) => {
  const [assessment, setAssessment] = useState<FinancialAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchLatestAssessment();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchLatestAssessment = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      setAssessment(data || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async (assessmentData: AssessmentData) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      
      // Check if user already has an assessment
      const { data: existingAssessment } = await supabase
        .from('financial_assessments')
        .select('id')
        .eq('user_id', userId)
        .single();

      const assessmentPayload = {
        user_id: userId,
        age: assessmentData.age,
        monthly_income: assessmentData.monthlyIncome,
        current_savings: assessmentData.currentSavings,
        primary_goal: assessmentData.primaryGoal,
        secondary_goals: assessmentData.secondaryGoals,
        investment_timeline: assessmentData.investmentTimeline,
        monthly_investment: assessmentData.monthlyInvestment,
        risk_tolerance: assessmentData.riskTolerance,
        experience_level: assessmentData.experienceLevel,
      };

      let result;
      
      if (existingAssessment) {
        // Update existing assessment
        result = await supabase
          .from('financial_assessments')
          .update(assessmentPayload)
          .eq('id', existingAssessment.id)
          .select()
          .single();
      } else {
        // Create new assessment
        result = await supabase
          .from('financial_assessments')
          .insert(assessmentPayload)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setAssessment(result.data);
      setError(null);
      
      return result.data;
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError('Failed to save assessment data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async () => {
    if (!userId || !assessment) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('financial_assessments')
        .delete()
        .eq('id', assessment.id);

      if (error) throw error;

      setAssessment(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting assessment:', err);
      setError('Failed to delete assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Convert database assessment to component format
  const getAssessmentData = (): AssessmentData | null => {
    if (!assessment) return null;

    return {
      age: assessment.age,
      monthlyIncome: assessment.monthly_income,
      currentSavings: assessment.current_savings,
      primaryGoal: assessment.primary_goal,
      secondaryGoals: assessment.secondary_goals,
      investmentTimeline: assessment.investment_timeline,
      monthlyInvestment: assessment.monthly_investment,
      riskTolerance: assessment.risk_tolerance,
      experienceLevel: assessment.experience_level,
    };
  };

  return {
    assessment,
    assessmentData: getAssessmentData(),
    loading,
    error,
    saveAssessment,
    deleteAssessment,
    refetch: fetchLatestAssessment,
  };
};