import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormInput } from '../../components/common/FormInput';
import { PasswordInput } from '../../components/common/PasswordInput';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Please enter a valid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) navigate('/dashboard');
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

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              placeholder="name@company.com"
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
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
                className="w-full py-2 px-4 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign In
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

