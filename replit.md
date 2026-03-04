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
- **Authentication**: Custom email/password auth with bcrypt password hashing + legacy Replit Auth support
- **Session Management**: Express sessions stored in PostgreSQL via connect-pg-simple

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Drizzle Kit with `db:push` command

### Key Data Models
- **Users**: Support for both regular users and business accounts (comercio)
- **Offers**: Food deals with pricing, discounts, pickup times, category classification, quantity tracking (quantity/quantitySold), and automatic 24-hour expiration (expiresAt)
- **Purchases**: Transaction records linking users to offers with payment status tracking
- **Ratings**: Business ratings (1-5 stars with optional comment) linked to purchases and users
- **Sessions**: Authentication session storage

### Key Features
- **Photo Upload**: Businesses can upload product photos (5MB limit, JPG/PNG/WebP/GIF)
- **Quantity Tracking**: Each offer has quantity available, decremented on purchase, shows "Agotado" when sold out
- **Auto-Expiration**: Offers expire 24 hours after creation, automatically filtered from listings
- **Category Images**: Default stock images per category when no custom photo uploaded
- **Business Ratings**: Users can rate businesses after completing a purchase (1-5 stars + optional comment), displayed on offer cards and detail pages
- **Geocoding**: Business addresses are geocoded using Google Maps API for map display
- **Edit Business Profile**: Businesses can update their address/phone from the panel to enable geocoding
- **Mercado Pago Integration**: Simulated marketplace payment splitting (platform commission + merchant payout)
- **QR Pickup Verification**: Each purchase generates a unique 6-character alphanumeric code; users see QR code on "Mis Compras" page; businesses verify codes in "Verificar retiro" tab
- **Rate Limiting**: API endpoints protected with express-rate-limit (general 200/15min, auth 15/15min, payments 30/15min, uploads 20/15min)
- **Legal Pages**: Terms & Conditions (`/terminos`) and Privacy Policy (`/privacidad`) compliant with Argentine law (Ley 25.326)

### Route Structure
- Public routes: Home (`/`), Offer Details (`/oferta/:id`), Landing (`/landing`), Map (`/mapa`), How it Works (`/como-funciona`), Terms (`/terminos`), Privacy (`/privacidad`)
- Auth routes: Login (`/login`), Business Registration (`/registro-comercio`)
- Auth-required: Convert to Business (`/convertir-comercio`), My Purchases (`/mis-compras`)
- Business-only: Business Panel (`/comercio`), Create Offer (`/comercio/ofertas/nueva`)

### Build System
- Development: Vite dev server with HMR, proxied through Express
- Production: Client bundled to `dist/public`, server bundled with esbuild to `dist/index.cjs`
- Key dependencies are bundled to reduce cold start times

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, required via `DATABASE_URL` environment variable

### Authentication
- **Custom Auth**: Email/password authentication with bcrypt password hashing (SALT_ROUNDS=10)
- **Legacy Support**: Replit Auth (OpenID Connect) still supported via `ISSUER_URL` for backward compatibility
- **Session Secret**: `SESSION_SECRET` environment variable required
- **CBU Storage**: Business accounts store CBU (22-digit bank account) for payment processing

### UI Components
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **Lucide React**: Icon library
- **Google Fonts**: Inter font family for typography

### Development Tools
- **Replit Plugins**: Cartographer, dev banner, and runtime error overlay for enhanced Replit development experience