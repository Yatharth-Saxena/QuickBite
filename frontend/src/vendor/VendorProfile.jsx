import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';

// ── Vendor Profile Screen ─────────────────────────────────────
// Route: /vendor/:shopId/profile
// IMPORTANT: This is the ONLY screen with the dark mode toggle
// Toggle affects the WHOLE APP color scheme
export default function VendorProfile() {
  const { shopId } = useParams();
  const { darkMode, toggleDarkMode } = useApp();
  const [shop, setShop] = useState(null);

  useEffect(() => {
    fetch(`/api/shops/${shopId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setShop(j.data); })
      .catch(console.error);
  }, [shopId]);

  const accountSettings = [
    { label: 'Edit Profile', icon: 'manage_accounts' },
    { label: 'Payment Info', icon: 'payments' },
    { label: 'Payout Schedule', icon: 'calendar_today' },
  ];

  const appSettings = [
    { label: 'Operating Hours', icon: 'schedule', sub: 'Mon - Fri, 08:00 - 20:00' },
    { label: 'Help Center', icon: 'help' },
    { label: 'Contact Support', icon: 'mail' },
  ];

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg font-body text-on-surface">
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto w-full z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">restaurant_menu</span>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-xl text-orange-600 dark:text-orange-400">
              QuickBite Vendor
            </h1>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-200/50 transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-slate-500">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-20 pb-32 px-6 max-w-md mx-auto space-y-8">
        {/* ── Profile Header ─────────────────────────────────── */}
        <section className="relative mt-4">
          <div className="bg-surface-container-lowest dark:bg-dark-card rounded-xl p-6 flex items-center gap-5 premium-shadow">
            <div className="relative w-20 h-20">
              <img
                src="https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=200&q=80"
                alt="Vendor"
                className="w-full h-full object-cover rounded-full ring-4 ring-primary-container/20"
              />
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 border-2 border-white">
                <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-headline font-bold text-xl tracking-tight leading-tight text-on-surface dark:text-dark-text">
                {shop?.name || 'Your Shop'}
              </h2>
              <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">person</span>
                Manager · {shop?.cookCount || 1} Cook{(shop?.cookCount || 1) > 1 ? 's' : ''}
              </p>
              <div className="inline-flex items-center mt-3 px-2.5 py-1 bg-on-secondary-container text-on-secondary rounded-full text-[11px] font-bold uppercase tracking-wider">
                QuickBite Vendor
              </div>
            </div>
          </div>
        </section>

        {/* ── Account Settings ─────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant px-1">Account Settings</h3>
          <div className="bg-surface-container-lowest dark:bg-dark-card rounded-xl overflow-hidden premium-shadow">
            {accountSettings.map((s, i) => (
              <div
                key={s.label}
                className={`p-4 flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group cursor-pointer ${i < accountSettings.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">{s.icon}</span>
                  </div>
                  <span className="font-medium text-on-surface dark:text-dark-text">{s.label}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── App Settings (with Dark Mode toggle) ─────────── */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant px-1">App Settings</h3>
          <div className="bg-surface-container-lowest dark:bg-dark-card rounded-xl overflow-hidden premium-shadow">

            {/* ── DARK MODE TOGGLE — KEY FEATURE ─────────────── */}
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
                  id="dark-mode-toggle"
                  type="checkbox"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* Kitchen Alerts */}
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">campaign</span>
                </div>
                <div>
                  <span className="font-medium text-on-surface dark:text-dark-text">Kitchen Alerts</span>
                  <span className="text-xs text-on-surface-variant block">Push notifications for orders</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* Other settings */}
            {appSettings.map((s, i) => (
              <div
                key={s.label}
                className={`p-4 flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group cursor-pointer ${i < appSettings.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">{s.icon}</span>
                  </div>
                  <div>
                    <span className="font-medium text-on-surface dark:text-dark-text">{s.label}</span>
                    {s.sub && <span className="text-xs text-on-surface-variant block">{s.sub}</span>}
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Logout / Shop Stats ───────────────────────────── */}
        {shop && (
          <div className="bg-surface-container-low dark:bg-dark-surface rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Shop Rating</p>
              <p className="font-headline font-bold text-2xl text-on-surface dark:text-dark-text mt-1">★ {shop.rating}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Cooks Active</p>
              <p className="font-headline font-bold text-2xl text-on-surface dark:text-dark-text mt-1">{shop.cookCount}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Status</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-green-600">Open</span>
              </div>
            </div>
          </div>
        )}

        <button
          id="vendor-logout-btn"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-headline font-bold text-error border border-error-container/20 hover:bg-error/5 transition-colors active:scale-95 duration-150"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>

        <div className="text-center pb-8">
          <p className="text-[10px] text-outline-variant uppercase tracking-[0.2em] font-medium">
            QuickBite v1.0.0
          </p>
        </div>
      </main>
    </div>
  );
}
