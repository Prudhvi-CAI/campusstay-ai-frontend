import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, GraduationCap, MapPin, ChevronDown } from 'lucide-react';
import { College } from '../types';

interface CollegeSearchComboboxProps {
  colleges: College[];
  selectedCollegeId?: number;
  onSelect: (collegeId: number | undefined) => void;
  placeholder?: string;
  allOptionLabel?: string;
  className?: string;
  buttonClassName?: string;
  showIcon?: boolean;
}

export const CollegeSearchCombobox: React.FC<CollegeSearchComboboxProps> = ({
  colleges,
  selectedCollegeId,
  onSelect,
  placeholder = 'Search college or university...',
  allOptionLabel = 'All Campuses',
  className = '',
  buttonClassName = '',
  showIcon = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredColleges = colleges.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      c.short_name.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term)
    );
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate text-left">
          {showIcon && <GraduationCap size={15} className="text-indigo-500 shrink-0" />}
          <span className="truncate">
            {selectedCollege ? (
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {selectedCollege.short_name} <span className="font-normal text-slate-500 dark:text-slate-400">({selectedCollege.city})</span>
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-medium">{allOptionLabel}</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectedCollege && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelect(undefined);
              }}
              className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition"
              title="Clear selection"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 min-w-[280px] sm:min-w-[320px] max-w-md bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* College Options List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {/* All Campuses Option */}
            <button
              type="button"
              onClick={() => {
                onSelect(undefined);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                !selectedCollegeId
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🌐</span>
                <span>{allOptionLabel}</span>
              </div>
              {!selectedCollegeId && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
            </button>

            {filteredColleges.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No colleges match "<span className="font-semibold text-slate-600 dark:text-slate-300">{searchTerm}</span>"
              </div>
            ) : (
              filteredColleges.map((c) => {
                const isSelected = c.id === selectedCollegeId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelect(c.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{c.short_name}</span>
                        <span className="px-1.5 py-0.2 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                          {c.city}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {c.name}
                      </span>
                    </div>
                    {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
