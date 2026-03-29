<div align="center">
  <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80" alt="QuickBite Logo" style="border-radius: 50%; border: 4px solid #ff785a;" width="120"/>
  <h1>QuickBite: Predictive Ordering System</h1>
  <p><strong>A dual-sided cafeteria ordering platform with a predictive dynamic queue algorithm.</strong></p>
</div>

---

## 🚀 Overview

QuickBite is an end-to-end full-stack application engineered to solve long queue times in cafeterias and food courts. By utilizing a "Smart EPT" (Estimated Prep Time) engine, QuickBite calculates wait times dynamically based on active kitchen load, staff headcount, and item-specific prep times. 

It provides an unparalleled, mobile-first **Customer Application** for students/staff, and a high-speed, live **Vendor Dashboard** for kitchen staff.

---

## ✨ Key Features

- **Predictive EPT Engine:** Real-time formula `((total pending time + offline load) / active staff) + base item time` guarantees customers always see accurate queue wait times.
- **Dual-Sided Architecture:** A single frontend React application logically partitioned for Customers (`/customer/*`) and Vendors (`/vendor/*`).
- **Offline Sync:** Vendors can inject physical walk-in orders to organically scale up the digital EPT for incoming online customers without manual math.
- **Mobile-App Native Design:** Developed with strict max-width formatting so it presents exactly like a downloaded mobile-app natively on desktop web browsers.
- **Dynamic Theming:** Instant, fully-integrated Dark and Light mode styling via Tailwind contextual selectors mapping exact brand tokens.

---

## 🛠️ Technology Stack

| Domain | Tech |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS (Utility-first framework) |
| **Backend API** | Node.js, Express.js |
| **Data Layer** | Centralized in-memory node datastore (portable to SQL/NoSQL) |
| **Navigation** | React Router DOM |

---

## 🏁 Setup & Install Guide

The app must be spun up as two separate server instances concurrently. Follow these steps in your terminal:

### 1. Fire up the Backend
```bash
cd backend
npm install
node server.js
```
*(Listening on `http://localhost:3001`)*

### 2. Fire up the Frontend UI
```bash
cd frontend
npm install
npm run dev
```
*(Listening on `http://localhost:5173`)*

---

## 🖥️ Live Dashboard Navigation

Open two parallel web browser windows to witness the live system in action!

### The Customer Interface
Navigate to **`http://localhost:5173/`**
- Browse active shops.
- See dynamic crowd ratings and varying prep times.
- Complete a mocked checkout to hit the active countdown "radar" screen.

### The Vendor Interface
Navigate to **`http://localhost:5173/vendor/s001/live`**
- You are now manning the kitchen of "Burger Barn" (Shop ID: `s001`).
- Watch live customer orders filter directly into your "Preparing" list.
- Push orders to the "Ready" state to notify your simulated customers.
- Expand your queue deliberately using the custom "Add Order" item selector payload.
