# BeTTI Learning Management System

## Overview

A secure, role-based Learning Management System (LMS) built for Belgut Technical Training Institute (BeTTI). The application provides distinct dashboards and functionality for three user roles: Admin, Lecturer, and Student. Features include department/course management, unit materials, student enrollments, notifications, and a clean academic-themed UI with Blue/Green/Gold color palette.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (Academic Luxe Minimal design system)
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage

### Authentication System
- **Strategy**: Local authentication using Passport.js with passport-local
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **User Model**: Username/password credentials stored in users table
- **Role System**: Three roles (admin, lecturer, student) with role-based route protection

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: shared/schema.ts defines all database tables and relations
- **Validation**: drizzle-zod generates Zod schemas from database tables
- **Migrations**: drizzle-kit manages database migrations (output to ./migrations)

### Project Structure
```
├── client/           # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks for API calls
│   │   ├── pages/        # Route components
│   │   └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database access layer
│   └── replit_integrations/auth/  # Authentication module
├── shared/           # Shared types, schemas, and route definitions
│   ├── schema.ts         # Drizzle database schema
│   ├── routes.ts         # API route contracts with Zod
│   └── models/auth.ts    # User and session models
```

### API Contract Pattern
Routes are defined in shared/routes.ts with:
- Path definitions
- HTTP methods
- Input validation schemas (Zod)
- Response type schemas
- Used by both frontend hooks and backend handlers for type safety

## External Dependencies

### Database
- **PostgreSQL**: Primary database for all application data
- **Connection**: DATABASE_URL environment variable required
- **Session Table**: sessions table for express-session storage

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption

### Key NPM Packages
- **drizzle-orm / drizzle-kit**: Database ORM and migration tools
- **express-session / connect-pg-simple**: Session management
- **passport / passport-local**: Authentication
- **@tanstack/react-query**: Frontend data fetching
- **zod**: Runtime validation for API contracts
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling