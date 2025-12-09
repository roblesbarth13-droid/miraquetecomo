# Mirá que te como

## Overview

A food marketplace web application similar to "Too Good To Go", connecting local businesses (bakeries, grocery stores, butcher shops, rotisseries, supermarkets) that have surplus food with users who want to purchase it at 30-70% discounts. The platform is focused on the Argentine market and aims to reduce food waste while providing value to both merchants and consumers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Form Handling**: React Hook Form with Zod validation
- **Design System**: Mobile-first approach inspired by Too Good To Go, with food-centric visual hierarchy

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES Modules)
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js
- **Session Management**: Express sessions stored in PostgreSQL via connect-pg-simple

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Drizzle Kit with `db:push` command

### Key Data Models
- **Users**: Support for both regular users and business accounts (comercio)
- **Offers**: Food deals with pricing, discounts, pickup times, and category classification
- **Purchases**: Transaction records linking users to offers with payment status tracking
- **Sessions**: Authentication session storage

### Route Structure
- Public routes: Home (`/`), Offer Details (`/oferta/:id`), Landing (`/landing`)
- Auth-required: Convert to Business (`/convertir-comercio`)
- Business-only: Business Panel (`/comercio`), Create Offer (`/comercio/ofertas/nueva`)

### Build System
- Development: Vite dev server with HMR, proxied through Express
- Production: Client bundled to `dist/public`, server bundled with esbuild to `dist/index.cjs`
- Key dependencies are bundled to reduce cold start times

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, required via `DATABASE_URL` environment variable

### Authentication
- **Replit Auth**: OpenID Connect provider using `ISSUER_URL` (defaults to Replit's OIDC)
- **Session Secret**: `SESSION_SECRET` environment variable required

### UI Components
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **Lucide React**: Icon library
- **Google Fonts**: Inter font family for typography

### Development Tools
- **Replit Plugins**: Cartographer, dev banner, and runtime error overlay for enhanced Replit development experience