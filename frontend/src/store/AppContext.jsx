import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('quickbite-dark-mode') === 'true';
  });

  const [activeOrder, setActiveOrder] = useState(null);

  const [cartByShop, setCartByShop] = useState(() => {
    try {
      const raw = localStorage.getItem('quickbite-cart-v2');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem('quickbite-profile');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      name: 'Alex Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    };
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('quickbite-dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('quickbite-cart-v2', JSON.stringify(cartByShop));
  }, [cartByShop]);

  useEffect(() => {
    localStorage.setItem('quickbite-profile', JSON.stringify(profile));
  }, [profile]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const addToCart = (shopId, item, qty = 1) => {
    setCartByShop(prev => {
      const existing = prev[shopId] || { items: {} };
      const currentEntry = existing.items[item.id] || { item, qty: 0 };
      const nextQty = currentEntry.qty + qty;
      if (nextQty <= 0) {
        const nextItems = { ...existing.items };
        delete nextItems[item.id];
        return {
          ...prev,
          [shopId]: {
            ...existing,
            items: nextItems,
          },
        };
      }
      return {
        ...prev,
        [shopId]: {
          ...existing,
          items: {
            ...existing.items,
            [item.id]: { item, qty: nextQty },
          },
        },
      };
    });
  };

  const setCartItemQty = (shopId, item, qty) => {
    setCartByShop(prev => {
      const existing = prev[shopId] || { items: {} };
      if (qty <= 0) {
        const nextItems = { ...existing.items };
        delete nextItems[item.id];
        return {
          ...prev,
          [shopId]: {
            ...existing,
            items: nextItems,
          },
        };
      }
      return {
        ...prev,
        [shopId]: {
          ...existing,
          items: {
            ...existing.items,
            [item.id]: { item, qty },
          },
        },
      };
    });
  };

  const removeFromCart = (shopId, itemId) => {
    setCartByShop(prev => {
      const existing = prev[shopId];
      if (!existing) return prev;
      const nextItems = { ...existing.items };
      delete nextItems[itemId];
      return {
        ...prev,
        [shopId]: {
          ...existing,
          items: nextItems,
        },
      };
    });
  };

  const clearCart = (shopId) => {
    setCartByShop(prev => {
      const next = { ...prev };
      delete next[shopId];
      return next;
    });
  };

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        activeOrder,
        setActiveOrder,
        cartByShop,
        addToCart,
        clearCart,
        setCartItemQty,
        removeFromCart,
        profile,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
