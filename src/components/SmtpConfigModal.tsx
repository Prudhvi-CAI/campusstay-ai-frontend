import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { PasswordInput } from './PasswordInput';

interface SmtpConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const SmtpConfigModal: React.FC<SmtpConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [testRecipient, setTestRecipient] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [activeHost, setActiveHost] = useState('smtp.gmail.com');
  const [maskedUser, setMaskedUser] = useState('');

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await api.email.getStatus();
      setIsConfigured(res.is_configured);
      setActiveHost(res.smtp_host);
      setMaskedUser(res.smtp_user);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpUser || !smtpPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your Gmail address and 16-character App Password.',
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      await api.email.updateConfig({
        smtp_user: smtpUser,
        smtp_password: smtpPassword,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
      });

      setIsConfigured(true);
      setMaskedUser(smtpUser);
      setStatusMessage({
        type: 'success',
        text: 'SMTP credentials saved and updated successfully!',
        details: 'Live email delivery is now enabled.',
      });
      onConfigSaved?.();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save SMTP settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    const target = testRecipient.trim() || smtpUser.trim();
    if (!target) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter an email address to send the test email to.',
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);
    try {
      const res = await api.email.test({
        to_email: target,
        smtp_user: smtpUser || undefined,
        smtp_password: smtpPassword || undefined,
      });

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message,
          details: res.details,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message,
          details: res.details,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Test failed. Please check your credentials.',
        details: err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Live Gmail / SMTP Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive real password reset OTPs directly in your email inbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Status Pill */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <Server size={16} className="text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Current Status: {isConfigured ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Active (Live SMTP)</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-extrabold">Local Dispatch Mode</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isConfigured ? `Connected to ${activeHost} (${maskedUser})` : 'No credentials saved in backend/.env'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Refresh status"
            >
              <RefreshCw size={14} className={isLoadingStatus ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Feedback Messages */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl text-xs flex flex-col gap-1 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{statusMessage.text}</span>
              </div>
              {statusMessage.details && (
                <p className="text-[11px] opacity-90 pl-6">{statusMessage.details}</p>
              )}
            </div>
          )}

          {/* Quick Guide */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-500/20 text-xs space-y-2 text-slate-700 dark:text-slate-300">
            <p className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Zap size={14} className="text-indigo-500" />
              <span>3-Step Quick Guide for Gmail:</span>
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              <li>
                Turn on <strong>2-Step Verification</strong> in your Google Account Security settings.
              </li>
              <li>
                Visit{' '}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 dark:text-indigo-400 underline inline-flex items-center gap-0.5"
                >
                  <span>Google App Passwords</span>
                  <ExternalLink size={10} />
                </a>{' '}
                and generate a 16-character App Password (name it <em>CampusStay</em>).
              </li>
              <li>Enter your Gmail address & the 16-character password below.</li>
            </ol>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Your Gmail Address (SMTP_USER)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <PasswordInput
                label="16-Character Gmail App Password (SMTP_PASSWORD)"
                required
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                helperText="Enter the 16-letter App Password generated from your Google Account."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving || !smtpUser || !smtpPassword}
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                <span>{isSaving ? 'Saving Configuration...' : 'Save & Enable Live SMTP'}</span>
              </button>
            </div>
          </form>

          {/* Send Live Test Email */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400">Test Live Delivery</h4>
            <div className="flex gap-2">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="Recipient email (e.g. your personal email)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Send size={13} className={isTesting ? 'animate-spin' : ''} />
                <span>{isTesting ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
