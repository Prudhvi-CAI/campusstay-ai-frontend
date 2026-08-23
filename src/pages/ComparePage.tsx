import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Sparkles,
  Check,
  X,
  Trash2,
  Building,
  Star,
  MapPin,
  BedDouble,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { PropertyDetail } from '../types';
import { formatCurrency } from '../lib/utils';
import { useSaved } from '../context/SavedContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { FreshnessBadge } from '../components/FreshnessBadge';

export const ComparePage: React.FC = () => {
  const { compareIds, toggleCompare, clearCompare } = useSaved();
  const [comparisonData, setComparisonData] = useState<{
    properties: PropertyDetail[];
    ai_recommendation: string;
    best_overall_property_id?: number;
    cheapest_property_id?: number;
    closest_property_id?: number;
    comparison_points: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (compareIds.length >= 2) {
      setIsLoading(true);
      api.student
        .compare(compareIds)
        .then(setComparisonData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setComparisonData(null);
    }
  }, [compareIds]);

  if (compareIds.length < 2) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <Scale size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Compare Student Accommodations
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Select at least 2 properties (up to 4) using the <strong>Compare</strong> button on any property card to view side-by-side feature comparisons and AI recommendations.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <span>Explore Properties</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="text-indigo-500" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Side-by-Side Comparison
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Comparing {compareIds.length} Student Properties
          </h1>
        </div>

        <button
          onClick={clearCompare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition"
        >
          <Trash2 size={14} />
          <span>Clear Comparison</span>
        </button>
      </div>

      {/* AI Comparative Recommendation Box */}
      {comparisonData && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-amber-300" />
            <h3 className="font-bold text-lg text-white">CampusStay AI Recommendation</h3>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {comparisonData.ai_recommendation}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {comparisonData.comparison_points.map((point, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/10 backdrop-blur-md text-xs font-medium text-slate-200 border border-white/10"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {isLoading ? (
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      ) : comparisonData ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0f172a]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-400 w-48">
                  Feature / Property
                </th>
                {comparisonData.properties.map((prop) => (
                  <th key={prop.id} className="p-4 sm:p-5 min-w-[220px] max-w-[260px] align-top">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                          {prop.property_type}
                        </span>
                        <button
                          onClick={() => toggleCompare(prop.id)}
                          className="text-slate-400 hover:text-rose-500"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <Link
                        to={`/properties/${prop.id}`}
                        className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 line-clamp-1"
                      >
                        {prop.property_name}
                      </Link>
                      <VerificationBadge status={prop.verification_status} size="sm" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {/* Monthly Rent */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Monthly Rent</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(prop.monthly_rent)}
                    </span>
                    <span className="text-xs text-slate-400"> /mo</span>
                  </td>
                ))}
              </tr>

              {/* Security Deposit */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Security Deposit</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5 text-slate-800 dark:text-slate-200">
                    {formatCurrency(prop.security_deposit)}
                  </td>
                ))}
              </tr>

              {/* Campus Distance */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Campus Distance</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {prop.distance_from_college_km} km
                    </span>
                    <span className="text-xs text-slate-400 block">
                      to {prop.nearby_college?.short_name || 'campus'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Live Available Beds */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Live Bed Inventory</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    {prop.total_available_beds > 0 ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={16} />
                        <span>{prop.total_available_beds} bed(s) available</span>
                      </span>
                    ) : (
                      <span className="font-bold text-rose-500 flex items-center gap-1">
                        <X size={16} />
                        <span>Fully Occupied</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Room Types Available */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Room Configurations</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    <div className="space-y-1">
                      {prop.sharing_summary.map((s, sIdx) => (
                        <div key={sIdx} className="text-xs text-slate-700 dark:text-slate-300">
                          <strong>{s.room_type}</strong>: {s.available_beds} avail ({formatCurrency(s.min_rent)}/mo)
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Food / Mess */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Food Included</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    {prop.food_available ? (
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {prop.food_type} Meals
                        <span className="text-[11px] text-slate-400 block">{prop.meals_included}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">No Food Included</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* High-speed WiFi */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">WiFi</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    {prop.wifi_available ? (
                      <span className="text-emerald-500 font-bold">✓ High-speed</span>
                    ) : (
                      <span className="text-slate-400">✗ None</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Air Conditioning */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">AC</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    {prop.air_conditioning ? (
                      <span className="text-emerald-500 font-bold">✓ AC Included</span>
                    ) : (
                      <span className="text-slate-400">Non-AC</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Attached Bathroom */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Attached Bath</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    {prop.attached_bathroom ? (
                      <span className="text-emerald-500 font-bold">✓ Private</span>
                    ) : (
                      <span className="text-slate-400">Shared</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Night Curfew */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Curfew Time</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5 font-medium text-slate-800 dark:text-slate-200">
                    {prop.curfew_time}
                  </td>
                ))}
              </tr>

              {/* Student Rating */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Rating</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={14} className="fill-amber-400" />
                      <span>{prop.rating_average.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({prop.review_count})</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Freshness */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Last Verified</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    <FreshnessBadge freshness={prop.freshness} />
                  </td>
                ))}
              </tr>

              {/* Action Button Row */}
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-500">Action</td>
                {comparisonData.properties.map((prop) => (
                  <td key={prop.id} className="p-4 sm:p-5">
                    <Link
                      to={`/properties/${prop.id}`}
                      className="inline-block w-full text-center py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
                    >
                      View Details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};
