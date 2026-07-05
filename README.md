# MERN Recipe Recommendation & Nutritional Analysis System

A comprehensive, full-stack web application designed to help users search, explore, and manage recipes while getting real-time, detailed nutritional analyses. The system is built using the **MERN (MongoDB, Express, React, Node.js)** stack and integrates directly with the **USDA FoodData Central API** to dynamically calculate nutrition profiles for each recipe.

---

## 🚀 Key Features

### 1. Dynamic Recipe Discovery & Recommendation
* **Flexible Search & Filtering:** Search for recipes by name, categories, ingredients, or dietary preferences (e.g., Vegetarian, Vegan, Gluten-Free, Keto).
* **Smart Recommendations:** Recommends recipes based on user preferences and search matching.
* **Detailed Recipe Pages:** Displays rich ingredient lists, step-by-step instructions, preparation time, servings, and user comments.

### 2. Live USDA-Powered Nutritional Analysis
* **Dynamic Weight Estimation:** Automatically converts standard cooking units (e.g., teaspoons, tablespoons, cups, cloves, pieces) into estimated weights in grams.
* **Real-time Nutrient Fetching:** Queries the USDA FoodData Central API to compute accurate nutritional metrics, including:
  * Calories (kcal)
  * Macronutrients (Proteins, Carbs, Fats)
  * Micronutrients (Sodium, Fiber, Sugars, Cholesterol)
* **Intelligent Caching:** Implements an in-memory caching system to store USDA query results, reducing external API requests and avoiding rate limits.

### 3. User Authentication & Profile Customization
* **Secure Auth:** JWT-based user authentication system with secure password hashing (bcrypt).
* **Personalized Favorites:** Registered users can bookmark recipes to their "Favorites" list for fast access on any device.

### 4. Premium Responsive Design
* Custom-crafted UI featuring glassmorphic styling, smooth hover animations, and intuitive responsive layouts across desktop, tablet, and mobile devices.

---

## 📁 Architecture & Directory Structure

```text
VT_mern/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI widgets (cards, navigation, loaders)
│   │   ├── context/        # React Context API for global authentication & state
│   │   ├── pages/          # Main views (Home, RecipeDetails, Favorites, Login, Register)
│   │   ├── services/       # API clients for communication with the backend
│   │   └── styles/         # CSS style sheets and visual design tokens
│   └── package.json        # Frontend dependencies & configurations
│
├── server/                 # Node.js + Express Backend
│   ├── config/             # Database connection & configurations
│   ├── controllers/        # Route controllers (MVC architecture)
│   ├── middleware/         # Custom authentication & error-handling middlewares
│   ├── models/             # Mongoose schemas (User, Recipe, etc.)
│   ├── routes/             # Express API endpoints
│   ├── services/           # External API & business logic (e.g., USDA integration)
│   └── package.json        # Backend dependencies & configurations
│
├── package.json            # Root configuration for concurrent execution scripts
└── .gitignore              # Global git ignore configurations
```

---

## 🛠️ Tech Stack & Technologies

* **Frontend:** React, Vite, React Router DOM, Custom CSS (Vanilla).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (using Mongoose ODM).
* **Integrations:** USDA FoodData Central API.
* **Authentication:** JSON Web Tokens (JWT), bcrypt.

---

## ⚙️ Getting Started & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) installed (v16.x or higher recommended).
* A MongoDB instance (local or Atlas cluster).
* A USDA FoodData Central API key (optional but recommended; falls back to DEMO_KEY if not provided).

### Installation

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd VT_mern
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/recipe-db
   JWT_SECRET=your_jwt_secret_key_here
   USDA_API_KEY=your_usda_api_key_here
   NODE_ENV=development
   ```

3. **Install Dependencies & Start the Application:**
   From the root folder, you can install and run both servers concurrently:
   ```bash
   # Install backend dependencies
   npm install --prefix server

   # Install frontend dependencies
   npm install --prefix client

   # Run both client and server concurrently
   npm run dev
   ```

   Alternatively, you can run them individually:
   * **Backend:** `npm run server`
   * **Frontend:** `npm run client`
