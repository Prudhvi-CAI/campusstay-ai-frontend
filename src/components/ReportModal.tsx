import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface ReportModalProps {
  propertyId: number;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  propertyId,
  propertyName,
  isOpen,
  onClose,
}) => {
  const [reason, setReason] = useState('not_available');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.reports.submit({
        property_id: propertyId,
        reason,
        details: details || undefined,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      alert('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Report Submitted</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our trust & safety team will audit this listing within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle size={20} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Report Listing</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reporting: <strong>{propertyName}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Reason for Reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
              >
                <option value="not_available">Rooms are fully occupied / Not available</option>
                <option value="wrong_price">Incorrect or misleading rent</option>
                <option value="wrong_location">Wrong location or college distance</option>
                <option value="fake_listing">Fake / Suspicious property listing</option>
                <option value="misleading_details">Misleading amenities or photos</option>
                <option value="duplicate_listing">Duplicate listing</option>
                <option value="inappropriate_content">Inappropriate owner behavior</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe what you observed (e.g. owner quoted higher rent on call)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
