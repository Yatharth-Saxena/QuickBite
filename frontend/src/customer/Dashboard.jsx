import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Customer Dashboard Screen ─────────────────────────────────
// Route: /customer/home
// Shows: Hero editorial header, filter chips, featured shop card,
//        shop list with EPT + crowd level badges
export default function Dashboard() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Vendors');
  const navigate = useNavigate();

  const filters = ['All Vendors', 'Fastest', 'Top Rated', 'Healthy'];

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/shops');
      const json = await res.json();
      if (json.success) setShops(json.data);
    } catch (e) {
      console.error('Failed to fetch shops:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    // Poll shops every 30s for EPT updates
    const interval = setInterval(fetchShops, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredShops = shops.filter(shop => {
    if (activeFilter === 'All Vendors') return true;
    if (activeFilter === 'Fastest') return shop.ept <= 10;
    if (activeFilter === 'Top Rated') return shop.rating >= 4.5;
    if (activeFilter === 'Healthy') return shop.tags.some(t => ['Healthy', 'Veg', 'Vegan', 'Salads'].includes(t));
    return true;
  });

  // Featured shop: lowest EPT (Best Choice)
  const featuredShop = shops.length > 0
    ? [...shops].sort((a, b) => a.ept - b.ept)[0]
    : null;

  const listShops = filteredShops.filter(s => s.id !== featuredShop?.id);

  const crowdColor = {
    Low: 'bg-green-50 text-green-700 border-green-100',
    Medium: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    High: 'bg-red-50 text-red-700 border-red-100',
  };
  const crowdDot = {
    Low: 'bg-green-500',
    Medium: 'bg-yellow-500',
    High: 'bg-red-500',
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg font-body text-on-background animate-fade-in">
      {/* ── Top App Bar ──────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto w-full flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm z-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">location_on</span>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold tracking-tighter text-xl text-orange-600 dark:text-orange-500">
            QuickBite
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="active:scale-95 transition-transform duration-150 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* ── Hero Editorial Section ────────────────────────── */}
        <section className="mb-10">
          <p className="font-label text-[11px] uppercase tracking-[0.1em] text-on-surface-variant mb-2">
            The Digital Maitre D'
          </p>
          <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight leading-none mb-6">
            Curated <span className="text-primary italic">Selection</span>
          </h2>
          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {filters.map(f => (
              <button
                key={f}
                id={`filter-${f.toLowerCase().replace(' ', '-')}`}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm transition-transform active:scale-95 whitespace-nowrap ${
                  activeFilter === f
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface dark:bg-slate-800 dark:text-slate-200 hover:bg-surface-container'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Featured / Best Choice Card ───────────────────── */}
        {!loading && featuredShop && activeFilter === 'All Vendors' && (
          <section className="mb-10" onClick={() => navigate(`/customer/menu/${featuredShop.id}`)}>
            <div className="relative group cursor-pointer active:scale-[0.98] transition-all duration-300">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000" />
              <div className="relative bg-surface-container-lowest dark:bg-dark-card rounded-[1.75rem] overflow-hidden premium-shadow">
                <div className="h-56 w-full relative overflow-hidden">
                  <img
                    src={featuredShop.imageUrl}
                    alt={featuredShop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                    <span className="font-headline font-bold text-primary text-xs tracking-wider uppercase">
                      Best Choice
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-headline text-2xl font-bold text-on-surface dark:text-dark-text tracking-tight">
                        {featuredShop.name}
                      </h3>
                      <p className="text-on-surface-variant text-sm">
                        ★ {featuredShop.rating} · {featuredShop.tags.join(' · ')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${crowdColor[featuredShop.crowdLevel]}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${crowdDot[featuredShop.crowdLevel]}`} />
                        {featuredShop.crowdLevel} Crowd
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium">
                        Wait: <span className="text-on-surface font-bold">{featuredShop.ept} mins</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Shop List ─────────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4">
            {listShops.map(shop => (
              <div
                key={shop.id}
                id={`shop-card-${shop.id}`}
                onClick={() => navigate(`/customer/menu/${shop.id}`)}
                className="bg-surface-container-lowest dark:bg-dark-card p-5 rounded-xl flex items-center gap-5 transition-all duration-200 hover:shadow-md active:scale-[0.98] group cursor-pointer premium-shadow"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={shop.imageUrl}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-headline font-bold text-on-surface dark:text-dark-text truncate">{shop.name}</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">★ {shop.rating}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
                    <span className="text-xs text-on-surface-variant font-medium">{shop.ept} mins wait</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">{shop.tags.join(' · ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${crowdColor[shop.crowdLevel]}`}>
                    {shop.crowdLevel}
                  </div>
                </div>
              </div>
            ))}

            {filteredShops.length === 0 && !loading && (
              <div className="text-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 block">storefront</span>
                <p className="font-headline font-bold text-lg">No shops match this filter</p>
                <p className="text-sm mt-1">Try selecting a different category</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
