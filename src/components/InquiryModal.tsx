import React, { useState } from 'react';
import { X, Send, CheckCircle2, Phone, Calendar, Users } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface InquiryModalProps {
  propertyId: number;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  propertyId,
  propertyName,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [preferredSharing, setPreferredSharing] = useState('2-sharing');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in as a student to contact property owners.');
      return;
    }
    if (!message.trim()) {
      setError('Please write a message or question for the owner.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.inquiries.create({
        property_id: propertyId,
        message,
        move_in_date: moveInDate || undefined,
        preferred_sharing: preferredSharing,
        student_phone: phone || undefined,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Inquiry Sent!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The owner of <strong>{propertyName}</strong> has received your inquiry and will contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Contact Property Owner
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{propertyName}</h3>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs border border-rose-500/20">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Preferred Sharing
              </label>
              <select
                value={preferredSharing}
                onChange={(e) => setPreferredSharing(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
              >
                <option value="single">Single Room</option>
                <option value="2-sharing">2-Sharing (Double)</option>
                <option value="3-sharing">3-Sharing (Triple)</option>
                <option value="4-sharing">4-Sharing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Estimated Move-in Date
              </label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Message / Questions for Owner
              </label>
              <textarea
                rows={3}
                required
                placeholder="Hi, is a 2-sharing bed available from next month? Does the rent include food & electricity?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
