import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';

// ── Customer Profile Screen ───────────────────────────────────
// Route: /customer/profile
// Static data, no auth. Settings list is visual only.
export default function CustomerProfile() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, profile, updateProfile } = useApp();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl);

  const stats = [
    { label: 'Orders Placed', value: '23', icon: 'receipt_long' },
    { label: 'Fav Shop', value: 'Burger Barn', icon: 'favorite' },
    { label: 'Member Since', value: 'Jan 2024', icon: 'calendar_today' },
  ];

  const accountSettings = [
    { label: 'Edit Profile', icon: 'person', action: 'edit-profile' },
    { label: 'Payment Methods', icon: 'payments', action: 'payment-methods' },
    { label: 'Order History', icon: 'receipt_long', action: 'order-history' },
  ];

  const appSettings = [
    { label: 'Notifications', icon: 'notifications', action: 'notifications' },
    { label: 'About QuickBite', icon: 'info', action: 'about' },
  ];

  const handleAccountClick = (action) => {
    if (action === 'edit-profile') {
      setEditName(profile.name);
      setEditAvatarUrl(profile.avatarUrl);
      setShowEditProfile(true);
    } else if (action === 'payment-methods') {
      setShowPaymentInfo(true);
    } else if (action === 'order-history') {
      navigate('/orders/history');
    }
  };

  const handleAppClick = (action) => {
    if (action === 'about') {
      navigate('/about');
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: editName.trim() || profile.name,
      avatarUrl: editAvatarUrl.trim() || profile.avatarUrl,
    });
    setShowEditProfile(false);
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg font-body text-on-surface animate-fade-in">
      {/* ── Top App Bar ──────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-6 h-16 w-full">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600 dark:text-orange-500">restaurant</span>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-2xl font-black text-orange-600 dark:text-orange-500 italic">
              QuickBite
            </h1>
          </div>
          <button className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 duration-200 p-2 rounded-full">
            <span className="material-symbols-outlined text-zinc-500 dark:text-zinc-400">search</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
        {/* ── Profile Hero ──────────────────────────────────── */}
        <section className="relative">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden premium-shadow border-4 border-surface-container-lowest dark:border-dark-card">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                className="absolute bottom-0 right-0 bg-primary-gradient p-2 rounded-full text-white shadow-lg active:scale-90 transition-transform"
                onClick={() => handleAccountClick('edit-profile')}
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div className="text-center">
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-background dark:text-dark-text">
                {profile.name}
              </h2>
              <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mt-1">
                QuickBite Member
              </p>
            </div>
          </div>
        </section>

        {/* ── Stats Bento Grid ──────────────────────────────── */}
        <section className="grid grid-cols-3 gap-3">
          {stats.map(stat => (
            <div key={stat.label} className="bg-surface-container-lowest dark:bg-dark-card p-4 rounded-xl premium-shadow flex flex-col items-center justify-center space-y-1">
              <span className="material-symbols-outlined text-primary text-lg">{stat.icon}</span>
              <span className="font-headline text-lg font-bold text-gradient">{stat.value}</span>
              <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest text-center">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* ── Account Settings ────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="font-headline text-lg font-bold px-1 text-on-background dark:text-dark-text">Account Settings</h3>
          <div className="bg-surface-container-lowest dark:bg-dark-card rounded-xl premium-shadow overflow-hidden">
            {accountSettings.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center justify-between p-4 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors cursor-pointer group ${i < accountSettings.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
                onClick={() => handleAccountClick(s.action)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <span className="font-medium text-on-surface dark:text-dark-text">{s.label}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── App Settings ─────────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="font-headline text-lg font-bold px-1 text-on-background dark:text-dark-text">App Settings</h3>
          <div className="bg-surface-container-lowest dark:bg-dark-card rounded-xl premium-shadow overflow-hidden">
            {/* ── DARK MODE TOGGLE ───────────────────────────── */}
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">dark_mode</span>
                </div>
                <div>
                  <span className="font-medium text-on-surface dark:text-dark-text">Dark Mode</span>
                  <p className="text-xs text-on-surface-variant">Affects entire app</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="customer-dark-mode-toggle"
                  type="checkbox"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {appSettings.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center justify-between p-4 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors cursor-pointer group ${i < appSettings.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
                onClick={() => handleAppClick(s.action)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <span className="font-medium text-on-surface dark:text-dark-text">{s.label}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Logout Button ─────────────────────────────────── */}
        <button
          id="logout-btn"
          className="w-full py-4 rounded-xl font-headline font-bold text-error border-2 border-error/10 hover:bg-error/5 active:scale-95 transition-all"
        >
          Sign Out
        </button>

        <p className="text-center text-[10px] text-outline-variant uppercase tracking-[0.2em] pb-4">
          QuickBite v1.0.0
        </p>
      </main>

      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center px-6">
          <div className="bg-surface-container-lowest dark:bg-dark-card rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-xl font-bold text-on-surface dark:text-dark-text">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-primary-container"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={e => setEditAvatarUrl(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-primary-container"
                  placeholder="https://"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 py-3 rounded-xl font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-[2] py-3 rounded-xl font-bold text-white bg-primary-gradient shadow-lg active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6">
          <div className="bg-surface-container-lowest dark:bg-dark-card rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="font-headline text-lg font-bold text-on-surface dark:text-dark-text mb-2">
              Payment Methods
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Payment integration not available in prototype.
            </p>
            <button
              onClick={() => setShowPaymentInfo(false)}
              className="w-full py-3 rounded-xl font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
