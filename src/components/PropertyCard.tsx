import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Wifi,
  Utensils,
  Wind,
  ShieldCheck,
  Heart,
  Scale,
  Star,
  Sparkles,
  ArrowRight,
  Bath,
} from 'lucide-react';
import { PropertySummary } from '../types';
import { formatCurrency } from '../lib/utils';
import { VerificationBadge } from './VerificationBadge';
import { AvailabilityBadge } from './AvailabilityBadge';
import { FreshnessBadge } from './FreshnessBadge';
import { useSaved } from '../context/SavedContext';

interface PropertyCardProps {
  property: PropertySummary;
  compact?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, compact = false }) => {
  const { isSaved, toggleSave, isCompared, toggleCompare } = useSaved();
  const saved = isSaved(property.id);
  const compared = isCompared(property.id);

  const fallbackImage =
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={property.cover_image || fallbackImage}
          alt={property.property_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/10">
              {property.property_type}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-white/10">
              {property.gender_preference}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Compare Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleCompare(property.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
                compared
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/70 text-white hover:bg-slate-900'
              }`}
              title={compared ? 'Remove from compare' : 'Add to compare'}
            >
              <Scale size={15} />
            </button>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSave(property.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
                saved
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-900/70 text-white hover:bg-slate-900'
              }`}
              title={saved ? 'Remove from favorites' : 'Save property'}
            >
              <Heart size={15} className={saved ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Bottom Image Overlay: Match Score & Price */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white pointer-events-none">
          <div>
            <span className="text-xs font-normal text-slate-200">Starting from</span>
            <div className="text-xl font-black tracking-tight">
              {formatCurrency(property.monthly_rent)}
              <span className="text-xs font-normal text-slate-300"> /mo</span>
            </div>
          </div>

          {property.match_score && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600/90 backdrop-blur-md text-white font-bold text-xs shadow-lg shadow-indigo-500/30">
              <Sparkles size={13} className="text-amber-300" />
              <span>{property.match_score}% Match</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Header Row: Name & Rating */}
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/properties/${property.id}`}
              className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1 transition-colors"
            >
              {property.property_name}
            </Link>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-md">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{property.rating_average.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({property.review_count})</span>
            </div>
          </div>

          {/* Location & College Distance */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin size={13} className="text-indigo-500 shrink-0" />
            <span className="truncate">{property.locality}, {property.city}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              {property.distance_from_college_km} km
            </span>
            {property.nearby_college && (
              <span className="truncate text-slate-400">from {property.nearby_college.short_name}</span>
            )}
          </div>

          {/* Live Availability & Verification */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <AvailabilityBadge availableBeds={property.total_available_beds} />
            <VerificationBadge status={property.verification_status} size="sm" />
          </div>

          {/* AI Match Reasons (If available from search/RAG) */}
          {property.match_reasons && property.match_reasons.length > 0 && (
            <div className="mt-2.5 p-2 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 text-[11px] text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-0.5">
                <Sparkles size={11} />
                Why this matches:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                {property.match_reasons.slice(0, 2).map((reason, idx) => (
                  <li key={idx} className="truncate">{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Amenities */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
            {property.wifi_available && (
              <span className="flex items-center gap-1" title="High speed WiFi included">
                <Wifi size={13} className="text-indigo-500" />
                <span>WiFi</span>
              </span>
            )}
            {property.food_available && (
              <span className="flex items-center gap-1" title="Mess meals included">
                <Utensils size={13} className="text-indigo-500" />
                <span>Food</span>
              </span>
            )}
            {property.attached_bathroom && (
              <span className="flex items-center gap-1" title="Attached private bathroom">
                <Bath size={13} className="text-indigo-500" />
                <span>Attached Bath</span>
              </span>
            )}
            {property.air_conditioning && (
              <span className="flex items-center gap-1" title="Air conditioning">
                <Wind size={13} className="text-indigo-500" />
                <span>AC</span>
              </span>
            )}
          </div>
        </div>

        {/* Footer Row: Freshness & CTA */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
          <FreshnessBadge freshness={property.freshness} />

          <Link
            to={`/properties/${property.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group/btn"
          >
            <span>View Details</span>
            <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
