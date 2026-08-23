import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Inbox,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react';
import { api } from '../services/api';
import { PasswordInput } from '../components/PasswordInput';
import { SmtpConfigModal } from '../components/SmtpConfigModal';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Multi-step state: 1 = Enter Email, 2 = Verify OTP & Set New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form data
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showEmailTips, setShowEmailTips] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<string>('local_dev');
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password validation
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const fullOtp = otpDigits.join('');

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle digit inputs
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle full paste
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      digitInputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single digit input
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal.charAt(cleanVal.length - 1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (index < 5 && cleanVal) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.auth.forgotPassword(email);
      setSuccessMsg(`Verification code sent to ${email}`);
      if (res.debug_otp) {
        setDebugOtp(res.debug_otp);
      }
      setEmailSent(Boolean(res.email_sent));
      setSmtpConfigured(Boolean(res.smtp_configured));
      setDeliveryMode(res.delivery_mode || 'local_dev');
      setResendCooldown(60); // 60s cooldown
      setStep(2);

      // If local dev mode, auto-fill the OTP
      if (!res.email_sent && res.debug_otp) {
        setOtpDigits(res.debug_otp.split(''));
      }

      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your email address.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      const res = await api.auth.forgotPassword(email);
      setSuccessMsg(`A fresh verification code has been dispatched to ${email}.`);
      if (res.debug_otp) {
        setDebugOtp(res.debug_otp);
      }
      setEmailSent(Boolean(res.email_sent));
      setSmtpConfigured(Boolean(res.smtp_configured));
      setDeliveryMode(res.delivery_mode || 'local_dev');
      setResendCooldown(60);

      if (!res.email_sent && res.debug_otp) {
        setOtpDigits(res.debug_otp.split(''));
      } else {
        setOtpDigits(['', '', '', '', '', '']);
      }
      digitInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    if (!hasMinLength) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.resetPassword({
        email,
        otp: fullOtp,
        new_password: newPassword,
      });
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code. Please check the code or request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-[#0f172a] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-500/25">
            {step === 3 ? <CheckCircle2 size={26} /> : step === 2 ? <Inbox size={24} /> : <KeyRound size={24} />}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {step === 1 && 'Reset Your Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Password Reset Complete!'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 1 && 'Enter your registered email address to receive your 6-digit security OTP code.'}
            {step === 2 && `We sent a 6-digit OTP code to ${email}`}
            {step === 3 && 'Your password has been successfully updated. You can now log in securely.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex flex-col gap-1.5 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('no account found') && (
              <div className="pl-6 pt-0.5">
                <Link
                  to="/register"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Create a new account instead</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
            {(error.toLowerCase().includes('smtp') || error.toLowerCase().includes('gmail') || error.toLowerCase().includes('email') || error.toLowerCase().includes('credentials')) && (
              <div className="pl-6 pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsSmtpModalOpen(true)}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>⚙️ Configure Gmail SMTP & Send Live Test Email</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Registered Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu.in or your email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <ShieldCheck size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <span>We will deliver a 6-digit time-sensitive verification code to verify your identity.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Sending Verification Code...' : 'Send Verification OTP'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1.5 transition"
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Verify OTP & Choose New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Inbox Notice Card */}
            {emailSent ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Inbox size={18} className="text-emerald-500 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-emerald-900 dark:text-emerald-200">Live Email Dispatched via SMTP</p>
                      <p className="text-[11px] opacity-90 truncate">Check inbox & spam folder of <strong>{email}</strong></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/30 text-slate-800 dark:text-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck size={18} className="text-indigo-500 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-indigo-900 dark:text-indigo-200">Local Dispatch Mode (No SMTP in .env)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Account: {email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>
                {debugOtp && (
                  <div className="pt-1.5 border-t border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      Generated OTP: <strong className="font-mono text-sm tracking-widest text-indigo-600 dark:text-indigo-400">{debugOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpDigits(debugOtp.split(''))}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  💡 Tip: To receive live emails directly in your personal Gmail inbox, set <code className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">SMTP_USER</code> and <code className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">SMTP_PASSWORD</code> in <code className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">backend/.env</code>.
                </p>
              </div>
            )}

            {/* 6-Digit Split OTP Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-slate-400">6-Digit Verification Code</label>
                <span className="text-[11px] text-slate-400">Expires in 15 mins</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (digitInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-bold text-lg sm:text-xl rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <PasswordInput
                label="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Choose a strong password"
                autoComplete="new-password"
                helperText="Minimum 6 characters."
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <PasswordInput
                label="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || fullOtp.length < 6 || !hasMinLength || !passwordsMatch}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>{isLoading ? 'Updating Password...' : 'Reset Password & Log In'}</span>
            </button>

            {/* Resend OTP Bar with Cooldown */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending}
                className={`font-semibold flex items-center gap-1.5 transition ${
                  resendCooldown > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-indigo-600 dark:text-indigo-400 hover:underline'
                }`}
              >
                <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
                <span>
                  {isResending
                    ? 'Resending...'
                    : resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : 'Resend Code'}
                </span>
              </button>

              <Link
                to="/login"
                className="font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Back to Sign In
              </Link>
            </div>

            {/* Didn't receive code help accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowEmailTips(!showEmailTips)}
                className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium py-1"
              >
                <span className="flex items-center gap-1">
                  <HelpCircle size={13} />
                  <span>Didn't receive the email code?</span>
                </span>
                {showEmailTips ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showEmailTips && (
                <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 animate-fade-in">
                  <p>1. Check your <strong>Spam / Junk</strong> or <strong>Promotions</strong> folder.</p>
                  <p>2. Verify that you entered the correct email address ({email}).</p>
                  <p>3. Allow 1-2 minutes for email network delivery before resending.</p>
                  {debugOtp && (
                    <div className="pt-1 mt-1 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400">
                      <span>Dev environment active code: </span>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = debugOtp.split('');
                          setOtpDigits(digits);
                        }}
                        className="font-mono font-bold text-indigo-600 dark:text-indigo-400 underline ml-1"
                      >
                        Fill ({debugOtp})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="space-y-6 text-center py-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm space-y-1">
              <p className="font-bold text-base">✓ Password Changed Successfully!</p>
              <p className="text-slate-600 dark:text-slate-300 text-xs">
                Your account password has been updated. You can now log in securely using your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Sign In Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Global Live Gmail / SMTP Setup Trigger */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsSmtpModalOpen(true)}
            className="text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings size={13} />
            <span>Configure Live Gmail / SMTP Delivery</span>
          </button>
        </div>
      </div>

      {/* SMTP Interactive Setup Modal */}
      <SmtpConfigModal
        isOpen={isSmtpModalOpen}
        onClose={() => setIsSmtpModalOpen(false)}
        onConfigSaved={() => {
          setSmtpConfigured(true);
        }}
      />
    </div>
  );
};
