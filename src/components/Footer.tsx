import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">CampusStay AI</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered student rental & PG discovery platform. Grounded semantic search, live bed inventory, and verified listings near your college.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck size={16} />
              <span>100% Verified Live Availability</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Discover</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore" className="hover:text-indigo-400 transition">Explore All Rentals</Link></li>
              <li><Link to="/chat" className="hover:text-indigo-400 transition">AI Natural Language Search</Link></li>
              <li><Link to="/compare" className="hover:text-indigo-400 transition">Property Comparison</Link></li>
              <li><Link to="/explore?room_type=2-sharing" className="hover:text-indigo-400 transition">2-Sharing Student PGs</Link></li>
              <li><Link to="/explore?room_type=single" className="hover:text-indigo-400 transition">Single Private Rooms</Link></li>
            </ul>
          </div>

          {/* Top Colleges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Top Campuses</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore?college_name=SRM AP" className="hover:text-indigo-400 transition">PGs near SRM University AP</Link></li>
              <li><Link to="/explore?college_name=VIT-AP" className="hover:text-indigo-400 transition">Hostels near VIT-AP Amaravati</Link></li>
              <li><Link to="/explore?college_name=GITAM" className="hover:text-indigo-400 transition">Stays near GITAM Visakhapatnam</Link></li>
              <li><Link to="/explore?college_name=KL University" className="hover:text-indigo-400 transition">Accommodations near KL University</Link></li>
              <li><Link to="/explore?college_name=Andhra University" className="hover:text-indigo-400 transition">Rooms near Andhra University</Link></li>
              <li><Link to="/explore?college_name=IIT Tirupati" className="hover:text-indigo-400 transition">PGs near IIT Tirupati</Link></li>
            </ul>
          </div>

          {/* For Property Owners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">For Property Owners</h4>
            <p className="text-xs text-slate-400">
              List your student hostel or PG and manage live bed availability effortlessly.
            </p>
            <Link
              to="/register"
              className="inline-block px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              List Property as Owner
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 CampusStay AI. Built for students worldwide.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Anti-Scam Trust Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
