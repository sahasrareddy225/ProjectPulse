import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FormInput } from '../../components/common/FormInput';
import { PasswordInput } from '../../components/common/PasswordInput';
import { authService, AuthApiError } from '../../services/authService';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (serverError) {
      setServerError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      setSuccessMessage('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        if (err.isDuplicateEmail || err.status === 409) {
          const duplicateMsg = 'An account with this email address already exists. Please sign in or use a different email.';
          setServerError(duplicateMsg);
          setErrors(prev => ({
            ...prev,
            email: 'An account with this email address already exists.'
          }));
        } else if (err.status === 400 && err.fieldErrors) {
          setErrors(prev => ({
            ...prev,
            ...err.fieldErrors
          }));
          setServerError(err.message || 'Validation failed. Please verify your details.');
        } else {
          setServerError(err.message || 'An unexpected error occurred during registration. Please try again.');
        }
      } else {
        setServerError('An unexpected error occurred. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface p-6 rounded-lg border border-border shadow-xs">
          <div className="flex flex-col items-center mb-6">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center mb-3">
              <span className="text-white font-bold text-base leading-none select-none">P</span>
            </div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Create an Account</h1>
            <p className="text-xs text-text-muted text-center mt-0.5">
              Set up your ProjectPulse workspace credential
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="p-3 mb-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span className="flex-1">{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-3 mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-start gap-2"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
              <span className="flex-1">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <FormInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="John Doe"
              disabled={isLoading || Boolean(successMessage)}
            />
            
            <FormInput
              label="Work Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="name@company.com"
              disabled={isLoading || Boolean(successMessage)}
            />
            
            <PasswordInput
              label="Password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              placeholder="••••••••"
              disabled={isLoading || Boolean(successMessage)}
            />
            
            <PasswordInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
              disabled={isLoading || Boolean(successMessage)}
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || Boolean(successMessage)}
                className={`w-full py-2 px-4 bg-primary text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
                  isLoading || successMessage ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-xs text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-[11px] text-text-muted">
          ProjectPulse Enterprise Intelligence Platform
        </p>
      </div>
    </div>
  );
};

