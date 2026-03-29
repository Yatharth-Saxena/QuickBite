import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// ── Vendor Orders / Performance Screen ───────────────────────
// Route: /vendor/:shopId/orders
// Shows: Stats, completed orders list
export default function VendorOrders() {
  const { shopId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Today');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/orders?shopId=${shopId}`);
        const json = await res.json();
        if (json.success) setOrders(json.data);
      } catch (e) {
        console.error('Failed to load orders:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shopId]);

  const completedOrders = orders
    .filter(o => o.status === 'Completed')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const revenue = completedOrders.reduce((sum, o) => sum + o.itemPrice, 0);
  const avgPrepTime = completedOrders.length > 0
    ? Math.round(completedOrders.reduce((sum, o) => sum + o.ept, 0) / completedOrders.length)
    : 0;

  const formatTime = (iso) => {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg font-body text-on-surface">
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm h-16 flex items-center justify-between px-6 max-w-md mx-auto left-0 right-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-orange-600">restaurant_menu</span>
          <h1 className="text-xl font-extrabold text-orange-600 tracking-tight font-headline">QuickBite Vendor</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 active:scale-95 duration-200">
          <span className="material-symbols-outlined text-slate-500">notifications</span>
        </button>
      </header>

      <main className="pt-20 pb-28 px-6 max-w-md mx-auto min-h-screen">
        {/* ── Performance Stats ─────────────────────────────── */}
        <section className="mb-8 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline font-bold text-lg tracking-tight text-on-surface dark:text-dark-text">
              Today's Performance
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-outline bg-surface-container-high px-2 py-1 rounded-full">
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Revenue — large card */}
            <div className="col-span-2 bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-on-primary/80 font-label text-[10px] uppercase tracking-widest mb-1">Total Revenue</p>
                <h3 className="text-3xl font-extrabold text-on-primary tracking-tighter">₹{revenue.toLocaleString()}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm bg-white/20 p-1 rounded-full text-on-primary">trending_up</span>
                  <span className="text-xs text-on-primary font-medium">{completedOrders.length} orders completed</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 scale-150 rotate-12">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
            </div>
            {/* Orders count */}
            <div className="bg-surface-container-lowest dark:bg-dark-card p-5 rounded-xl border border-outline-variant/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-tertiary text-xl">list_alt</span>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Orders</p>
              </div>
              <h4 className="text-2xl font-bold text-on-surface dark:text-dark-text tracking-tight">{completedOrders.length}</h4>
            </div>
            {/* Avg prep time */}
            <div className="bg-surface-container-lowest dark:bg-dark-card p-5 rounded-xl border border-outline-variant/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-orange-500 text-xl">timer</span>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Avg Prep</p>
              </div>
              <h4 className="text-2xl font-bold text-on-surface dark:text-dark-text tracking-tight">{avgPrepTime}m</h4>
            </div>
          </div>
        </section>

        {/* ── Filter Tabs ───────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          {['Today', 'This Week', 'All Time'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Orders List ───────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline font-bold text-lg tracking-tight text-on-surface dark:text-dark-text">
              Completed Orders
            </h2>
            <span className="text-primary font-bold text-xs">{completedOrders.length} total</span>
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && completedOrders.length === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl block mb-3">receipt_long</span>
              <p className="font-medium">No completed orders yet</p>
              <p className="text-sm mt-1">Completed orders will appear here</p>
            </div>
          )}

          <div className="space-y-4">
            {completedOrders.map(order => (
              <div
                key={order.id}
                className="bg-surface-container-lowest dark:bg-dark-card p-4 rounded-xl premium-shadow border border-outline-variant/10 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant mb-1 block">{order.displayId}</span>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <span className="text-sm font-semibold text-on-surface dark:text-dark-text">{order.qty}x {order.itemName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-on-surface dark:text-dark-text">₹{order.itemPrice}</p>
                    <p className="text-[10px] text-outline font-medium">{formatTime(order.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-surface-container-low rounded-md text-[10px] font-medium text-on-surface-variant">
                    Pickup
                  </span>
                  <span className="px-2 py-0.5 bg-tertiary/10 rounded-md text-[10px] font-medium text-tertiary">
                    EPT: {order.ept}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
