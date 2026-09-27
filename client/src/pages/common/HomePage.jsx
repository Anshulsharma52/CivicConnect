import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Camera,
  CheckCircle2,
  ArrowRight,
  Search,
  AlertTriangle,
  Lightbulb,
  Droplet,
  Trash2,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [trackingId, setTrackingId] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState('citizen');
  const [openFaq, setOpenFaq] = useState(null);

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.info('Please enter a Complaint ID to check status.');
      return;
    }

    if (isAuthenticated) {
      navigate(`/complaints/${trackingId.trim()}`);
    } else {
      toast.info('Please sign in to view full complaint resolution details.');
      navigate(`/login?redirect=/complaints/${trackingId.trim()}`);
    }
  };

  const handleReportClick = () => {
    if (isAuthenticated) {
      navigate('/complaints/new');
    } else {
      toast.info('Please sign in or register to lodge a new complaint.');
      navigate('/login?redirect=/complaints/new');
    }
  };

  const categories = [
    {
      name: 'Road Damage & Potholes',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      dept: 'Public Works (PWD)',
      sla: '24 - 48 Hours',
      desc: 'Cracked asphalt, dangerous potholes, cave-ins, and uneven road surfaces.',
    },
    {
      name: 'Garbage & Sanitation',
      icon: Trash2,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      dept: 'Sanitation & Solid Waste',
      sla: '12 - 24 Hours',
      desc: 'Overflowing dustbins, unattended garbage piles, and illegal dumping.',
    },
    {
      name: 'Street Light & Electrical',
      icon: Lightbulb,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      dept: 'Electrical Division',
      sla: '24 Hours',
      desc: 'Flickering lamps, dark streets, exposed wiring, and broken fixtures.',
    },
    {
      name: 'Water Supply & Leakage',
      icon: Droplet,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
      dept: 'Water Supply & Sewerage',
      sla: '12 - 36 Hours',
      desc: 'Pipeline bursts, contaminated water, low water pressure, and leakages.',
    },
    {
      name: 'Drainage & Sewage',
      icon: Layers,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      dept: 'Stormwater Drainage',
      sla: '24 - 48 Hours',
      desc: 'Clogged manholes, sewage overflow, waterlogging, and open drains.',
    },
    {
      name: 'Public Infrastructure',
      icon: Building2,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-700',
      dept: 'Urban Development',
      sla: '48 - 72 Hours',
      desc: 'Damaged sidewalks, broken park benches, vandalized public facilities.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Spot & Report',
      desc: 'Take a photo, allow GPS auto-detection or drop a map pin, pick a category, and submit.',
      icon: Camera,
    },
    {
      step: '02',
      title: 'Department Dispatch',
      desc: 'System assigns a unique tracking ID and auto-routes the task directly to the municipal team.',
      icon: Zap,
    },
    {
      step: '03',
      title: 'Field Execution',
      desc: 'Municipal staff receives the geo-coordinates, completes on-ground repairs, and uploads resolution photos.',
      icon: Activity,
    },
    {
      step: '04',
      title: 'Citizen Notification',
      desc: 'Real-time WebSocket alerts notify you. You can review the before/after photos and confirm closure.',
      icon: Award,
    },
  ];

  const faqs = [
    {
      q: 'Do I need an account to report an issue?',
      a: 'Yes, creating a free citizen account takes less than 30 seconds and ensures you receive real-time notifications, status updates, and can track all your lodged complaints in your personal dashboard.',
    },
    {
      q: 'How does the municipal staff find the exact location of the issue?',
      a: 'When you submit a complaint, CivicConnect captures the GPS latitude and longitude directly from your device or via Leaflet interactive map, accompanied by street address details and uploaded reference photos.',
    },
    {
      q: 'What happens if a complaint is rejected or delayed?',
      a: 'Every status change requires an explanation. If an issue is rejected (e.g. duplicate or out of jurisdiction), the officer must provide a note. Delayed issues automatically escalate in the admin SLA monitoring dashboard.',
    },
    {
      q: 'Who verifies when an issue is resolved?',
      a: 'Field workers must upload resolution proof photos. The municipal administrator and the reporting citizen are both notified to review and verify before the ticket is permanently closed.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* ────────────────── TOP NAVIGATION BAR ────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white flex items-center gap-1">
                Civic<span className="text-indigo-400">Connect</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Municipal Grievance Portal
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">
              How It Works
            </a>
            <a href="#categories" className="hover:text-indigo-400 transition-colors">
              Categories
            </a>
            <a href="#roles" className="hover:text-indigo-400 transition-colors">
              Portals
            </a>
            <a href="#faq" className="hover:text-indigo-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </Link>
                <button
                  onClick={handleReportClick}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Report Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ────────────────── HERO SECTION ────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        {/* Decorative glow gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-sky-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-600/10 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Municipal Civic Grievance & Resolution Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Transforming Citizen Voices into{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Neighborhood Action
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Report road damages, overflowing garbage, broken street lamps, or water leakages in
            seconds. Track your city's municipal response with verified live updates.
          </p>

          {/* Quick Actions & Live Complaint Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-2xl backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Complaint ID (e.g., CC-10023)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-transparent text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-600/30"
              >
                Track Status
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleReportClick}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5"
              >
                <Camera className="w-4 h-4" />
                Lodge a Civic Complaint
              </button>
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                Open Municipal Dashboard
              </Link>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-white">4,800+</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Complaints Resolved</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 24 Hrs</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Average Response SLA</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-sky-400">7 Depts</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Direct Municipal Integration</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-indigo-400">98.2%</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Resolution Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── ISSUE CATEGORIES ────────────────── */}
      <section id="categories" className="py-16 lg:py-24 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Citizen Service Categories
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              What Issue Would You Like to Report?
            </p>
            <p className="text-sm text-slate-400 mt-2">
              CivicConnect connects you instantly with the relevant municipal division.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, index) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        SLA: {cat.sla}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">
                      Responsible: {cat.dept}
                    </p>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{cat.desc}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={handleReportClick}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                    >
                      Report this issue
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      GPS Geotagged
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────── HOW IT WORKS WORKFLOW ────────────────── */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Transparent Municipal Workflow
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              From Lodging to Resolution in 4 Clear Steps
            </p>
            <p className="text-sm text-slate-400 mt-2">
              No endless municipal office visits. Follow every milestone in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 rounded-2xl bg-slate-800/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-indigo-500/40">{step.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Real-time Audited</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────── ROLE-BASED PORTALS SHOWCASE ────────────────── */}
      <section id="roles" className="py-16 lg:py-24 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Role-Based Unified Platform
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Built for Citizens, Field Crews & City Leaders
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveRoleTab('citizen')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeRoleTab === 'citizen'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                For Citizens
              </button>
              <button
                onClick={() => setActiveRoleTab('staff')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeRoleTab === 'staff'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                For Field Staff
              </button>
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeRoleTab === 'admin'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                For City Administrators
              </button>
            </div>
          </div>

          {/* Active Tab Content Card */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800">
            {activeRoleTab === 'citizen' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                    Citizen Redressal
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Your Neighborhood in the Palm of Your Hand
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Easily report civic hazards with GPS location accuracy. Monitor status changes
                    through live sockets, check resolution notes, and confirm when the job is done.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      1-click GPS detection or manual interactive pin placement.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Multiple image uploads for clear visual verification.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Track resolution notes and before/after photos.
                    </li>
                  </ul>
                  <button
                    onClick={handleReportClick}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    Get Started as Citizen
                  </button>
                </div>
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">Live Complaint Feed</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Sample Ticket</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-200">Dangerous Pothole on 5th Ave</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                          IN PROGRESS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Assigned to: Road Repair Unit #3</p>
                      <p className="text-[10px] text-indigo-400 mt-1">Ref ID: CC-10492</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-200">Main Water Valve Leakage</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          RESOLVED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Fixed within 6 hours by Water Works</p>
                      <p className="text-[10px] text-indigo-400 mt-1">Ref ID: CC-10488</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'staff' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                    Field Crew Workstation
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Streamlined Mobile Task Management
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Field crews receive real-time assignments, navigate via integrated maps, change
                    lifecycle states, and document their repairs with photo proofs.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Priority-ordered task queue (HIGH, MEDIUM, LOW).
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      One-click status transition to IN_PROGRESS and RESOLVED.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Direct camera upload for resolution evidence.
                    </li>
                  </ul>
                  <Link
                    to="/login"
                    className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                  >
                    Staff Portal Login
                  </Link>
                </div>
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                    <span className="font-bold text-white">Staff Assigned Tasks (3 active)</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                      Water Dept
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Sector 4 Sewer Line Blockage</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                          HIGH
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Target SLA: 12 Hours</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'admin' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
                    Municipal Oversight & Command
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    City-Wide Analytics & Quality Governance
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Administrators oversee all municipal divisions, assign field staff, monitor SLA
                    compliance, detect grievance hotspots, and verify closures.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      Multi-department dispatch and workload balancing.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      Live complaint heatmap and geographical clustering.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      SLA breach detection & escalation management.
                    </li>
                  </ul>
                  <Link
                    to="/login"
                    className="inline-block px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                  >
                    Admin Control Center
                  </Link>
                </div>
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                    <span className="font-bold text-white">City Command Metrics</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Live SLA: 98.2%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <p className="text-lg font-bold text-white">128</p>
                      <p className="text-[10px] text-slate-400">Total Open</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <p className="text-lg font-bold text-emerald-400">4,812</p>
                      <p className="text-[10px] text-slate-400">Resolved</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ────────────────── COMPLAINT STATUS LIFECYCLE ────────────────── */}
      <section className="py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Status Transparency
            </h2>
            <p className="text-2xl font-extrabold text-white">
              Understanding Your Complaint's Lifecycle
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { status: 'PENDING', desc: 'Submitted by citizen', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
              { status: 'VERIFIED', desc: 'Reviewed by administrator', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              { status: 'ASSIGNED', desc: 'Routed to field crew', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
              { status: 'IN_PROGRESS', desc: 'On-ground work underway', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
              { status: 'RESOLVED', desc: 'Completed with photo proof', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
              { status: 'CLOSED', desc: 'Verified & finalized', badge: 'bg-slate-700 text-slate-300 border-slate-600' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black border ${item.badge} mb-2`}>
                  {item.status}
                </span>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── FREQUENTLY ASKED QUESTIONS ────────────────── */}
      <section id="faq" className="py-16 lg:py-24 bg-slate-950 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Got Questions?
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── EMERGENCY CONTACT HELPLINES ────────────────── */}
      <section className="py-12 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Municipal Emergency Helplines</h3>
                <p className="text-xs text-slate-400">
                  For life-threatening situations, active gas leaks, or major road collapses.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <span className="text-slate-400">Water Emergency:</span>{' '}
                <span className="font-bold text-white">1800-419-0021</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <span className="text-slate-400">Electricity Board:</span>{' '}
                <span className="font-bold text-white">1800-419-0022</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <span className="text-slate-400">Sanitation Control:</span>{' '}
                <span className="font-bold text-white">1800-419-0023</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── CALL TO ACTION BANNER ────────────────── */}
      <section className="py-16 bg-slate-950 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Make Your Neighborhood Cleaner and Safer?
          </h2>
          <p className="mt-4 text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Report issues in your locality, track resolution timelines, and collaborate directly
            with city officials.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleReportClick}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30"
            >
              Report a Problem Now
            </button>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition"
            >
              Create Free Citizen Account
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">
              Civic<span className="text-indigo-400">Connect</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} CivicConnect Municipal System. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <Link to="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-white transition">
              Register
            </Link>
            <Link to="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
