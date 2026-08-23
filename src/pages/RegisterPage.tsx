import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Phone, Building2, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { College } from '../types';
import { PasswordInput } from '../components/PasswordInput';
import { CollegeSearchCombobox } from '../components/CollegeSearchCombobox';


export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'owner'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeId, setCollegeId] = useState<number | undefined>();
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.colleges.list().then(setColleges).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload: any = {
      email,
      password,
      full_name: fullName,
      phone: phone || undefined,
      role,
    };

    if (role === 'student') {
      payload.student_profile = {
        college_id: collegeId,
        budget_min: 3000,
        budget_max: 8000,
        preferred_room_type: '2-sharing',
        max_distance_km: 3.0,
        gender: 'boys',
      };
    } else {
      payload.owner_profile = {
        business_name: businessName || fullName,
      };
    }

    try {
      await register(payload);
      if (role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white dark:bg-[#0f172a] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-500/25">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Your Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join CampusStay AI as a student or verified property owner
          </p>
        </div>

        {/* Role Picker Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              role === 'student'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <GraduationCap size={16} />
            <span>I'm a Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              role === 'owner'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Building2 size={16} />
            <span>I'm a Property Owner</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@srmap.edu.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <PasswordInput
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              helperText="Minimum 6 characters."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {role === 'student' ? (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Target College / University</label>
              <CollegeSearchCombobox
                colleges={colleges}
                selectedCollegeId={collegeId}
                onSelect={setCollegeId}
                placeholder="Search college (e.g. SRM, GITAM)..."
                allOptionLabel="Select College"
                buttonClassName="bg-slate-100 dark:bg-slate-800 text-sm py-2.5"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">PG / Property Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Krishna Stays & Hostels"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
