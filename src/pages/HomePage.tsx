import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  BedDouble,
  Compass,
  MapPin,
  Utensils,
  Wifi,
  Users,
  CheckCircle2,
  Star,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { PropertySummary, College } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { CollegeSearchCombobox } from '../components/CollegeSearchCombobox';
import { formatCurrency } from '../lib/utils';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<PropertySummary[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');

  const cities = ['All', 'Amaravati', 'Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur', 'Kakinada', 'Anantapur', 'Kurnool', 'Bhimavaram'];

  const filteredCampuses = colleges.filter((c) => {
    const matchesCity = selectedCityFilter === 'All' || c.city.toLowerCase() === selectedCityFilter.toLowerCase();
    const query = collegeSearchQuery.toLowerCase().trim();
    const matchesQuery = !query || (
      c.name.toLowerCase().includes(query) ||
      c.short_name.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query)
    );
    return matchesCity && matchesQuery;
  });

  const samplePrompts = [
    "I need a 2-sharing PG near SRM University AP under ₹8,000 with WiFi and food",
    "Single room with AC within 2 km of GITAM Vizag",
    "Quiet boys hostel near KL University Vaddeswaram with power backup",
    "Safe girls PG with Andhra mess and no strict curfew near VIT-AP",
  ];

  useEffect(() => {
    Promise.all([
      api.properties.list({ limit: 6, verified_only: false }),
      api.colleges.list(),
    ])
      .then(([props, cols]) => {
        setFeaturedProperties(props);
        setColleges(cols);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      navigate('/explore');
      return;
    }
    navigate(`/chat?q=${encodeURIComponent(query)}${selectedCollegeId ? `&college_id=${selectedCollegeId}` : ''}`);
  };

  const handlePromptClick = (prompt: string) => {
    navigate(`/chat?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION WITH AI SEARCH */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Background Gradients & Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold animate-fade-in">
            <Sparkles size={15} className="text-indigo-500" />
            <span>AI-Powered Discovery with Verified Live Bed Inventory</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Find a place that fits your{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
              student life.
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Tell CampusStay AI what you need in plain English. We check real-time bed availability, calculate exact campus distances, and rank your best accommodations.
          </p>

          {/* Large AI Search Box */}
          <div className="max-w-3xl mx-auto pt-4">
            <form
              onSubmit={handleSearchSubmit}
              className="relative p-2 rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-3 w-full px-3 py-2">
                <Sparkles size={22} className="text-indigo-500 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: I need a 2-sharing PG near SRM AP under ₹8,000 with WiFi and food..."
                  className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <div className="w-full sm:w-56">
                  <CollegeSearchCombobox
                    colleges={colleges}
                    selectedCollegeId={selectedCollegeId}
                    onSelect={setSelectedCollegeId}
                    placeholder="Search campus..."
                    allOptionLabel="All Campuses"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition shrink-0"
                >
                  <span>Ask AI</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Try asking:</span>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(p)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700/60 transition"
                >
                  "{p.slice(0, 38)}..."
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAMPUS HUBS EXPLORER WITH LIVE SEARCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              🎓 Andhra Pradesh Universities & Colleges
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Find Stays Near Your College
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Search all 18+ universities across AP and discover verified accommodations within walking distance
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Explore All Accommodations</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Live Search Bar & City Filters for Colleges */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={collegeSearchQuery}
              onChange={(e) => setCollegeSearchQuery(e.target.value)}
              placeholder="Search Andhra Pradesh colleges by name, short name or city (e.g. SRM, GITAM, Tirupati, Vizag)..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {collegeSearchQuery && (
              <button
                type="button"
                onClick={() => setCollegeSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold px-2 py-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* City Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1 shrink-0">City:</span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCityFilter(city)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                  selectedCityFilter === city
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Filtered Campus Grid */}
        {filteredCampuses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-slate-600 dark:text-slate-300 font-bold text-base">No colleges match your search criteria</p>
            <p className="text-xs text-slate-400">Try searching for "Amaravati", "Vizag", "GITAM", "IIT", or reset your city filter.</p>
            <button
              onClick={() => {
                setCollegeSearchQuery('');
                setSelectedCityFilter('All');
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCampuses.map((col) => (
              <Link
                key={col.id}
                to={`/explore?college_id=${col.id}`}
                className="group p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform shrink-0 border border-indigo-500/20">
                    🎓
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {col.short_name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {col.name}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium truncate">
                    <MapPin size={12} className="text-indigo-500 shrink-0" />
                    <span className="truncate">{col.city}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform shrink-0">
                    View Rooms <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Intelligent Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How CampusStay AI Works</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            From prompt to verified room in minutes — no outdated phone numbers or fake listings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Tell Us What You Need',
              desc: 'State your college, budget, sharing preference, and lifestyle vibes in natural language.',
              icon: Sparkles,
            },
            {
              step: '02',
              title: 'Hybrid SQL & Vector Search',
              desc: 'We match hard constraints against current data and semantically search qualitative reviews.',
              icon: Search,
            },
            {
              step: '03',
              title: 'Live Bed Verification',
              desc: 'Authoritative inventory guarantees room availability updated directly by verified owners.',
              icon: BedDouble,
            },
            {
              step: '04',
              title: 'Compare & Move In',
              desc: 'Compare options side-by-side with AI recommendations, send direct inquiries, and book.',
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3 relative overflow-hidden group hover:border-indigo-500 transition-colors"
              >
                <span className="text-4xl font-extrabold text-slate-100 dark:text-slate-800/80 absolute top-4 right-4 group-hover:text-indigo-500/20 transition-colors">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED / VERIFIED ACCOMMODATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Verified Listings
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Recently Verified Student Stays
            </h2>
          </div>
          <Link
            to="/explore?verified_only=true"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
          >
            <span>Explore All Verified</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* 5. TRUST & ANTI-SCAM PROMISE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white relative overflow-hidden border border-indigo-500/20 shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Anti-Scam & Trust Protocol
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              We Never Fake Availability.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every accommodation on CampusStay AI has a visible freshness timestamp. If an owner hasn't verified bed inventory recently, we warn you before you visit. No broker commissions, no surprise deposits.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/chat"
                className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-indigo-900 hover:bg-slate-100 transition shadow-lg"
              >
                Start AI Search
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/10 transition"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
