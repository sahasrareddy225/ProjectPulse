import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { FormInput } from '../../components/common/FormInput';
import { PasswordInput } from '../../components/common/PasswordInput';
import { authService, AuthApiError } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      e.email = 'Please enter a valid email address';
    }
    if (!password) {
      e.password = 'Password is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (field: 'email' | 'password', val: string) => {
    if (field === 'email') setEmail(val);
    if (field === 'password') setPassword(val);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.login({
        email: email.trim(),
        password
      });

      setAuth(response.user, response.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        if (err.status === 401) {
          setServerError('Invalid email or password.');
        } else if (err.status === 400 && err.fieldErrors) {
          setErrors(prev => ({ ...prev, ...err.fieldErrors }));
          setServerError(err.message || 'Please check your inputs.');
        } else {
          setServerError(err.message || 'Sign in failed. Please try again.');
        }
      } else {
        setServerError('Unable to reach the authentication service. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-lg border border-border p-6 shadow-xs">
          {/* Brand Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center mb-3">
              <span className="text-white font-bold text-base leading-none select-none">P</span>
            </div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">ProjectPulse</h1>
            <p className="text-xs text-text-muted text-center mt-0.5">
              Sign in to your enterprise workspace
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

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={e => handleInputChange('email', e.target.value)}
              error={errors.email}
              placeholder="name@company.com"
              disabled={isLoading}
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => handleInputChange('password', e.target.value)}
              error={errors.password}
              placeholder="••••••••"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
                  disabled={isLoading}
                  className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary"
                />
                <span className="text-text-muted select-none">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 bg-primary text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create account
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

