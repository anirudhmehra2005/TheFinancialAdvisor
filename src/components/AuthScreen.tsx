import React, { useState } from 'react';
import { TrendingUp, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthScreenProps {
  mode: 'login' | 'signup' | 'reset';
  onToggleMode: (mode: 'login' | 'signup' | 'reset') => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ mode, onToggleMode }) => {
  const { signUp, signIn, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6; // Simplified to 6 characters for MVP
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation for signup
    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (mode === 'signup' && formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (not for reset)
    if (mode !== 'reset') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      // Confirm password validation for signup
      if (mode === 'signup') {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: any): string => {
    if (!error) return 'An unexpected error occurred';
    
    const message = error.message || error;
    
    // Convert technical errors to user-friendly messages
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (message.includes('row-level security')) {
      return 'There was an issue creating your account. Please try again.';
    }
    if (message.includes('Failed to create user profile')) {
      return 'Account created but there was an issue setting up your profile. Please try signing in.';
    }
    
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      if (mode === 'signup') {
        const { error, success } = await signUp(formData.email, formData.password, formData.name);
        if (error || !success) {
          setErrors({ general: getErrorMessage(error) });
        } else {
          setSuccessMessage('Account created successfully! You can now sign in.');
          // Auto-redirect to login after successful signup
          setTimeout(() => {
            onToggleMode('login');
          }, 2000);
        }
      } else if (mode === 'login') {
        const { error, success } = await signIn(formData.email, formData.password);
        if (error || !success) {
          setErrors({ general: getErrorMessage(error) });
        }
        // No need to handle success here - the auth state change will handle navigation
      } else if (mode === 'reset') {
        const { error, success } = await resetPassword(formData.email);
        if (error || !success) {
          setErrors({ general: getErrorMessage(error) });
        } else {
          setSuccessMessage('Password reset email sent! Please check your inbox.');
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
  };

  const getInputClassName = (fieldName: keyof FormErrors) => {
    const baseClass = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white";
    const errorClass = "border-red-300 focus:ring-red-500 focus:border-red-500";
    const successClass = "border-green-300";
    const normalClass = "border-gray-300";
    
    if (errors[fieldName]) {
      return `${baseClass} ${errorClass}`;
    } else if (formData[fieldName] && !errors[fieldName]) {
      return `${baseClass} ${successClass}`;
    }
    return `${baseClass} ${normalClass}`;
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Join thousands of smart investors today';
      case 'reset': return 'Enter your email to reset your password';
      default: return 'Sign in to continue your investment journey';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">InvestSmart</h1>
          </div>
          <p className="text-gray-600">Your journey to financial freedom starts here</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
            <p className="text-gray-600">{getSubtitle()}</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field - Only for Signup */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={getInputClassName('name')}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                  {formData.name && !errors.name && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors.name && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </div>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={getInputClassName('email')}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                />
                {formData.email && !errors.email && validateEmail(formData.email) && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field - Not for Reset */}
            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={getInputClassName('password')}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </div>
                )}
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password Field - Only for Signup */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={getInputClassName('confirmPassword')}
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'login' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Sending Email...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-8 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  {mode === 'reset' ? 'Remember your password?' : 
                   mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {mode === 'reset' ? (
                <button
                  onClick={() => onToggleMode('login')}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline"
                >
                  Back to Sign In
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onToggleMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline"
                  >
                    {mode === 'login' ? 'Create Account' : 'Sign In'}
                  </button>
                  
                  {mode === 'login' && (
                    <button
                      onClick={() => onToggleMode('reset')}
                      className="text-gray-600 text-sm hover:text-gray-800 transition-colors hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};