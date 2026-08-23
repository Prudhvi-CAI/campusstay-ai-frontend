import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  Users,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Edit3,
  Trash2,
  Send,
  ShieldCheck,
  AlertCircle,
  X,
  KeyRound,
} from 'lucide-react';
import { api } from '../services/api';
import { PropertyDetail, Room, Inquiry, College } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { FreshnessBadge } from '../components/FreshnessBadge';
import { VerificationBadge } from '../components/VerificationBadge';
import { PasswordSettingsCard } from '../components/PasswordSettingsCard';

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'inquiries' | 'new_property' | 'security'>('inventory');

  const [overview, setOverview] = useState<{
    total_properties: number;
    total_rooms: number;
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
    occupancy_rate: number;
    pending_inquiries: number;
    verified_properties: number;
    listing_health: string;
  } | null>(null);

  const [properties, setProperties] = useState<PropertyDetail[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inquiry reply state
  const [replyingInquiryId, setReplyingInquiryId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // New property wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState('PG');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropLocality, setNewPropLocality] = useState('');
  const [newPropCity, setNewPropCity] = useState('Amaravati');
  const [newPropCollegeId, setNewPropCollegeId] = useState<number | undefined>();
  const [newPropRent, setNewPropRent] = useState(6500);
  const [newPropDeposit, setNewPropDeposit] = useState(6500);
  const [newPropGender, setNewPropGender] = useState('boys');
  const [newPropPhone, setNewPropPhone] = useState(user?.phone || '');
  const [newPropFood, setNewPropFood] = useState(true);
  const [newPropWifi, setNewPropWifi] = useState(true);
  const [newPropAC, setNewPropAC] = useState(false);
  const [newPropBath, setNewPropBath] = useState(true);
  const [newPropCover, setNewPropCover] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80');

  // Initial rooms in wizard
  const [wizardRooms, setWizardRooms] = useState<any[]>([
    { room_number: '101', room_type: '2-sharing', monthly_rent: 6500, total_beds: 2, occupied_beds: 0 },
    { room_number: '102', room_type: 'single', monthly_rent: 9000, total_beds: 1, occupied_beds: 0 },
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ov, props, inqs, cols] = await Promise.all([
        api.owner.getOverview(),
        api.owner.getProperties(),
        api.owner.getInquiries(),
        api.colleges.list(),
      ]);
      setOverview(ov);
      setProperties(props);
      setInquiries(inqs);
      setColleges(cols);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickAdjust = async (roomId: number, delta: number) => {
    try {
      await api.availability.quickAdjust(roomId, delta);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Could not adjust bed count');
    }
  };

  const handleReplyInquiry = async (inquiryId: number) => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      await api.owner.replyInquiry(inquiryId, replyText);
      setReplyingInquiryId(null);
      setReplyText('');
      await loadData();
      alert('Reply sent to student!');
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const col = colleges.find((c) => c.id === newPropCollegeId);
      await api.properties.create({
        property_name: newPropName,
        property_type: newPropType,
        description: newPropDesc,
        address: newPropAddress,
        city: newPropCity,
        locality: newPropLocality,
        latitude: col ? col.latitude + 0.003 : 28.756,
        longitude: col ? col.longitude + 0.002 : 77.501,
        nearby_college_id: newPropCollegeId,
        monthly_rent: newPropRent,
        security_deposit: newPropDeposit,
        gender_preference: newPropGender,
        contact_phone: newPropPhone,
        food_available: newPropFood,
        wifi_available: newPropWifi,
        air_conditioning: newPropAC,
        attached_bathroom: newPropBath,
        cover_image: newPropCover,
        initial_rooms: wizardRooms,
      });
      alert('Property listed successfully with live bed inventory!');
      setActiveTab('inventory');
      setWizardStep(1);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create property');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-2xl border border-indigo-400/30">
            <Building2 size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Landlord & Manager Portal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/20">
                ✓ Verified Partner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {user?.owner_profile?.business_name || user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Live Bed Inventory & Real-Time Availability Manager
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('new_property')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-lg shadow-indigo-500/25 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>List New Property</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Properties</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{overview.total_properties}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Beds</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{overview.total_beds}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Available Beds</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{overview.available_beds}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Occupied Beds</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{overview.occupied_beds}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{overview.occupancy_rate}%</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-purple-500/30 bg-purple-500/5 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500">Inquiries</span>
            <p className="text-2xl font-black text-purple-500 mt-1">{overview.pending_inquiries} pending</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BedDouble size={16} />
          <span>Live Bed Availability Manager ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'inquiries'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare size={16} />
          <span>Student Inquiries ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('new_property')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'new_property'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Plus size={16} />
          <span>New Property Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound size={16} />
          <span>Password & Security</span>
        </button>
      </div>

      {/* TAB 1: LIVE AVAILABILITY MANAGER */}
      {activeTab === 'inventory' && (
        <div className="space-y-8">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
            >
              {/* Property Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {prop.property_name}
                    </h3>
                    <VerificationBadge status={prop.verification_status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {prop.locality}, {prop.city} • {prop.distance_from_college_km} km to {prop.nearby_college?.short_name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <FreshnessBadge freshness={prop.freshness} />
                  <Link
                    to={`/properties/${prop.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100"
                  >
                    View Listing
                  </Link>
                </div>
              </div>

              {/* Room Inventory Table / Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Room & Bed Allocation Table
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prop.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            Room {room.room_number}
                          </span>
                          <span className="text-xs text-slate-400 block capitalize">
                            {room.room_type} ({formatCurrency(room.monthly_rent)}/mo)
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            room.available_beds > 0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {room.available_beds > 0 ? `${room.available_beds} Available` : 'Full'}
                        </span>
                      </div>

                      {/* Bed Stats */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Total: <strong>{room.total_beds}</strong></span>
                        <span>Occupied: <strong>{room.occupied_beds}</strong></span>
                        <span>Available: <strong className="text-emerald-500">{room.available_beds}</strong></span>
                      </div>

                      {/* Instant Occupancy Adjusters */}
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Occupancy:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickAdjust(room.id, -1)}
                            disabled={room.occupied_beds <= 0}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition disabled:opacity-30"
                            title="Bed freed up (-1 occupied)"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{room.occupied_beds}</span>
                          <button
                            onClick={() => handleQuickAdjust(room.id, 1)}
                            disabled={room.occupied_beds >= room.total_beds}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 transition disabled:opacity-30"
                            title="Bed occupied (+1 occupied)"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: STUDENT INQUIRIES INBOX */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800">
              <MessageSquare size={40} className="mx-auto text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No student inquiries yet</h3>
              <p className="text-xs text-slate-500">Student messages and move-in questions will appear here.</p>
            </div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      Inquiry from {inq.student_name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Property: <strong>{inq.property_name}</strong> • Phone: {inq.student_phone || 'None provided'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      inq.status === 'replied'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {inq.status === 'replied' ? '✓ Replied' : 'Pending Response'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-400 mb-1">Student Message:</p>
                  <p className="leading-relaxed">{inq.message}</p>
                </div>

                {inq.owner_response && (
                  <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-800 dark:text-slate-200">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">Your Sent Reply:</p>
                    <p>{inq.owner_response}</p>
                  </div>
                )}

                {inq.status === 'pending' && replyingInquiryId !== inq.id && (
                  <button
                    onClick={() => {
                      setReplyingInquiryId(inq.id);
                      setReplyText('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Reply to Student
                  </button>
                )}

                {replyingInquiryId === inq.id && (
                  <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <textarea
                      rows={2}
                      placeholder="Type your response to the student..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingInquiryId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReplyInquiry(inq.id)}
                        disabled={isReplying}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      >
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: NEW PROPERTY WIZARD */}
      {activeTab === 'new_property' && (
        <form
          onSubmit={handleCreateProperty}
          className="max-w-3xl bg-white dark:bg-[#0f172a] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
        >
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              List a New Student Accommodation
            </h3>
            <p className="text-xs text-slate-400">
              Add your rooms and live bed inventory. Your listing will be immediately searchable by students.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Star Boys PG"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Property Type</label>
                <select
                  value={newPropType}
                  onChange={(e) => setNewPropType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <option value="PG">PG (Paying Guest)</option>
                  <option value="Hostel">Student Hostel</option>
                  <option value="Room">Independent Room</option>
                  <option value="Apartment">Apartment / Flat</option>
                  <option value="House">Student House</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nearby College</label>
              <select
                value={newPropCollegeId || ''}
                onChange={(e) => setNewPropCollegeId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="">Select Campus</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.short_name} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Address / Street</label>
                <input
                  type="text"
                  required
                  placeholder="Lane 2, Near Main Gate"
                  value={newPropAddress}
                  onChange={(e) => setNewPropAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Locality</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muradnagar"
                  value={newPropLocality}
                  onChange={(e) => setNewPropLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Starting Rent (₹/mo)</label>
                <input
                  type="number"
                  required
                  value={newPropRent}
                  onChange={(e) => setNewPropRent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  required
                  value={newPropDeposit}
                  onChange={(e) => setNewPropDeposit(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Gender</label>
                <select
                  value={newPropGender}
                  onChange={(e) => setNewPropGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <option value="boys">Boys Only</option>
                  <option value="girls">Girls Only</option>
                  <option value="co-ed">Co-ed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
              <textarea
                rows={3}
                required
                placeholder="Describe facilities, cleanliness, mess food quality, study environment..."
                value={newPropDesc}
                onChange={(e) => setNewPropDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Amenities Checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={newPropFood} onChange={(e) => setNewPropFood(e.target.checked)} />
                <span>Food Included</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={newPropWifi} onChange={(e) => setNewPropWifi(e.target.checked)} />
                <span>WiFi</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={newPropAC} onChange={(e) => setNewPropAC(e.target.checked)} />
                <span>Air Conditioning</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={newPropBath} onChange={(e) => setNewPropBath(e.target.checked)} />
                <span>Attached Bath</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition"
          >
            Publish Listing & Live Inventory
          </button>
        </form>
      )}

      {/* TAB 4: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <div className="max-w-2xl">
          <PasswordSettingsCard roleName="Landlord / Owner" />
        </div>
      )}
    </div>
  );
};
