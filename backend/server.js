// ============================================================
// QuickBite — Express REST API Server
// ============================================================

const express = require('express');
const cors = require('cors');
const db = require('./db');
const { calculateEPT, calculateShopEPT, calculateCartEPT } = require('./ept');

const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Standard response wrapper
const ok = (data) => ({ success: true, data });
const err = (msg, status = 400) => ({ success: false, error: msg, status });

// ─────────────────────────────────────────────────────────────
// SHOP ENDPOINTS
// ─────────────────────────────────────────────────────────────

// GET /api/shops — List all shops with computed EPT + crowdLevel
app.get('/api/shops', (req, res) => {
  const shops = db.getAllShops();
  const enriched = shops.map(shop => {
    const { ept, crowdLevel } = calculateShopEPT(shop.id);
    return { ...shop, ept, crowdLevel };
  });
  res.json(ok(enriched));
});

// GET /api/shops/:id — Single shop detail
app.get('/api/shops/:id', (req, res) => {
  const shop = db.getShopById(req.params.id);
  if (!shop) return res.status(404).json(err('Shop not found', 404));
  const { ept, crowdLevel } = calculateShopEPT(shop.id);
  res.json(ok({ ...shop, ept, crowdLevel }));
});

// GET /api/shops/:id/menu — Menu items for a shop
app.get('/api/shops/:id/menu', (req, res) => {
  const shop = db.getShopById(req.params.id);
  if (!shop) return res.status(404).json(err('Shop not found', 404));
  const menu = db.getMenuByShopId(req.params.id);
  res.json(ok(menu));
});

// ─────────────────────────────────────────────────────────────
// ORDER ENDPOINTS
// ─────────────────────────────────────────────────────────────

// POST /api/orders — Create a new order
app.post('/api/orders', (req, res) => {
  const { shopId, menuItemId, qty = 1, items } = req.body;
  if (!shopId) {
    return res.status(400).json(err('shopId is required'));
  }

  let eptResult;
  let orderData;

  if (Array.isArray(items) && items.length > 0) {
    eptResult = calculateCartEPT(shopId, items);
    orderData = { shopId, items, ept: eptResult.ept };
  } else {
    if (!menuItemId) {
      return res.status(400).json(err('menuItemId is required when items array is not provided'));
    }
    eptResult = calculateEPT(shopId, menuItemId);
    orderData = { shopId, menuItemId, qty, ept: eptResult.ept };
  }

  const order = db.createOrder(orderData);
  if (!order) return res.status(400).json(err('Failed to create order'));

  res.status(201).json(ok({ ...order, crowdLevel: eptResult.crowdLevel }));
});

// GET /api/orders/:id — Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json(err('Order not found', 404));
  res.json(ok(order));
});

// PATCH /api/orders/:id/status — Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Preparing', 'Almost Ready', 'Ready', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json(err('Invalid status'));
  }
  const order = db.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json(err('Order not found', 404));
  res.json(ok(order));
});

// GET /api/orders?shopId=X — Get orders for a vendor's shop
app.get('/api/orders', (req, res) => {
  const { shopId } = req.query;
  if (shopId) {
    const orders = db.getOrdersByShopId(shopId);
    res.json(ok(orders));
  } else {
    const orders = db.getAllOrders();
    res.json(ok(orders));
  }
});

// ─────────────────────────────────────────────────────────────
// MENU MANAGEMENT ENDPOINTS
// ─────────────────────────────────────────────────────────────

// POST /api/menu — Add a new menu item
app.post('/api/menu', (req, res) => {
  const { shopId, name, price, prepTime, imageUrl, isFeatured, isAvailable } = req.body;
  if (!shopId || !name || price === undefined || prepTime === undefined) {
    return res.status(400).json(err('shopId, name, price, prepTime are required'));
  }
  if (name.length < 2 || name.length > 60) {
    return res.status(400).json(err('name must be 2-60 characters'));
  }
  if (price <= 0) return res.status(400).json(err('price must be > 0'));
  if (prepTime < 1 || prepTime > 120) {
    return res.status(400).json(err('prepTime must be 1-120 minutes'));
  }

  const item = db.addMenuItem({ shopId, name, price, prepTime, imageUrl, isFeatured, isAvailable });
  res.status(201).json(ok(item));
});

// PUT /api/menu/:id — Update a menu item
app.put('/api/menu/:id', (req, res) => {
  const updates = req.body;
  const item = db.updateMenuItem(req.params.id, updates);
  if (!item) return res.status(404).json(err('Menu item not found', 404));
  res.json(ok(item));
});

// DELETE /api/menu/:id — Remove a menu item
app.delete('/api/menu/:id', (req, res) => {
  const deleted = db.deleteMenuItem(req.params.id);
  if (!deleted) return res.status(404).json(err('Menu item not found', 404));
  res.json(ok({ deleted: true }));
});

// ─────────────────────────────────────────────────────────────
// OFFLINE LOAD ENDPOINTS
// ─────────────────────────────────────────────────────────────

// POST /api/offline-load — Add an offline load entry
app.post('/api/offline-load', (req, res) => {
  const { shopId, minutes, items, avgPrepTime } = req.body;
  if (!shopId) return res.status(400).json(err('shopId is required'));

  let resolvedMinutes = 0;

  // If direct minutes provided, use as-is
  if (minutes !== undefined && minutes > 0) {
    resolvedMinutes = parseInt(minutes);
  }
  // If items count provided, convert: items × avgPrepTime (default avg=8)
  else if (items !== undefined && items > 0) {
    const avg = avgPrepTime || 8;
    resolvedMinutes = parseInt(items) * avg;
  } else {
    return res.status(400).json(err('Provide minutes or items count'));
  }

  const load = db.addOfflineLoad({ shopId, minutes: resolvedMinutes });
  res.status(201).json(ok(load));
});

// GET /api/offline-load/:shopId — Get active offline loads for a shop
app.get('/api/offline-load/:shopId', (req, res) => {
  const loads = db.getActiveOfflineLoads(req.params.shopId);
  res.json(ok(loads));
});

// ─────────────────────────────────────────────────────────────
// EPT CALCULATION ENDPOINTS
// ─────────────────────────────────────────────────────────────

// GET /api/ept?shopId=X&menuItemId=Y — Compute EPT server-side
app.get('/api/ept', (req, res) => {
  const { shopId, menuItemId } = req.query;
  if (!shopId || !menuItemId) {
    return res.status(400).json(err('shopId and menuItemId are required'));
  }
  const result = calculateEPT(shopId, menuItemId);
  res.json(ok(result));
});

// POST /api/ept-cart — Compute EPT for a cart of items
app.post('/api/ept-cart', (req, res) => {
  const { shopId, items } = req.body;
  if (!shopId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json(err('shopId and items are required'));
  }
  const result = calculateCartEPT(shopId, items);
  res.json(ok(result));
});

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json(ok({ status: 'QuickBite API running', timestamp: new Date().toISOString() }));
});

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍔 QuickBite API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Shops:  http://localhost:${PORT}/api/shops\n`);
});

module.exports = app;
