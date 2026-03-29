const db = require('./db');

/**
 * Calculate EPT for a given shop + menu item.
 *
 * @param {string} shopId
 * @param {string} menuItemId
 * @returns {{ ept: number, crowdLevel: 'Low'|'Medium'|'High' }}
 */
function calculateEPT(shopId, menuItemId) {
  const shop = db.getShopById(shopId);
  if (!shop) return { ept: 0, crowdLevel: 'Low' };

  const menuItem = db.getMenuItemById(menuItemId);
  if (!menuItem) return { ept: 0, crowdLevel: 'Low' };

  const allShopOrders = db.getOrdersByShopId(shopId);

  // ── 1. Pending prep time ──────────────────────────────────
  // Sum of prep times of all orders currently in 'Preparing' state
  const preparingOrders = allShopOrders.filter(o => o.status === 'Preparing');
  const pendingPrepTime = preparingOrders.reduce((sum, order) => {
    const item = db.getMenuItemById(order.menuItemId);
    return sum + (item ? item.prepTime * order.qty : 0);
  }, 0);

  // ── 2. Offline load minutes ───────────────────────────────
  // Sum of all active (non-expired) offline load records
  const activeLoads = db.getActiveOfflineLoads(shopId);
  const offlineLoadMinutes = activeLoads.reduce((sum, load) => sum + load.minutes, 0);

  // ── 3. Cook count ─────────────────────────────────────────
  const cookCount = Math.max(shop.cookCount, 1); // never divide by zero

  // ── 4. New item prep time ─────────────────────────────────
  const newOrderPrepTime = menuItem.prepTime;

  // ── 5. Calculate EPT ─────────────────────────────────────
  let rawEpt;

  if (preparingOrders.length === 0 && offlineLoadMinutes === 0) {
    // EDGE CASE: No pending orders and no offline load
    // Show minimum prep time among all items in this shop (NOT 0)
    const shopMenu = db.getMenuByShopId(shopId);
    const minPrepTime = shopMenu.reduce((min, item) => Math.min(min, item.prepTime), Infinity);
    rawEpt = minPrepTime === Infinity ? newOrderPrepTime : minPrepTime;

    // Still add the new item's prep time (but don't double-count if it's the min)
    // EPT = just newOrderPrepTime when queue is empty
    rawEpt = newOrderPrepTime;
  } else {
    rawEpt = ((pendingPrepTime + offlineLoadMinutes) / cookCount) + newOrderPrepTime;
  }

  // ── 6. Round to nearest integer ───────────────────────────
  let ept = Math.round(rawEpt);

  // ── 7. Enforce minimum (never below item's own prep time) ─
  ept = Math.max(ept, newOrderPrepTime);

  // ── 8. Cap at 90 minutes ─────────────────────────────────
  const eptDisplay = ept > 90 ? '90+' : ept;

  // ── 9. Crowd level from queue depth ──────────────────────
  const queueDepth = allShopOrders.filter(
    o => o.status === 'Pending' || o.status === 'Preparing'
  ).length;

  let crowdLevel;
  if (queueDepth < 5) crowdLevel = 'Low';
  else if (queueDepth <= 15) crowdLevel = 'Medium';
  else crowdLevel = 'High';

  return { ept, eptDisplay, crowdLevel };
}

/**
 * Calculate shop-level EPT for dashboard card display.
 * Uses the item with the minimum prep time (best case scenario for display).
 *
 * @param {string} shopId
 * @returns {{ ept: number, crowdLevel: string }}
 */
function calculateShopEPT(shopId) {
  const shop = db.getShopById(shopId);
  if (!shop) return { ept: 0, crowdLevel: 'Low' };

  const shopMenu = db.getMenuByShopId(shopId);
  if (!shopMenu.length) return { ept: 0, crowdLevel: 'Low' };

  // Use the fastest item for shop-level display
  const fastestItem = shopMenu.reduce((fastest, item) =>
    item.prepTime < fastest.prepTime ? item : fastest
  );

  const allShopOrders = db.getOrdersByShopId(shopId);
  const preparingOrders = allShopOrders.filter(o => o.status === 'Preparing');
  const pendingPrepTime = preparingOrders.reduce((sum, order) => {
    const item = db.getMenuItemById(order.menuItemId);
    return sum + (item ? item.prepTime * order.qty : 0);
  }, 0);

  const activeLoads = db.getActiveOfflineLoads(shopId);
  const offlineLoadMinutes = activeLoads.reduce((sum, load) => sum + load.minutes, 0);
  const cookCount = Math.max(shop.cookCount, 1);

  let rawEpt;
  if (preparingOrders.length === 0 && offlineLoadMinutes === 0) {
    // Edge case: queue is empty → show min prep time
    const minPrepTime = shopMenu.reduce((min, item) => Math.min(min, item.prepTime), Infinity);
    rawEpt = minPrepTime === Infinity ? fastestItem.prepTime : minPrepTime;
  } else {
    rawEpt = ((pendingPrepTime + offlineLoadMinutes) / cookCount) + fastestItem.prepTime;
  }

  let ept = Math.round(rawEpt);
  ept = Math.max(ept, fastestItem.prepTime);
  if (ept > 90) ept = 90;

  const queueDepth = allShopOrders.filter(
    o => o.status === 'Pending' || o.status === 'Preparing'
  ).length;

  let crowdLevel;
  if (queueDepth < 5) crowdLevel = 'Low';
  else if (queueDepth <= 15) crowdLevel = 'Medium';
  else crowdLevel = 'High';

  return { ept, crowdLevel };
}

function calculateCartEPT(shopId, cartItems) {
  const shop = db.getShopById(shopId);
  if (!shop || !Array.isArray(cartItems) || cartItems.length === 0) {
    return { ept: 0, eptDisplay: 0, crowdLevel: 'Low', totalPrepTime: 0 };
  }

  const allShopOrders = db.getOrdersByShopId(shopId);

  const preparingOrders = allShopOrders.filter(o => o.status === 'Preparing');
  const pendingPrepTime = preparingOrders.reduce((sum, order) => {
    const item = db.getMenuItemById(order.menuItemId);
    return sum + (item ? item.prepTime * order.qty : 0);
  }, 0);

  const activeLoads = db.getActiveOfflineLoads(shopId);
  const offlineLoadMinutes = activeLoads.reduce((sum, load) => sum + load.minutes, 0);

  const cookCount = Math.max(shop.cookCount, 1);

  let totalPrepTime = 0;
  cartItems.forEach(entry => {
    const item = db.getMenuItemById(entry.menuItemId);
    if (item) {
      const qty = entry.qty && entry.qty > 0 ? entry.qty : 1;
      totalPrepTime += item.prepTime * qty;
    }
  });

  if (totalPrepTime <= 0) {
    return { ept: 0, eptDisplay: 0, crowdLevel: 'Low', totalPrepTime: 0 };
  }

  let rawEpt;
  if (preparingOrders.length === 0 && offlineLoadMinutes === 0) {
    rawEpt = totalPrepTime;
  } else {
    rawEpt = ((pendingPrepTime + offlineLoadMinutes) / cookCount) + totalPrepTime;
  }

  let ept = Math.round(rawEpt);
  if (ept < totalPrepTime) ept = totalPrepTime;
  if (ept > 90) ept = 90;

  const queueDepth = allShopOrders.filter(
    o => o.status === 'Pending' || o.status === 'Preparing'
  ).length;

  let crowdLevel;
  if (queueDepth < 5) crowdLevel = 'Low';
  else if (queueDepth <= 15) crowdLevel = 'Medium';
  else crowdLevel = 'High';

  return { ept, eptDisplay: ept, crowdLevel, totalPrepTime };
}

module.exports = { calculateEPT, calculateShopEPT, calculateCartEPT };
