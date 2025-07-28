# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

eComJunction is a SAAS platform for influencers and affiliate marketers to showcase and organize product recommendations. The platform features AI-powered product extraction from URLs using OpenAI's GPT-4o-mini model.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Development Server
The development server runs on port 8080 (not the default 5173) as configured in vite.config.ts.

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI + Tailwind CSS
- **State Management**: React Context (ProductContext, ThemeContext)
- **Data Fetching**: TanStack Query
- **Routing**: React Router v6
- **AI Integration**: OpenAI GPT-4o-mini for product extraction

### Key Architecture Patterns

#### Context-Based State Management
- **ProductContext**: Manages product data, filtering, sorting, and CRUD operations
- **ThemeContext**: Handles theme customization with CSS variable updates
- **AuthContext**: Handles user authentication, sessions, and demo mode
- Products are persisted in localStorage with key "shopmatic-products"
- Theme settings are persisted in localStorage with key "shopmatic-theme"
- Authentication sessions are encrypted and stored with key "shopmatic_auth"

#### AI-Powered Product Extraction
- **OpenAIService**: Handles AI-powered product data extraction from URLs
- **ProductExtractionService**: Orchestrates URL parsing and AI extraction
- **URLParsingService**: Handles URL validation and HTML content fetching
- API keys are managed through APIKeyManager utility

#### Component Structure
- **Pages**: Route-level components in src/pages/
- **Layout**: Header, Footer, ErrorBoundary in src/components/layout/
- **Products**: All product-related components in src/components/products/
- **Auth**: Authentication components in src/components/auth/
- **UI**: shadcn/ui components in src/components/ui/
- **Theme**: Theme customization components in src/components/theme/
- **Compliance**: GDPR/CCPA and legal compliance in src/components/compliance/

### Path Aliases
- `@/*` maps to `./src/*` for clean imports

### TypeScript Configuration
- Base configuration in tsconfig.json with references to app and node configs
- Relaxed TypeScript settings: noImplicitAny, strictNullChecks, noUnusedLocals disabled
- Path aliases configured for @ import

### Styling
- Tailwind CSS with custom CSS variables for theming
- Theme colors are dynamically converted from hex to HSL and applied as CSS variables
- Custom theme system allows real-time color customization

## Key Features

### Product Management
- Add products manually or via AI-powered URL extraction
- Grid/List view modes with advanced filtering and sorting
- Categories, tags, price ranges, and rating filters
- Real-time search functionality
- localStorage persistence

### AI Integration
- OpenAI GPT-4o-mini for product data extraction
- HTML content analysis with 4000 character limit
- Confidence scoring for extraction quality
- Fallback handling for API failures

### Theme System
- Dynamic theme customization with real-time preview
- CSS variable-based theming system
- Persistent theme settings across sessions
- Hex to HSL color conversion utility

## Environment Variables
- `VITE_OPENAI_API_KEY` - Required for AI-powered product extraction

## Notable Implementation Details

### Error Handling
- ErrorBoundary component wraps the entire application
- Graceful fallbacks for missing API keys
- Service availability checks for OpenAI integration

### Performance Optimizations
- Vite with SWC for fast builds and HMR
- TanStack Query for efficient data fetching
- Lovable-tagger plugin for development mode component tagging

### Development Workflow
- ESLint with TypeScript support and React hooks rules
- Relaxed linting rules for development efficiency
- Vitest test framework configured with React Testing Library

## Production Readiness Features

### Security
- **API Key Encryption**: Web Crypto API with AES-GCM encryption for secure API key storage
- **Input Validation**: Comprehensive validation using Zod schemas and DOMPurify sanitization
- **XSS Protection**: Content Security Policy headers and input sanitization
- **Rate Limiting**: Client-side rate limiting for API calls
- **CSRF Protection**: Security headers and form validation

### Compliance
- **GDPR/CCPA**: Cookie consent management with granular preferences
- **Data Management**: User data export and deletion functionality
- **FTC Compliance**: Automatic affiliate disclosure detection and display
- **Privacy Controls**: Comprehensive privacy settings page

### Data Protection
- **Secure Storage**: Encrypted localStorage with Web Crypto API
- **Data Sanitization**: All user inputs sanitized before storage
- **Privacy by Design**: Local-first data storage with user control

### Testing
- **Unit Tests**: Comprehensive test coverage for security-critical components
- **Security Tests**: Validation of encryption, sanitization, and security utilities
- **Component Tests**: React component testing with user interaction simulation

### Content Security Policy
- Strict CSP headers with nonce support
- XSS protection and clickjacking prevention
- Secure resource loading restrictions

### Authentication System
- **Email-based Authentication**: Full registration and login with email validation
- **Demo Mode**: Instant access with sample data, no persistence
- **Session Management**: Encrypted sessions with integrity validation using Web Crypto API
- **Route Protection**: ProtectedRoute component for authenticated pages
- **User Roles**: Free, Pro, Enterprise plans with feature gating
- **Security Features**: 
  - Session expiration (24 hours)
  - Session integrity verification with hash validation
  - Secure password handling (mock implementation for demo)
  - Rate limiting for authentication attempts

### Demo Login Credentials
- **Email**: user@example.com or pro@example.com
- **Password**: password123
- **Demo Mode**: Click "Demo Login" for instant access without account creation