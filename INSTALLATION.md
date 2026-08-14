# Installation Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git
- A Supabase Project (Database & Auth)

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/barterbrains/SafeSphere.git
   cd SafeSphere
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Variables**
   In the `backend` directory, create a `.env` file based on `.env.example`:
   ```env
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   # SUPABASE_SERVICE_ROLE_KEY=optional_for_bypassing_rls
   ALLOWED_ORIGIN=http://localhost:5173
   ```

5. **Database Setup**
   Run the SQL scripts provided in `database-schema.sql` within your Supabase project's SQL editor to create the necessary tables and Row-Level Security (RLS) policies.

## Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Client**
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.
