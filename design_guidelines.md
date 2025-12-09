# Design Guidelines: Mirá que te como

## Design Approach
**Reference-Based**: Primary inspiration from Too Good To Go's playful yet trustworthy marketplace aesthetic, supplemented by Airbnb's card-based browsing and Uber Eats' category filtering patterns.

**Core Principles**:
- Food-first visual hierarchy - images drive engagement
- Playful approachability with trust signals
- Discount visibility for instant value recognition
- Mobile-optimized touch targets and scanning patterns

## Typography

**Font System**: 
- Primary: 'Inter' (Google Fonts) - headings, UI elements
- Secondary: 'Inter' (regular weight) - body text, descriptions

**Hierarchy**:
- H1 (Logo/Brand): text-2xl font-bold (mobile), text-3xl (desktop)
- H2 (Section Headers): text-xl font-semibold
- H3 (Card Titles): text-lg font-medium
- Body: text-base font-normal
- Small (Metadata): text-sm text-gray-600
- Price Display: text-2xl font-bold for discount price, text-lg line-through text-gray-400 for original

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4 (mobile), p-6 (desktop)
- Section spacing: space-y-6 (mobile), space-y-8 (desktop)
- Card gaps: gap-4 (mobile), gap-6 (desktop)

**Container Widths**:
- Max-width: max-w-7xl mx-auto px-4
- Content sections: max-w-6xl
- Form containers: max-w-2xl

**Grid Systems**:
- Offer cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Category filters: Horizontal scroll on mobile, grid-cols-5 on desktop
- Commerce panel: grid-cols-1 lg:grid-cols-2

## Component Library

### Navigation
**Top Bar** (sticky, shadow-sm):
- Logo left-aligned with playful food icon
- Search bar (desktop only, grows with focus)
- User profile icon right-aligned
- Height: h-16, backdrop-blur-sm for scroll transparency

### Category Filters
**Horizontal Scroll Pills** (below header):
- Rounded-full buttons with icons
- Active state: filled background, inactive: border-2
- Gap-3 spacing, px-6 py-3 sizing
- Icons from Heroicons (shopping-bag, cake, etc.)

### Offer Cards
**Image-Forward Cards** (rounded-2xl, shadow-md, hover:shadow-lg transition):
- Image: aspect-[4/3], object-cover, rounded-t-2xl
- Discount badge: Absolute top-right, rounded-full, px-4 py-2, text-lg font-bold
- Content padding: p-4
- Layout: Image → Store name (text-sm) → Offer title (text-lg font-medium) → Price row → Pickup time
- Price row: Flex between old/new prices, space-x-2
- Pickup time: Flex items with clock icon + time text

### Detail View
**Full-Width Image Header**:
- Hero image: h-64 md:h-96, gradient overlay at bottom
- Back button: Absolute top-left with backdrop-blur background
- Store info card: Overlapping bottom of image (-mt-8), rounded-t-3xl

**Content Sections** (p-6 spacing):
- Title + description
- Price comparison (large, prominent)
- Pickup time with map icon
- CTA button: Full-width on mobile, max-w-md on desktop

### Forms (Commerce Upload)
**Clean Input Fields**:
- Labels: text-sm font-medium mb-2
- Inputs: px-4 py-3, rounded-lg, border-2, focus:ring-2
- Image upload: Dashed border area, h-48, center-aligned upload icon
- Submit button: w-full md:w-auto, px-8 py-3

### Commerce Panel
**Dashboard Cards**:
- Stats cards: Grid layout, p-6, rounded-xl, shadow-sm
- Active offers: Same card pattern as main feed
- Sales history: Table with alternating row backgrounds

### Buttons
**Primary CTA**: 
- px-8 py-4, rounded-full, font-semibold, text-lg
- Backdrop-blur for buttons on images
- No custom hover states (inherit component defaults)

**Secondary Actions**:
- px-6 py-3, rounded-lg, border-2, font-medium

### Badges & Indicators
**Discount Badge**: Circular, prominent percentage display
**Status Indicators**: Small colored dots with text (activa/vendida/expirada)

## Responsive Behavior

**Mobile-First Breakpoints**:
- Base: Single column, full-width cards
- md (768px): Two-column grid, side-by-side layouts
- lg (1024px): Three-column grid, expanded navigation

**Touch Optimization**:
- Minimum tap targets: h-12 w-12
- Increased padding on interactive elements: p-4 minimum
- Bottom navigation consideration for frequent actions

## Images

**Hero/Featured Images**:
- Home page: No dedicated hero - immediately show offer cards (marketplace pattern)
- Offer detail: Full-width food photo as hero (h-64 md:h-96)
- Commerce dashboard: Optional banner area for promotions

**Offer Card Images**:
- Aspect ratio: 4:3, high-quality food photography
- Placeholder: Gradient with utensils icon for missing images
- Image treatment: Rounded corners (rounded-t-2xl), subtle shadow

**Icon Usage**: Heroicons throughout for consistency
- Categories: shopping-bag, cake, meat, leaf, building-storefront
- Actions: clock, map-pin, shopping-cart, user-circle
- Status: check-circle, x-circle, clock

## Special Considerations

**Trust Signals**:
- Store verification badge next to names
- Review stars (if implemented later)
- "Sold out" overlays on unavailable offers

**Animations**: Minimal, performance-focused
- Card hover: Subtle lift (translateY(-4px), shadow increase)
- Button press: Scale down slightly (scale-95)
- Page transitions: Simple fade
- No scroll animations or complex effects

**Accessibility**:
- All images with descriptive alt text
- Form inputs with associated labels
- Keyboard navigation support
- Color contrast ratio 4.5:1 minimum
- Focus indicators on all interactive elements