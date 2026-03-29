import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { getFoodImage } from '../foodImageMap.js';

// ── Menu Screen ───────────────────────────────────────────────
// Route: /customer/menu/:shopId
// NOT part of bottom nav — full-screen flow from Dashboard
export default function Menu() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartEpt, setCartEpt] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const { cartByShop, addToCart, setCartItemQty, removeFromCart } = useApp();

  const cartForShop = cartByShop[shopId] || { items: {} };

  const cartSummary = useMemo(() => {
    const entries = Object.values(cartForShop.items);
    if (!entries.length) return { count: 0, totalPrice: 0 };
    let count = 0;
    let totalPrice = 0;
    entries.forEach(entry => {
      const qty = entry.qty || 0;
      count += qty;
      totalPrice += (entry.item.price || 0) * qty;
    });
    return { count, totalPrice };
  }, [cartForShop]);

  useEffect(() => {
    const load = async () => {
      try {
        const [shopRes, menuRes] = await Promise.all([
          fetch(`/api/shops/${shopId}`),
          fetch(`/api/shops/${shopId}/menu`),
        ]);
        const shopJson = await shopRes.json();
        const menuJson = await menuRes.json();
        if (shopJson.success) setShop(shopJson.data);
        if (menuJson.success) setMenuItems(menuJson.data);
      } catch (e) {
        console.error('Failed to load menu:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shopId]);

  useEffect(() => {
    const entries = Object.values(cartForShop.items);
    if (!entries.length || !shop) {
      setCartEpt(null);
      return;
    }
    const payloadItems = entries.map(entry => ({
      menuItemId: entry.item.id,
      qty: entry.qty,
    }));
    const compute = async () => {
      try {
        setCartLoading(true);
        const res = await fetch('/api/ept-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopId, items: payloadItems }),
        });
        const json = await res.json();
        if (json.success) {
          setCartEpt(json.data.ept);
        }
      } catch (e) {
        console.error('Failed to calculate cart EPT:', e);
      } finally {
        setCartLoading(false);
      }
    };
    compute();
  }, [cartForShop, shop, shopId]);

  const featuredItem = menuItems.find(m => m.isFeatured);
  const regularItems = menuItems.filter(m => !m.isFeatured);

  const handleAdd = (item) => {
    addToCart(shopId, item, 1);
  };

  const handleIncrement = (item, currentQty) => {
    setCartItemQty(shopId, item, currentQty + 1);
  };

  const handleDecrement = (item, currentQty) => {
    if (currentQty <= 1) {
      removeFromCart(shopId, item.id);
    } else {
      setCartItemQty(shopId, item, currentQty - 1);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg font-body text-on-background animate-fade-in">
      {/* ── Top App Bar with Back ─────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto w-full flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm z-50">
        <div className="flex items-center gap-3">
          <button
            id="menu-back-btn"
            onClick={() => navigate('/customer/home')}
            className="hover:opacity-80 transition-opacity active:scale-95 duration-150 text-orange-600 dark:text-orange-400"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-lg text-orange-600 dark:text-orange-500">
            {shop?.name || 'Menu'}
          </h1>
        </div>
        <span className="material-symbols-outlined text-slate-400">search</span>
      </header>

      <main className="pt-24 pb-10 px-6 max-w-4xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && shop && (
          <>
            {/* ── Vendor Hero Section ───────────────────────── */}
            <section className="relative mb-12 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <span className="bg-tertiary/10 text-tertiary font-label text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">
                  {shop.tags[0] || 'Local Favorite'}
                </span>
                <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface dark:text-dark-text mb-3">
                  {shop.name}
                </h1>
                <p className="font-body text-on-surface-variant text-base leading-relaxed">
                  {shop.tags.join(' · ')} — Pickup ready in as little as {shop.ept} mins
                </p>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-on-surface">{shop.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
                    <span className="text-on-surface-variant font-medium">{shop.ept} min EPT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">people</span>
                    <span className="text-on-surface-variant font-medium">{shop.crowdLevel} Crowd</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden relative shadow-2xl md:rotate-3 hover:rotate-0 transition-transform duration-500">
                <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </section>

            {/* ── Featured Item Block ───────────────────────── */}
            {featuredItem && (
              <div className="mb-8">
                <div className="bg-surface-container-lowest dark:bg-dark-card rounded-xl p-6 shadow-[0px_12px_32px_rgba(44,47,48,0.06)] relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <span className="bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 inline-block">
                        Featured Today
                      </span>
                      <h2 className="font-headline text-2xl font-bold text-on-surface dark:text-dark-text mb-2">
                        {featuredItem.name}
                      </h2>
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-2xl font-bold text-primary">₹{featuredItem.price}</span>
                        <span className="font-label text-xs font-medium text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                          Prepped in {featuredItem.prepTime}m
                        </span>
                      </div>
                    </div>
                    <button
                      id={`order-featured-${featuredItem.id}`}
                      onClick={() => handleAdd(featuredItem)}
                      className="w-fit bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-8 py-3 rounded-full active:scale-95 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      Add to Cart
                      <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    </button>
                  </div>
                  {featuredItem.imageUrl && (
                    <img
                      src={getFoodImage(featuredItem.name, featuredItem.imageUrl)}
                      alt={featuredItem.name}
                      className="absolute -right-12 -bottom-12 w-48 h-48 object-cover rounded-full group-hover:scale-110 transition-transform duration-700 opacity-80"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── Menu Section Divider ──────────────────────── */}
            <h4 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-6 border-b border-outline-variant/10 pb-4">
              Menu
            </h4>

            {/* ── Regular Menu Items ────────────────────────── */}
            <div className="space-y-0">
              {regularItems.map((item, idx) => {
                const entry = cartForShop.items[item.id];
                const qty = entry?.qty || 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between group py-4 ${idx < regularItems.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getFoodImage(item.name, item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-headline text-base font-bold text-on-surface dark:text-dark-text group-hover:text-primary transition-colors truncate">
                          {item.name}
                        </h5>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-on-surface-variant text-sm font-medium">₹{item.price}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant" />
                          <span className="text-on-surface-variant text-[11px] font-medium uppercase tracking-wider">
                            {item.prepTime}m prep
                          </span>
                        </div>
                      </div>
                    </div>
                    {qty > 0 ? (
                      <div className="ml-4 flex items-center bg-primary/10 rounded-full px-2 py-1 gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleDecrement(item, qty)}
                          className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold active:scale-95 transition-transform"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-on-surface dark:text-dark-text">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleIncrement(item, qty)}
                          className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-bold active:scale-95 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`order-btn-${item.id}`}
                        onClick={() => handleAdd(item)}
                        className="ml-4 bg-surface-container-high dark:bg-slate-700 hover:bg-primary hover:text-white dark:hover:text-white text-on-surface px-5 py-2 rounded-full font-bold text-sm transition-all active:scale-95 flex-shrink-0"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {cartSummary.count > 0 && (
              <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4">
                <button
                  onClick={() => navigate(`/customer/confirm/${shopId}/cart`)}
                  className="w-full bg-primary-gradient text-white flex items-center justify-between px-5 py-4 rounded-full shadow-[0_10px_30px_rgba(178,34,0,0.35)] active:scale-95 transition-transform"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-headline font-bold">
                      {cartSummary.count} item{cartSummary.count > 1 ? 's' : ''} in cart
                    </span>
                    <span className="text-[11px] opacity-90">
                      ₹{cartSummary.totalPrice} · {cartLoading || cartEpt == null ? 'Calculating EPT...' : `Est. ${cartEpt} min pickup`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <span>View Cart</span>
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
