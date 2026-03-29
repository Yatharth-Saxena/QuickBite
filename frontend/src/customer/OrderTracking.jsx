import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';

// ── Order Tracking Screen ─────────────────────────────────────
// Route: /customer/track/:orderId AND /customer/orders (no active order → placeholder)
// Shows: Countdown timer (MM:SS), 3-step status stepper, polls every 10s
export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { activeOrder, setActiveOrder } = useApp();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [currentStep, setCurrentStep] = useState(0);

  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const isHidden = useRef(false);
  const deadlineRef = useRef(null);

  const resolvedOrderId = orderId || activeOrder?.id;

  // Status → step index mapping
  const statusToStep = {
    'Pending': 0,
    'Preparing': 0,
    'Almost Ready': 1,
    'Ready': 2,
    'Completed': 2,
  };

  const steps = [
    { label: 'Preparing', desc: 'Chef is crafting your order', icon: 'restaurant', completedIcon: 'check' },
    { label: 'Almost Ready', desc: 'Final touches being added', icon: 'local_fire_department', completedIcon: 'check' },
    { label: 'Ready for Pickup', desc: 'Head to the counter!', icon: 'shopping_bag', completedIcon: 'check' },
  ];

  const fetchOrder = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        const step = statusToStep[json.data.status] ?? 0;
        setCurrentStep(step);

        if (json.data.ept && json.data.createdAt) {
          const created = new Date(json.data.createdAt).getTime();
          const deadline = created + json.data.ept * 60000;
          deadlineRef.current = deadline;
          const remainingMs = deadline - Date.now();
          const remainingSeconds = Math.max(0, Math.round(remainingMs / 1000));
          setTimeLeft(remainingSeconds);
        }

        // Stop polling when terminal status reached
        if (json.data.status === 'Ready' || json.data.status === 'Completed') {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setTimeLeft(0);
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  }, []);

  useEffect(() => {
    if (!resolvedOrderId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchOrder(resolvedOrderId).then(() => setLoading(false));

    // Poll every 10 seconds
    pollRef.current = setInterval(() => {
      fetchOrder(resolvedOrderId);
    }, 10000);

    // Page Visibility API — pause timer when tab hidden
    const handleVisibility = () => {
      isHidden.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resolvedOrderId, fetchOrder]);

  // Countdown tick based on deadline
  useEffect(() => {
    if (!order || !order.ept || order.status === 'Ready' || order.status === 'Completed') return;
    if (!deadlineRef.current) return;

    timerRef.current = setInterval(() => {
      if (!isHidden.current) {
        const remainingMs = deadlineRef.current - Date.now();
        const remainingSeconds = Math.max(0, Math.round(remainingMs / 1000));
        setTimeLeft(remainingSeconds);
        if (remainingSeconds <= 0) {
          clearInterval(timerRef.current);
        }
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [order]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // No active order placeholder
  if (!resolvedOrderId && !loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-dark-bg font-body flex flex-col items-center justify-center px-6 pb-32 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-6">receipt_long</span>
        <h2 className="font-headline text-2xl font-extrabold text-on-surface dark:text-dark-text mb-2">No Active Orders</h2>
        <p className="text-on-surface-variant mb-8">Your current order will appear here after you place one.</p>
        <button
          onClick={() => navigate('/customer/home')}
          className="bg-primary-gradient text-white font-bold px-8 py-3 rounded-full active:scale-95 transition-transform"
        >
          Browse Shops
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg font-body text-on-background animate-fade-in">
      {/* ── Top App Bar ──────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto w-full flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">location_on</span>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold tracking-tighter text-xl text-orange-600 dark:text-orange-500">
            QuickBite
          </h1>
        </div>
        <button className="text-orange-600 dark:text-orange-400 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && order && (
          <>
            {/* ── Order Header Card ─────────────────────────── */}
            <section className="mb-8">
              <div className="bg-surface-container-lowest dark:bg-dark-card rounded-3xl p-6 shadow-[0_12px_32px_rgba(44,47,48,0.06)] relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <p className="text-on-surface-variant tracking-wider uppercase text-[10px] mb-1 font-medium">
                      {order.displayId}
                    </p>
                    <h2 className="font-headline font-bold text-2xl tracking-tight text-on-background dark:text-dark-text">
                      Your Order
                    </h2>
                    <p className="text-on-surface-variant text-sm mt-1">{order.itemName}</p>
                  </div>
                  <div className="bg-primary-container/10 px-3 py-1 rounded-full">
                    <span className="text-primary font-bold text-sm">Pickup</span>
                  </div>
                </div>

                {/* ── Countdown Timer — DOMINANT element (72px+) ── */}
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <p className="text-on-surface-variant text-sm mb-1">
                      {order.status === 'Ready' ? 'Order is ready!' : 'Estimated readiness'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span
                        id="countdown-timer"
                        className={`font-headline font-extrabold tracking-tighter ${
                          order.status === 'Ready' ? 'text-green-600' : 'text-primary'
                        }`}
                        style={{ fontSize: '72px', lineHeight: 1 }}
                      >
                        {order.status === 'Ready' ? '✓' : formatTime(timeLeft)}
                      </span>
                      {order.status !== 'Ready' && (
                        <span className="font-bold text-primary-fixed-dim text-lg">min</span>
                      )}
                    </div>
                  </div>
                  {/* Decorative food image */}
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-20 rotate-12 pointer-events-none">
                    <img
                      src={order.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80'}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Status Stepper ────────────────────────────── */}
            <section className="mb-8">
              <div className="bg-surface-container-low dark:bg-dark-surface rounded-3xl p-8">
                <div className="relative">
                  <div className="flex flex-col gap-10">
                    {steps.map((step, idx) => {
                      const isCompleted = idx < currentStep;
                      const isActive = idx === currentStep;
                      const isPending = idx > currentStep;

                      return (
                        <div key={step.label} className="flex items-start gap-6 relative">
                          {/* Progress line */}
                          {idx < steps.length - 1 && (
                            <div className={`absolute left-4 top-8 w-1 h-10 rounded-full ${isCompleted ? 'bg-primary' : 'bg-surface-container-highest'}`} />
                          )}

                          {/* Step icon */}
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? 'bg-primary ring-4 ring-primary-container/20'
                              : isActive
                              ? 'bg-primary-container ring-4 ring-primary-container/40 pulse-indicator'
                              : 'bg-surface-container-highest'
                          }`}>
                            <span
                              className={`material-symbols-outlined text-sm ${
                                isCompleted ? 'text-white' : isActive ? 'text-on-primary-container' : 'text-outline'
                              }`}
                              style={isCompleted ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                              {isCompleted ? 'check' : step.icon}
                            </span>
                          </div>

                          {/* Step text */}
                          <div>
                            <h3 className={`font-headline font-bold text-lg ${
                              isCompleted
                                ? 'text-on-surface dark:text-dark-text'
                                : isActive
                                ? 'text-primary'
                                : 'text-outline-variant'
                            }`}>
                              {step.label}
                            </h3>
                            <p className={`text-sm font-medium ${
                              isActive
                                ? 'text-orange-400 dark:text-orange-300'
                                : isCompleted
                                ? 'text-on-surface-variant dark:text-slate-400'
                                : 'text-outline-variant'
                            }`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Order Summary ─────────────────────────────── */}
            <section className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-lowest dark:bg-dark-card p-5 rounded-2xl premium-shadow">
                <span className="material-symbols-outlined text-tertiary mb-2">local_fire_department</span>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-1">Item</p>
                <p className="font-bold text-on-background dark:text-dark-text truncate">{order.itemName}</p>
                <p className="text-xs text-on-surface-variant mt-1">Qty: {order.qty}</p>
              </div>
              <div className="bg-surface-container-lowest dark:bg-dark-card p-5 rounded-2xl premium-shadow">
                <span className="material-symbols-outlined text-secondary mb-2">payments</span>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-1">Total Paid</p>
                <p className="font-bold text-on-background dark:text-dark-text">₹{order.itemPrice + 5}</p>
                <p className="text-xs text-on-surface-variant mt-1">Incl. ₹5 fee</p>
              </div>
            </section>

            {/* ── Crowd indicator ───────────────────────────── */}
            <div className="bg-secondary-container/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-on-secondary-container pulse-indicator" />
                <span className="text-sm font-semibold text-orange-400 dark:text-orange-300 font-label">
                  {order.status === 'Ready' ? '🎉 Your order is ready at the counter!' : '👨‍🍳 Kitchen is preparing your order'}
                </span>
              </div>
              {order.status === 'Ready' && (
                <button
                  onClick={() => {
                    setActiveOrder(null);
                    navigate('/customer/home');
                  }}
                  className="text-primary text-xs font-bold uppercase tracking-tighter hover:underline"
                >
                  Order Again
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
