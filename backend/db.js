// ============================================================
// QuickBite — Centralized In-Memory Data Store
// ============================================================
// This is the SINGLE SOURCE OF TRUTH for all app data.
// Replace this with a real database by swapping the CRUD helpers below.

const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────

const shops = [
  {
    id: 'kitchen-kukkries',
    name: 'Kitchen Kukkries',
    rating: 4.5,
    tags: ['Momos', 'Chinese', 'Popular'],
    cookCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    isOpen: true,
  },
  {
    id: 'kunj-burger-point',
    name: 'Kunj Burger Point',
    rating: 4.3,
    tags: ['Burgers', 'Fast Food', 'Shakes'],
    cookCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    isOpen: true,
  },
  {
    id: 'doctor-dosa',
    name: 'Doctor Dosa',
    rating: 4.6,
    tags: ['South Indian', 'Dosa', 'Healthy'],
    cookCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1630851840628-8c82a7ad3e20?w=800&q=80',
    isOpen: true,
  },
  {
    id: 'millennials-cafe',
    name: 'Millennials Cafe',
    rating: 4.4,
    tags: ['Cafe', 'Sandwiches', 'Pizza'],
    cookCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    isOpen: true,
  },
  {
    id: 'momo-shakes-corner',
    name: 'Momo & Shakes Corner',
    rating: 4.2,
    tags: ['Momos', 'Shakes', 'Quick'],
    cookCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
    isOpen: true,
  },
];

const menuItems = [
  // ── Kitchen Kukkries (kitchen-kukkries) ─────────────────────
  { id: 'mi001', shopId: 'kitchen-kukkries', name: 'Veg Momos', price: 40, prepTime: 10, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&q=80', isFeatured: true, isAvailable: true },
  { id: 'mi002', shopId: 'kitchen-kukkries', name: 'Paneer Momos', price: 50, prepTime: 12, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi003', shopId: 'kitchen-kukkries', name: 'Veg Fried Rice', price: 60, prepTime: 15, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi004', shopId: 'kitchen-kukkries', name: 'Paneer Fried Rice', price: 80, prepTime: 15, imageUrl: 'https://images.unsplash.com/photo-1536489885071-87983c3e2859?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi005', shopId: 'kitchen-kukkries', name: 'Veg Noodles', price: 70, prepTime: 12, imageUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi006', shopId: 'kitchen-kukkries', name: 'Chilli Paneer', price: 100, prepTime: 15, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80', isFeatured: false, isAvailable: true },

  // ── Kunj Burger Point (kunj-burger-point) ───────────────────
  { id: 'mi010', shopId: 'kunj-burger-point', name: 'Veg Burger', price: 60, prepTime: 10, imageUrl: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=300&q=80', isFeatured: true, isAvailable: true },
  { id: 'mi011', shopId: 'kunj-burger-point', name: 'Cheese Burger', price: 80, prepTime: 12, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi012', shopId: 'kunj-burger-point', name: 'Paneer Burger', price: 90, prepTime: 12, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi013', shopId: 'kunj-burger-point', name: 'French Fries', price: 70, prepTime: 8, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi014', shopId: 'kunj-burger-point', name: 'Cold Coffee', price: 70, prepTime: 5, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi015', shopId: 'kunj-burger-point', name: 'Chocolate Shake', price: 80, prepTime: 5, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80', isFeatured: false, isAvailable: true },

  // ── Doctor Dosa (doctor-dosa) ────────────────────────────────
  { id: 'mi020', shopId: 'doctor-dosa', name: 'Masala Dosa', price: 80, prepTime: 12, imageUrl: 'https://images.unsplash.com/photo-1630851840628-8c82a7ad3e20?w=300&q=80', isFeatured: true, isAvailable: true },
  { id: 'mi021', shopId: 'doctor-dosa', name: 'Butter Dosa', price: 90, prepTime: 12, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi022', shopId: 'doctor-dosa', name: 'Plain Dosa', price: 70, prepTime: 10, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi023', shopId: 'doctor-dosa', name: 'Idli Sambhar', price: 70, prepTime: 10, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi024', shopId: 'doctor-dosa', name: 'Vada Sambhar', price: 80, prepTime: 10, imageUrl: 'https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=300&q=80', isFeatured: false, isAvailable: true },

  // ── Millennials Cafe (millennials-cafe) ─────────────────────
  { id: 'mi030', shopId: 'millennials-cafe', name: 'Veg Sandwich', price: 80, prepTime: 8, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&q=80', isFeatured: true, isAvailable: true },
  { id: 'mi031', shopId: 'millennials-cafe', name: 'Cheese Sandwich', price: 90, prepTime: 8, imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi032', shopId: 'millennials-cafe', name: 'Pasta', price: 55, prepTime: 12, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi033', shopId: 'millennials-cafe', name: 'Pizza', price: 60, prepTime: 15, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi034', shopId: 'millennials-cafe', name: 'Cake Slice', price: 70, prepTime: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80', isFeatured: false, isAvailable: true },

  // ── Momo & Shakes Corner (momo-shakes-corner) ───────────────
  { id: 'mi040', shopId: 'momo-shakes-corner', name: 'Veg Momos', price: 40, prepTime: 10, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&q=80', isFeatured: true, isAvailable: true },
  { id: 'mi041', shopId: 'momo-shakes-corner', name: 'Paneer Momos', price: 60, prepTime: 12, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi042', shopId: 'momo-shakes-corner', name: 'Chocolate Shake', price: 70, prepTime: 5, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi043', shopId: 'momo-shakes-corner', name: 'Maggi', price: 50, prepTime: 7, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&q=80', isFeatured: false, isAvailable: true },
  { id: 'mi044', shopId: 'momo-shakes-corner', name: 'French Fries', price: 70, prepTime: 8, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80', isFeatured: false, isAvailable: true },
];

// Seed orders for Kitchen Kukkries live dashboard testing
const orders = [
  {
    id: 'ord-a3f2',
    displayId: '#A3F2',
    shopId: 'kitchen-kukkries',
    menuItemId: 'mi001',
    itemName: 'Veg Momos',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&q=80',
    itemPrice: 40,
    qty: 1,
    status: 'Preparing',
    ept: 10,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'ord-b7k1',
    displayId: '#B7K1',
    shopId: 'kitchen-kukkries',
    menuItemId: 'mi005',
    itemName: 'Veg Noodles',
    imageUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80',
    itemPrice: 70,
    qty: 1,
    status: 'Preparing',
    ept: 12,
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'ord-c9r4',
    displayId: '#C9R4',
    shopId: 'kitchen-kukkries',
    menuItemId: 'mi002',
    itemName: 'Paneer Momos',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80',
    itemPrice: 50,
    qty: 1,
    status: 'Ready',
    ept: 0,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60000).toISOString(),
  },
];

// Offline load entries (empty by default)
const offlineLoads = [];

// ─────────────────────────────────────────────────────────────
// CRUD HELPERS
// ─────────────────────────────────────────────────────────────

// Shops
function getAllShops() { return shops; }
function getShopById(id) { return shops.find(s => s.id === id) || null; }

// Menu Items
function getMenuByShopId(shopId) { return menuItems.filter(m => m.shopId === shopId); }
function getMenuItemById(id) { return menuItems.find(m => m.id === id) || null; }

function addMenuItem(data) {
  const item = {
    id: 'mi' + Date.now(),
    shopId: data.shopId,
    name: data.name,
    price: parseFloat(data.price),
    prepTime: parseInt(data.prepTime),
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
    isFeatured: data.isFeatured || false,
    isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
  };
  menuItems.push(item);
  return item;
}

function updateMenuItem(id, data) {
  const idx = menuItems.findIndex(m => m.id === id);
  if (idx === -1) return null;
  menuItems[idx] = { ...menuItems[idx], ...data };
  return menuItems[idx];
}

function deleteMenuItem(id) {
  const idx = menuItems.findIndex(m => m.id === id);
  if (idx === -1) return false;
  menuItems.splice(idx, 1);
  return true;
}

// Orders
function getAllOrders() { return orders; }
function getOrdersByShopId(shopId) { return orders.filter(o => o.shopId === shopId); }
function getOrderById(id) { return orders.find(o => o.id === id) || null; }

function createOrder(data) {
  const shortId = '#' + Math.random().toString(36).substr(2, 4).toUpperCase();

  let normalizedItems = [];
  let primaryItemName = '';
  let primaryImageUrl = '';
  let totalPrice = 0;
  let totalQty = 0;

  if (Array.isArray(data.items) && data.items.length > 0) {
    data.items.forEach(entry => {
      const menuItem = getMenuItemById(entry.menuItemId);
      const source = menuItem || entry;
      const qty = entry.qty && entry.qty > 0 ? entry.qty : 1;
      const name = source.name || 'Item';
      const price = typeof source.price === 'number' ? source.price : parseFloat(source.price || 0);
      const prepTime = parseInt(source.prepTime || 0);
      const imageUrl = source.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80';

      if (!primaryItemName) {
        primaryItemName = name;
        primaryImageUrl = imageUrl;
      }
      normalizedItems.push({
        menuItemId: entry.menuItemId,
        itemName: name,
        itemPrice: price,
        prepTime: prepTime,
        qty,
      });
      totalPrice += price * qty;
      totalQty += qty;
    });
  } else if (data.menuItemId) {
    const item = getMenuItemById(data.menuItemId);
    if (!item) return null;
    const qty = data.qty || 1;
    primaryItemName = item.name;
    primaryImageUrl = item.imageUrl;
    normalizedItems.push({
      menuItemId: item.id,
      itemName: item.name,
      itemPrice: item.price,
      prepTime: item.prepTime,
      qty,
    });
    totalPrice = item.price * qty;
    totalQty = qty;
  } else {
    return null;
  }

  const displayName = normalizedItems.length > 1
    ? `${primaryItemName} + ${normalizedItems.length - 1} more`
    : primaryItemName;

  const order = {
    id: uuidv4(),
    displayId: shortId,
    shopId: data.shopId,
    menuItemId: normalizedItems[0].menuItemId,
    itemName: displayName,
    imageUrl: primaryImageUrl,
    itemPrice: totalPrice,
    qty: totalQty,
    items: normalizedItems,
    status: 'Preparing',
    ept: data.ept || normalizedItems[0].prepTime,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

function updateOrderStatus(id, newStatus) {
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  order.status = newStatus;
  order.updatedAt = new Date().toISOString();

  // Archive completed orders (remove from active list after archiving)
  if (newStatus === 'Completed') {
    // Keep in array but mark as completed — ordering history preserves it
  }
  return order;
}

// Offline Loads
function getActiveOfflineLoads(shopId) {
  const now = Date.now();
  return offlineLoads.filter(
    l => l.shopId === shopId && (now - new Date(l.createdAt).getTime()) < 3_600_000
  );
}

function addOfflineLoad(data) {
  const load = {
    id: uuidv4(),
    shopId: data.shopId,
    minutes: parseInt(data.minutes),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  };
  offlineLoads.push(load);
  return load;
}

module.exports = {
  // Shops
  getAllShops,
  getShopById,
  // Menu
  getMenuByShopId,
  getMenuItemById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  // Orders
  getAllOrders,
  getOrdersByShopId,
  getOrderById,
  createOrder,
  updateOrderStatus,
  // Offline Loads
  getActiveOfflineLoads,
  addOfflineLoad,
};
