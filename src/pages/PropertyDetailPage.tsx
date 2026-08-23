import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Wifi,
  Utensils,
  Wind,
  ShieldCheck,
  Heart,
  Scale,
  Star,
  Clock,
  Send,
  AlertTriangle,
  ArrowLeft,
  Bath,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Building,
  BedDouble,
  FileText,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { PropertyDetail, Review } from '../types';
import { formatCurrency } from '../lib/utils';
import { VerificationBadge } from '../components/VerificationBadge';
import { AvailabilityBadge } from '../components/AvailabilityBadge';
import { FreshnessBadge } from '../components/FreshnessBadge';
import { MapView } from '../components/MapView';
import { InquiryModal } from '../components/InquiryModal';
import { ReportModal } from '../components/ReportModal';
import { useSaved } from '../context/SavedContext';
import { useAuth } from '../context/AuthContext';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isSaved, toggleSave, isCompared, toggleCompare } = useSaved();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Modals
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // New review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchPropertyData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const propData = await api.properties.getById(Number(id));
      setProperty(propData);
      const revsData = await api.reviews.getByProperty(Number(id));
      setReviews(revsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in as a student to submit a review.');
      return;
    }
    if (!property) return;

    setIsSubmittingReview(true);
    try {
      await api.reviews.submit({
        property_id: property.id,
        rating: newRating,
        comment: newComment,
      });
      setNewComment('');
      await fetchPropertyData();
      alert('Review submitted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Building size={48} className="mx-auto text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Property not found</h2>
        <Link to="/explore" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
          Return to Explore
        </Link>
      </div>
    );
  }

  let images: string[] = [];
  try {
    images = property.images_json ? JSON.parse(property.images_json) : [];
  } catch (e) {
    images = [];
  }
  if (images.length === 0 && property.cover_image) {
    images = [property.cover_image];
  }
  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'];
  }

  const saved = isSaved(property.id);
  const compared = isCompared(property.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Back Button & Top Action Row */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Discovery</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleCompare(property.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              compared
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Scale size={14} />
            <span>{compared ? 'Comparing' : 'Add to Compare'}</span>
          </button>

          <button
            onClick={() => toggleSave(property.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              saved
                ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Heart size={14} className={saved ? 'fill-current' : ''} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Report this listing"
          >
            <AlertTriangle size={16} />
          </button>
        </div>
      </div>

      {/* Property Title & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white">
              {property.property_type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
              {property.gender_preference} Accommodation
            </span>
            <VerificationBadge status={property.verification_status} size="md" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {property.property_name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={15} className="text-indigo-500" />
              <span>{property.address}, {property.locality}, {property.city}</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {property.distance_from_college_km} km from {property.nearby_college?.short_name || 'campus'}
            </span>
          </div>
        </div>

        {/* Price Box */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-lg text-right shrink-0">
          <span className="text-xs text-slate-400">Rent starts at</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {formatCurrency(property.monthly_rent)}
            <span className="text-xs font-normal text-slate-400"> /month</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Security Deposit: {formatCurrency(property.security_deposit)}
          </p>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
          <img
            src={images[selectedImageIndex] || images[0]}
            alt={property.property_name}
            className="w-full h-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-24 sm:w-32 aspect-[16/10] rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  selectedImageIndex === idx
                    ? 'border-indigo-600 shadow-md scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details + Sticky Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* LIVE BED AVAILABILITY BOARD (Core Feature) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BedDouble className="text-indigo-500" />
                  <span>Live Bed & Room Inventory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Verified real-time occupancy directly from property owner
                </p>
              </div>
              <FreshnessBadge freshness={property.freshness} showWarningText />
            </div>

            {/* Room & Sharing Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.sharing_summary.map((summary, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    summary.is_available
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base capitalize text-slate-900 dark:text-slate-100">
                      {summary.room_type} Room
                    </span>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(summary.min_rent)}/mo
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Total Beds: <strong>{summary.total_beds}</strong>
                    </span>
                    <span className="text-slate-500">
                      Occupied: <strong>{summary.occupied_beds}</strong>
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    {summary.is_available ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>{summary.available_beds} Bed(s) Available</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-500">Currently Full</span>
                    )}

                    <button
                      onClick={() => setIsInquiryOpen(true)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description & Neighborhood */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">About the Accommodation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>

            {property.neighborhood_overview && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Neighborhood & Locality
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {property.neighborhood_overview}
                </p>
              </div>
            )}
          </div>

          {/* Amenities Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Amenities & Facilities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              {[
                { name: 'High-speed WiFi', available: property.wifi_available, icon: Wifi },
                { name: `Mess Food (${property.food_type})`, available: property.food_available, icon: Utensils },
                { name: 'Air Conditioning', available: property.air_conditioning, icon: Wind },
                { name: 'Attached Bathroom', available: property.attached_bathroom, icon: Bath },
                { name: 'Power Backup 24/7', available: property.power_backup, icon: CheckCircle2 },
                { name: 'CCTV & Security', available: property.security_guard, icon: ShieldCheck },
                { name: 'Laundry Machines', available: property.laundry_available, icon: CheckCircle2 },
                { name: 'RO Drinking Water', available: property.drinking_water_ro, icon: CheckCircle2 },
                { name: 'Vehicle Parking', available: property.parking_available, icon: CheckCircle2 },
                { name: 'Study Desk & Chair', available: property.study_table, icon: CheckCircle2 },
                { name: 'Geyser / Hot Water', available: property.geyser, icon: CheckCircle2 },
                { name: 'Daily Housekeeping', available: property.housekeeping, icon: CheckCircle2 },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                      item.available
                        ? 'border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-800 dark:text-slate-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <Icon size={16} className={item.available ? 'text-indigo-500' : 'text-slate-400'} />
                    <span className="font-medium text-xs truncate">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* House Rules & Schedule */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">House Rules & Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Night Curfew</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{property.curfew_time}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Notice Period</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{property.notice_period_days} Days</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Meals Schedule</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{property.meals_included}</p>
              </div>
            </div>
          </div>

          {/* Map Location */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Location & Campus Proximity</h3>
            <p className="text-xs text-slate-500">
              Exact coordinates: {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)} • {property.distance_from_college_km} km to {property.nearby_college?.name}
            </p>
            <MapView
              properties={[property]}
              selectedCollege={property.nearby_college}
              className="h-80 w-full"
            />
          </div>

          {/* Student Reviews Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Student Reviews</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-500 font-bold text-sm">
                    <Star size={16} className="fill-amber-400" />
                    <span className="ml-1">{property.rating_average.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-slate-400">Based on {property.review_count} student reviews</span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500">No reviews yet. Be the first to share your experience!</p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {rev.student_avatar ? (
                          <img src={rev.student_avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-xs font-bold">
                            {rev.student_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.student_name}</span>
                          <p className="text-[10px] text-slate-400">Verified Resident Student</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 font-bold text-xs">
                        <Star size={12} className="fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review Form */}
            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Write a Review</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className={`p-1 ${newRating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    <Star size={18} className={newRating >= star ? 'fill-amber-400' : ''} />
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                required
                placeholder="How was the food, cleanliness, WiFi, and safety during your stay?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Sticky Column: Contact Owner & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Direct Booking & Inquiries
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                Contact Property Owner
              </h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setIsInquiryOpen(true)}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
              >
                <Send size={16} />
                <span>Send Availability Inquiry</span>
              </button>

              <button
                onClick={() => toggleSave(property.id)}
                className={`w-full py-3 rounded-xl font-semibold text-xs border flex items-center justify-center gap-2 transition ${
                  saved
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Heart size={15} className={saved ? 'fill-current' : ''} />
                <span>{saved ? 'Saved in Your Favorites' : 'Save for Later'}</span>
              </button>
            </div>

            {/* Owner Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-sm">
                  {property.owner_name ? property.owner_name.charAt(0) : 'O'}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {property.owner_name || 'Verified Property Manager'}
                  </h4>
                  <p className="text-[11px] text-emerald-500 font-medium">✓ Verified Landlord</p>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="flex items-center gap-2">
                  <Phone size={13} className="text-indigo-500" />
                  <span>{property.contact_phone}</span>
                </p>
                {property.contact_email && (
                  <p className="flex items-center gap-2">
                    <Mail size={13} className="text-indigo-500" />
                    <span>{property.contact_email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">Student Safety Note:</p>
              <p>Never transfer booking money before inspecting the room or confirming owner verification.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        propertyId={property.id}
        propertyName={property.property_name}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        propertyId={property.id}
        propertyName={property.property_name}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
