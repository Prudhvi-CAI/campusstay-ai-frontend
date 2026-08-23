import React, { useState } from 'react';
import { ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import { api } from '../services/api';

export const PasswordSettingsCard: React.FC<{ roleName?: string }> = ({ roleName = 'Account' }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password strength calculations
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (!hasMinLength) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <KeyRound size={20} />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Password & Security Settings
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Update your {roleName.toLowerCase()} password to keep your CampusStay account secure.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck size={14} />
          <span>Encrypted Storage</span>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        {/* Current Password Field */}
        <div>
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            required
            autoComplete="current-password"
            helperText="Required to verify your identity before making changes."
          />
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter minimum 6 characters"
            required
            autoComplete="new-password"
          />

          {newPassword && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                Password Requirements:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  At least 6 chars
                </span>
                <span className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasLetter ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  Contains letters
                </span>
                <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  Contains numbers
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div>
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            required
            autoComplete="new-password"
            error={
              confirmPassword && !passwordsMatch
                ? 'Passwords do not match'
                : undefined
            }
          />
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || !passwordsMatch}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-500/20 flex items-center gap-2"
          >
            <ShieldCheck size={16} />
            <span>{isLoading ? 'Updating Password...' : 'Save New Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
