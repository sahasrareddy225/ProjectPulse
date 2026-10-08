import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormInput } from '../../components/common/FormInput';
import { PasswordInput } from '../../components/common/PasswordInput';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      navigate('/dashboard');
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

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <FormInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="John Doe"
            />
            
            <FormInput
              label="Work Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="name@company.com"
            />
            
            <PasswordInput
              label="Password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              placeholder="••••••••"
            />
            
            <PasswordInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Account
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

