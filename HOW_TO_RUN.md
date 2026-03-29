# 🍔 QuickBite — Setup & Run Guide

Welcome to the QuickBite predictive ordering application! This guide will explain exactly how to start the project and where to navigate to test both the customer and vendor sides.

## 🚀 1. How to Run the Application

The project is split into two parts: the Node.js backend (`backend`) and the React/Vite frontend (`frontend`). You need to run **both** simultaneously in two separate terminal windows.

### Terminal 1: Start the Backend (API Server)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd "d:\New folder (4)\quickbite\backend"
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *(The backend server will run on **http://localhost:3001**)*

### Terminal 2: Start the Frontend (User Interface)
1. Open a new, second terminal and navigate to the frontend folder:
   ```bash
   cd "d:\New folder (4)\quickbite\frontend"
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Vite development framework:
   ```bash
   npm run dev
   ```
   *(The frontend will run on **http://localhost:5173**)*

---

## 📱 2. Where to Go (URLs)

Once both servers are running, open your web browser (like Chrome or Edge).

### 🙍‍♂️ The Customer Side
To experience the app as a student or customer placing an order:
* **Navigate to:** [http://localhost:5173/](http://localhost:5173/)
* **What you can do:** Browse all actively open cafeterias, view the smart EPT (Estimated Prep Time), simulate adding items to your cart, place a "mock" order, and track the live countdown.

### 👨‍🍳 The Vendor Side (Live Dashboards)
To experience the app as a cafeteria worker managing queues:
Since there are multiple cafeterias, you need to visit the specific URL for the vendor you want to manage.

Here are the unique URLs for the pre-loaded vendors:

* 🍔 **Burger Barn (s001)**
  [http://localhost:5173/vendor/s001/live](http://localhost:5173/vendor/s001/live)

* 🌶️ **Spice Garden (s002)**
  [http://localhost:5173/vendor/s002/live](http://localhost:5173/vendor/s002/live)

* 🍜 **Noodle House (s003)**
  [http://localhost:5173/vendor/s003/live](http://localhost:5173/vendor/s003/live)

* 🍕 **Pizza Palace (s004)**
  [http://localhost:5173/vendor/s004/live](http://localhost:5173/vendor/s004/live)

* 🥗 **Green Bowl (s005)**
  [http://localhost:5173/vendor/s005/live](http://localhost:5173/vendor/s005/live)

* **What you can do:**
  1. See incoming customer orders from the customer app dynamically drop into your **"Preparing"** list.
  2. Mark items as "Ready" to shift them to the **"Ready to Collect"** column (which instantly notifies the tracking countdown on the Customer Side).
  3. **Add Offline Orders:** Click the "+" button, select an item, and add it to the queue to organically bump up waiting times for incoming users!
  4. Navigate via the bottom nav to explore the Menu management and Profile screens where you can toggle **Dark Mode**.

---

### 💡 Pro Testing Tip
For the best experience, open two side-by-side browser windows:
1. Open [http://localhost:5173/](http://localhost:5173/) on the left half of your screen.
2. Open [http://localhost:5173/vendor/s001/live](http://localhost:5173/vendor/s001/live) on the right half.

Place an order at **Burger Barn** using the customer screen, and watch it instantly appear on your vendor dashboard screen!
