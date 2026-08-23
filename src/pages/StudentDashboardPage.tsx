import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  Bell,
  MessageSquare,
  Settings,
  Sparkles,
  Building,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  Clock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { PropertySummary, Inquiry, AvailabilityAlert, College } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { PasswordSettingsCard } from '../components/PasswordSettingsCard';
import { CollegeSearchCombobox } from '../components/CollegeSearchCombobox';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';

export const StudentDashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'inquiries' | 'alerts' | 'preferences' | 'security'>('favorites');

  const [favorites, setFavorites] = useState<PropertySummary[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [alerts, setAlerts] = useState<AvailabilityAlert[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  // Preferences form state
  const [collegeId, setCollegeId] = useState<number | undefined>(user?.student_profile?.college_id);
  const [budgetMin, setBudgetMin] = useState(user?.student_profile?.budget_min || 3000);
  const [budgetMax, setBudgetMax] = useState(user?.student_profile?.budget_max || 8000);
  const [preferredRoom, setPreferredRoom] = useState(user?.student_profile?.preferred_room_type || '2-sharing');
  const [maxDistance, setMaxDistance] = useState(user?.student_profile?.max_distance_km || 3.0);
  const [gender, setGender] = useState(user?.student_profile?.gender || 'boys');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // New alert state
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [newAlertBudget, setNewAlertBudget] = useState(7000);
  const [newAlertRoom, setNewAlertRoom] = useState('2-sharing');
  const [newAlertDistance, setNewAlertDistance] = useState(3.0);

  useEffect(() => {
    api.student.getFavorites().then(setFavorites).catch(console.error);
    api.inquiries.getStudentInquiries().then(setInquiries).catch(console.error);
    api.student.getAlerts().then(setAlerts).catch(console.error);
    api.colleges.list().then(setColleges).catch(console.error);
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    try {
      await api.auth.updateProfile({
        student_profile: {
          college_id: collegeId,
          budget_min: budgetMin,
          budget_max: budgetMax,
          preferred_room_type: preferredRoom,
          max_distance_km: maxDistance,
          gender: gender,
        },
      });
      await refreshUser();
      alert('Preferences updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.student.createAlert({
        college_id: collegeId,
        max_budget: newAlertBudget,
        room_type: newAlertRoom,
        max_distance_km: newAlertDistance,
      });
      setAlerts((prev) => [created, ...prev]);
      setIsCreatingAlert(false);
      alert('Availability Alert created! You will be notified when matching beds open up.');
    } catch (err: any) {
      alert(err.message || 'Failed to create alert');
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await api.student.deleteAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      alert('Failed to delete alert');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-2xl border border-indigo-400/30">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Student Account
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {user?.email} • {user?.phone || 'No phone added'}
            </p>
          </div>
        </div>

        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-indigo-900 hover:bg-slate-100 transition shadow-md self-start sm:self-auto"
        >
          <Sparkles size={16} className="text-indigo-600" />
          <span>Launch AI Search</span>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'favorites', label: `Saved Stays (${favorites.length})`, icon: Heart },
          { id: 'inquiries', label: `Inquiries & Replies (${inquiries.length})`, icon: MessageSquare },
          { id: 'alerts', label: `Availability Alerts (${alerts.length})`, icon: Bell },
          { id: 'preferences', label: 'Housing Preferences', icon: Settings },
          { id: 'security', label: 'Password & Security', icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Saved Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favorites.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800">
              <Heart size={40} className="mx-auto text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No saved accommodations yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the heart icon on any property card while searching to save it here for fast access.
              </p>
              <Link to="/explore" className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white">
                Explore Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Inquiries & Replies */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800">
              <MessageSquare size={40} className="mx-auto text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No inquiries sent yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Send direct questions or move-in inquiries to property owners from any listing page.
              </p>
            </div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400">Inquiry for</span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {inq.property_name}
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize self-start sm:self-auto ${
                      inq.status === 'replied'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {inq.status === 'replied' ? '✓ Owner Replied' : 'Pending Reply'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-400">Your Message:</p>
                  <p>{inq.message}</p>
                </div>

                {inq.owner_response && (
                  <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-800 dark:text-slate-200 space-y-1">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>Owner's Response:</span>
                    </p>
                    <p className="leading-relaxed">{inq.owner_response}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span>Sent {new Date(inq.created_at).toLocaleDateString()}</span>
                  <Link
                    to={`/properties/${inq.property_id}`}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Property
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Availability Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Live Availability Alerts</h3>
              <p className="text-xs text-slate-500">
                Get notified automatically the moment a bed matching your criteria opens up.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingAlert(!isCreatingAlert)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus size={15} />
              <span>New Alert</span>
            </button>
          </div>

          {/* New Alert Form Modal / Drawer */}
          {isCreatingAlert && (
            <form
              onSubmit={handleCreateAlert}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-indigo-500/30 shadow-xl space-y-4 animate-fade-in"
            >
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Create New Availability Trigger</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Max Budget</label>
                  <input
                    type="number"
                    value={newAlertBudget}
                    onChange={(e) => setNewAlertBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Room Sharing</label>
                  <select
                    value={newAlertRoom}
                    onChange={(e) => setNewAlertRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    <option value="single">Single</option>
                    <option value="2-sharing">2-Sharing</option>
                    <option value="3-sharing">3-Sharing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Max Campus Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAlertDistance}
                    onChange={(e) => setNewAlertDistance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingAlert(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
                >
                  Set Alert
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Watcher
                  </span>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-slate-400 hover:text-rose-500"
                    title="Delete Alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {alert.room_type} room under {formatCurrency(alert.max_budget)}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Within {alert.max_distance_km} km of {alert.college_name || 'Campus'}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Created on {new Date(alert.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Stored Housing Preferences */}
      {activeTab === 'preferences' && (
        <form
          onSubmit={handleSavePreferences}
          className="max-w-2xl bg-white dark:bg-[#0f172a] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Personal Housing Preferences
            </h3>
            <p className="text-xs text-slate-400">
              CampusStay AI uses these preferences to calculate your custom match scores and tailor conversational recommendations.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Your College / University
              </label>
              <CollegeSearchCombobox
                colleges={colleges}
                selectedCollegeId={collegeId}
                onSelect={setCollegeId}
                placeholder="Search your college or university..."
                allOptionLabel="Select University"
                buttonClassName="bg-slate-100 dark:bg-slate-800 text-sm py-2.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Budget Min (₹)
                </label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Budget Max (₹)
                </label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Preferred Sharing
                </label>
                <select
                  value={preferredRoom}
                  onChange={(e) => setPreferredRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
                >
                  <option value="single">Single Room</option>
                  <option value="2-sharing">2-Sharing (Double)</option>
                  <option value="3-sharing">3-Sharing (Triple)</option>
                  <option value="4-sharing">4-Sharing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Max Campus Distance (km)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Gender Preference
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200"
              >
                <option value="boys">Boys PG / Hostel</option>
                <option value="girls">Girls PG / Hostel</option>
                <option value="co-ed">Co-ed Living</option>
                <option value="any">Any</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPrefs}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 transition"
          >
            <Save size={16} />
            <span>{isSavingPrefs ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </form>
      )}

      {/* Tab 5: Password & Security Settings */}
      {activeTab === 'security' && (
        <div className="max-w-2xl">
          <PasswordSettingsCard roleName="Student" />
        </div>
      )}
    </div>
  );
};
