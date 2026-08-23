import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Map as MapIcon,
  Grid,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  Building,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { PropertySummary, College, SearchFilterParams } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { MapView } from '../components/MapView';
import { FilterDrawer } from '../components/FilterDrawer';
import { CollegeSearchCombobox } from '../components/CollegeSearchCombobox';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'split' | 'map'>('grid');
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<SearchFilterParams>({
    query: searchParams.get('q') || undefined,
    college_id: searchParams.get('college_id') ? Number(searchParams.get('college_id')) : undefined,
    college_name: searchParams.get('college_name') || undefined,
    room_type: searchParams.get('room_type') || undefined,
    gender_preference: searchParams.get('gender') || undefined,
    verified_only: searchParams.get('verified_only') === 'true',
    available_only: searchParams.get('available_only') !== 'false',
    sort_by: 'relevance',
  });

  useEffect(() => {
    api.colleges.list().then(setColleges).catch(console.error);
  }, []);

  const fetchResults = async (params: SearchFilterParams) => {
    setIsLoading(true);
    try {
      const data = await api.search.query(params);
      setProperties(data.results);
      setIsFallback(data.is_fallback_alternative);
      setFallbackMessage(data.fallback_message || null);

      if (params.college_id) {
        const col = colleges.find((c) => c.id === params.college_id) || null;
        setSelectedCollege(col);
      } else {
        setSelectedCollege(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(filters);
  }, [filters]);

  const handleQueryChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchResults(filters);
  };

  const handleCollegeChange = (idStr: string) => {
    const id = idStr ? Number(idStr) : undefined;
    setFilters((prev) => ({ ...prev, college_id: id }));
  };

  const handleSortChange = (sortVal: any) => {
    setFilters((prev) => ({ ...prev, sort_by: sortVal }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleQueryChange} className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.query || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="Search by name, area, vibe..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        {/* College Selector & Filter Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="w-full sm:w-56">
            <CollegeSearchCombobox
              colleges={colleges}
              selectedCollegeId={filters.college_id}
              onSelect={(id) => setFilters((prev) => ({ ...prev, college_id: id }))}
              placeholder="Search campus..."
              allOptionLabel="All Campuses"
            />
          </div>

          {/* Sort By Dropdown */}
          <select
            value={filters.sort_by}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="relevance">Sort: Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="distance">Closest to Campus</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Filter Drawer Trigger */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
          >
            <Filter size={15} />
            <span>Filters</span>
          </button>

          {/* View Toggles */}
          <div className="hidden sm:flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500'
              }`}
              title="Split View (List + Map)"
            >
              <SlidersHorizontal size={16} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500'
              }`}
              title="Map View"
            >
              <MapIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Fallback Message (Smart Empty State) */}
      {isFallback && fallbackMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <span>{fallbackMessage}</span>
        </div>
      )}

      {/* Results Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <Building size={48} className="mx-auto text-slate-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No properties found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try resetting your filters or expanding your budget and distance preferences.
          </p>
          <button
            onClick={() => setFilters({ available_only: true, sort_by: 'relevance' })}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Properties List */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[85vh] overflow-y-auto pr-1">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>

          {/* Right Column: Sticky Leaflet Map */}
          <div className="lg:col-span-5 sticky top-24">
            <MapView
              properties={properties}
              selectedCollege={selectedCollege}
              className="h-[80vh] w-full"
            />
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <MapView
          properties={properties}
          selectedCollege={selectedCollege}
          className="h-[75vh] w-full"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters({ available_only: true, sort_by: 'relevance' })}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};
