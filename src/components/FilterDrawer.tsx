import React, { useState, useEffect } from 'react';
import {
  Filter,
  X,
  Check,
  RotateCcw,
  Building,
  DollarSign,
  MapPin,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SearchFilterParams, College } from '../types';
import { api } from '../services/api';
import { CollegeSearchCombobox } from './CollegeSearchCombobox';

interface FilterDrawerProps {
  filters: SearchFilterParams;
  onApply: (filters: SearchFilterParams) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filters,
  onApply,
  onReset,
  isOpen,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilterParams>(filters);
  const [colleges, setColleges] = useState<College[]>([]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    api.colleges.list().then(setColleges).catch(() => {});
  }, []);

  const handleChange = (key: keyof SearchFilterParams, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleAmenity = (key: keyof SearchFilterParams) => {
    setLocalFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(localFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0b1120] h-full overflow-y-auto shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Filters & Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-6 flex-1">
          {/* Target College */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Target College
            </label>
            <CollegeSearchCombobox
              colleges={colleges}
              selectedCollegeId={localFilters.college_id}
              onSelect={(id) => handleChange('college_id', id)}
              placeholder="Search AP college..."
              allOptionLabel="All Colleges"
            />
          </div>

          {/* Budget Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Max Monthly Rent
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                ₹{localFilters.max_rent ? localFilters.max_rent.toLocaleString('en-IN') : '15,000'} /mo
              </span>
            </div>
            <input
              type="range"
              min="3000"
              max="18000"
              step="500"
              value={localFilters.max_rent || 15000}
              onChange={(e) => handleChange('max_rent', Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>₹3k</span>
              <span>₹8k</span>
              <span>₹12k</span>
              <span>₹18k</span>
            </div>
          </div>

          {/* Distance from Campus */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Max Distance from Campus
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {localFilters.max_distance_km ? `${localFilters.max_distance_km} km` : '5 km'}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={localFilters.max_distance_km || 5}
              onChange={(e) => handleChange('max_distance_km', Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Room Sharing Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Room Sharing
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['single', '2-sharing', '3-sharing', '4-sharing'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => handleChange('room_type', localFilters.room_type === t ? undefined : t)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    localFilters.room_type === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Gender Accommodation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['boys', 'girls', 'co-ed'].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => handleChange('gender_preference', localFilters.gender_preference === g ? undefined : g)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    localFilters.gender_preference === g
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Multi-Check */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Must-Have Amenities
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'food_available', label: 'Food / Mess Included' },
                { key: 'wifi_available', label: 'High-speed WiFi' },
                { key: 'air_conditioning', label: 'Air Conditioning' },
                { key: 'attached_bathroom', label: 'Attached Bathroom' },
                { key: 'laundry_available', label: 'Laundry Machine' },
                { key: 'parking_available', label: 'Vehicle Parking' },
                { key: 'power_backup', label: 'Power Backup' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(localFilters[item.key as keyof SearchFilterParams])}
                    onChange={() => handleToggleAmenity(item.key as keyof SearchFilterParams)}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trust Toggles */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Verified Listings Only</p>
                  <p className="text-[11px] text-slate-400">Campus inspection & ID audited</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(localFilters.verified_only)}
                onChange={() => handleChange('verified_only', !localFilters.verified_only)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Currently Available Only</p>
                  <p className="text-[11px] text-slate-400">Hide fully booked accommodations</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localFilters.available_only !== false}
                onChange={() => handleChange('available_only', localFilters.available_only === false ? true : false)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-[#070b14]">
          <button
            type="button"
            onClick={() => {
              onReset();
              setLocalFilters({});
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition"
          >
            <Check size={16} />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
