import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  User,
  Briefcase,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    {
      id: 'citizen',
      label: 'Citizen',
      shortLabel: 'Citizen',
      icon: User,
      badge: 'Citizen Portal',
      description: 'Lodge civic issues, track resolutions & updates',
      placeholder: 'citizen@example.com',
      color: 'indigo',
    },
    {
      id: 'staff',
      label: 'Staff',
      shortLabel: 'Staff',
      icon: Briefcase,
      badge: 'Field Staff Desk',
      description: 'Review assigned complaints & submit field proofs',
      placeholder: 'staff@civicconnect.gov',
      color: 'amber',
    },
    {
      id: 'admin',
      label: 'Admin',
      shortLabel: 'Admin',
      icon: ShieldCheck,
      badge: 'Admin Command',
      description: 'Municipal governance, triage & department control',
      placeholder: 'admin@civicconnect.gov',
      color: 'rose',
    },
  ];

  const currentRole = roleOptions.find((r) => r.id === selectedRole) || roleOptions[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password, selectedRole);
      toast.success(`Welcome, ${res.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Civic<span className="text-indigo-400">Connect</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Municipal Citizen Complaint & Civic Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800">Sign In to Portal</h2>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                selectedRole === 'citizen'
                  ? 'bg-indigo-100 text-indigo-700'
                  : selectedRole === 'staff'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {currentRole.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-5">{currentRole.description}</p>

          {/* Multiple Role Options for Login: Citizen, Staff, Admin */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Login Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{role.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {currentRole.label} Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder={currentRole.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Authenticating...' : `Sign In as ${currentRole.shortLabel}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            {selectedRole === 'citizen' ? (
              <p className="text-xs text-slate-500">
                New citizen?{' '}
                <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
                  Create an account
                </Link>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Official {currentRole.label} credentials are authorized by Municipal Administration.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
