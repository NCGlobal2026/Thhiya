# Thhiya v2 Landing Page

## Overview
A modern, responsive landing page for Thhiya's global workforce marketplace platform, built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features Implemented

### 🎨 Design System
- **Brand Colors**: Navy (#0C1B33) primary, Red (#E63946) accent
- **Typography**: Inter font family with custom scale
- **Components**: Reusable Button, Card, Container, Select components
- **Animations**: Smooth transitions and micro-interactions using Framer Motion

### 📄 Landing Page Sections

1. **Hero Section**
   - Compelling headline and value proposition
   - Dual dropdown selectors (Service Category & Target Country)
   - Primary CTA: "Get Decision-Ready Insights"
   - Secondary navigation links
   - Dotted background pattern for visual interest

2. **How Thhiya Works**
   - Three-step process cards with icons
   - Steps: Discover & Compare, Get Matched, Connect & Scale
   - Clean card-based layout with hover effects

3. **Who We Help**
   - Three persona cards targeting different business segments
   - Startups, Growth Leaders, and Enterprises
   - Each with specific value propositions and highlights

4. **Common Challenges We Solve**
   - Four-column grid highlighting pain points
   - Left-border accent design
   - Icons for each challenge category

5. **Why Businesses Choose Thhiya**
   - Six differentiators in grid layout
   - Full transparency, verified partners, expert guidance
   - Privacy-first approach, fast matching, quality assurance

6. **Explore Next**
   - Five action cards for user journey paths
   - Browse services, compare providers, submit requirements
   - Join network and contact team options
   - Navy background for visual contrast

7. **Header & Footer**
   - Responsive navigation with mobile menu
   - Social links and comprehensive footer navigation
   - GDPR and DPDPA compliance disclaimers
   - Clean, professional layout

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **UI Components**: Headless UI
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Package Manager**: Bun

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Container.tsx
│   ├── Select.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── index.ts
├── features/
│   └── landing/        # Landing page feature modules
│       ├── HeroSection.tsx
│       ├── HowItWorksSection.tsx
│       ├── WhoWeHelpSection.tsx
│       ├── ChallengesSection.tsx
│       ├── WhyChooseSection.tsx
│       ├── ExploreNextSection.tsx
│       └── index.ts
├── pages/              # Route-level pages
│   ├── LandingPage.tsx
│   └── index.ts
├── styles/
│   └── index.css       # Global styles and Tailwind
├── App.tsx             # App router
└── main.tsx            # Entry point
```

## Running the Application

### Development Server
```bash
cd thhiya-v2/frontend
bunx --bun vite
```

The application will be available at `http://localhost:5173/`

### Build for Production
```bash
bun run build
```

### Preview Production Build
```bash
bun run preview
```

## Key Features

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Adaptive navigation (hamburger menu on mobile)
- Touch-friendly interactions

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus states for all interactive elements
- Color contrast compliance

### Performance
- Optimized bundle size
- Lazy loading ready
- Efficient re-renders with React
- CSS optimization with Tailwind

### User Experience
- Smooth scroll animations
- Hover and focus states
- Loading states ready
- Error handling prepared
- Form validation foundation

## Design Guidelines

### Colors
- **Navy 950**: Primary backgrounds, headings
- **Red 500**: CTAs, accents, highlights
- **Gray Scale**: Neutral backgrounds, text

### Typography Scale
- Display: 4rem (64px)
- H1: 3rem (48px)
- H2: 2.25rem (36px)
- H3: 1.875rem (30px)
- H4: 1.5rem (24px)
- Body: 1rem (16px)
- Body Large: 1.125rem (18px)

### Spacing
- Section padding: 16-24 vertical units
- Card padding: 6 units
- Generous whitespace for readability

### Components
- 8px border radius
- Subtle shadows for depth
- 200ms transitions
- Accessible focus rings

## Next Steps

### Immediate Priorities
1. Connect hero form to insights API endpoint
2. Implement navigation routing for all CTAs
3. Add analytics tracking
4. Create additional pages (Services, Providers, etc.)

### Future Enhancements
1. Add testimonials/social proof section
2. Implement search functionality
3. Add loading skeletons
4. Create error boundaries
5. Add unit and E2E tests
6. Optimize images and assets
7. Implement SEO metadata
8. Add blog/resources section

## Compliance

The landing page includes explicit compliance disclaimers for:
- **GDPR** (General Data Protection Regulation)
- **DPDPA** (Digital Personal Data Protection Act of India)

Privacy-first approach with user control over data sharing.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - Thhiya Platform

---

Built with ❤️ for global businesses
