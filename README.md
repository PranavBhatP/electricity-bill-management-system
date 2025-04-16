# Electricity Bill Management System

A modern web application for managing electricity connections, bills, and customer relationships. Built with Next.js 13, Prisma, and TypeScript.

## Features

### User Features
- **Dashboard**
  - View all electricity connections
  - Monitor consumption history with interactive graphs
  - Track pending bills and payment status
  - Quick access to bill payment and complaint submission

- **Connections**
  - View connection details including meter number and tariff information
  - Track consumption history for each connection
  - View connection-specific billing history

- **Bills & Payments**
  - View all bills with due dates and amounts
  - Online bill payment functionality
  - Payment history and receipt tracking
  - Payment status monitoring

- **Complaints**
  - Submit complaints about service issues
  - Track complaint status
  - View complaint resolution updates

### Admin Features
- **Dashboard**
  - Real-time statistics on users, connections, and bills
  - Visual representation of paid vs unpaid bills
  - Quick access to all management functions

- **User Management**
  - View and manage all system users
  - Create new user accounts
  - Delete users with cascading data cleanup

- **Connection Management**
  - Create new connections for users
  - Assign meter numbers and set tariff rates
  - Different tariff types (Residential, Commercial, Industrial, Agricultural)
  - View all connections and their details

- **Bill Management**
  - Generate bills for connections
  - Track consumption units
  - Monitor payment status
  - View payment history

- **Complaint Management**
  - View and respond to user complaints
  - Update complaint status
  - Track resolution progress

## Technology Stack

- **Frontend**
  - Next.js 13 (App Router)
  - React
  - TypeScript
  - Tailwind CSS
  - Chart.js for data visualization

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL Database
  - NextAuth.js for authentication

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ebill-management-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ebill_db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run Database Migrations
   npx prisma migrate dev
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - Default admin credentials:
     - Email: admin@example.com
     - Password: admin123

## Database Schema

The application uses the following main models:
- User (Regular users and admins)
- Connection (Electricity connections)
- Bill (Monthly bills)
- Payment (Payment records)
- Consumption (Monthly unit consumption)
- Complaint (User complaints)

## Security Features

- Secure authentication using NextAuth.js
- Role-based access control (Admin/User)
- Protected API routes

