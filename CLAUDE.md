# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack music streaming application with:
- **Frontend**: React 18 + TypeScript SPA (Create React App)
- **Backend**: Laravel 12 API (PHP 8.2+)
- **Architecture**: Decoupled monorepo with separate `/front` and `/back` directories

## Development Commands

### Backend (Laravel)
Navigate to `back/` directory for all backend commands:

```bash
# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate
php artisan db:seed

# Development server
php artisan serve                    # Runs on http://localhost:8000
php artisan queue:listen --tries=1   # Queue worker

# Testing
vendor/bin/phpunit                                  # Run all tests
vendor/bin/phpunit tests/Unit                       # Unit tests only
vendor/bin/phpunit tests/Feature                    # Feature tests only
vendor/bin/phpunit --filter testUserCanLogin        # Single test method
vendor/bin/phpunit --filter UserTest                # All tests in UserTest class
vendor/bin/phpunit tests/Feature/AuthTest.php       # Single test file
vendor/bin/phpunit --testdox                        # Pretty output format

# Code quality
composer lint                        # Check code style
composer lint:fix                    # Fix code style issues
composer analyse                     # Run PHPStan static analysis
composer check                       # Run all checks (lint + analyse + test)
composer test:coverage               # Run tests with coverage

# Combined dev environment (with frontend + queue)
composer dev                         # Runs 3 processes concurrently:
                                     # 1. Laravel server (php artisan serve)
                                     # 2. Queue worker (queue:listen --tries=1)
                                     # 3. Vite dev server from ../front (npm run dev)
                                     # Note: Requires npm dependencies in ../front
```

### Frontend (React)
Navigate to `front/` directory for all frontend commands:

```bash
# Install dependencies
npm install

# Development
npm start          # Dev server on http://localhost:3000
npm test           # Run tests in watch mode
npm run build      # Production build

# Testing
npm test                                  # Run tests in watch mode
npm run test:coverage                     # Run tests with coverage

# Code quality
npm run lint                              # Run ESLint
npm run lint:fix                          # Fix ESLint issues
npm run format                            # Format with Prettier
npm run format:check                      # Check formatting
npm run type-check                        # TypeScript type checking
npm run analyze                           # Analyze bundle size (after build)
```

## Architecture & Key Concepts

### Backend Architecture

**Authentication & Security**
- Uses Laravel Sanctum for SPA authentication with session + CSRF tokens
- Cookie-based auth with `withCredentials: true` required on frontend
- Two-factor authentication (2FA) via email codes
- Email verification required for new accounts
- Stateful domains configured: `SANCTUM_STATEFUL_DOMAINS=localhost:3000`

**Key Features**
- Role-based permissions using Spatie Laravel Permission package
- Stripe integration for donations and creator onboarding
- GDPR compliance: data export (Article 15 & 20) and account deletion workflows
- Custom middleware: `EnsureUserIsAdult` for age-gated features, `SecurityHeaders` for CSP/HSTS
- Email-based password reset and email change with token verification
- Rate limiting on sensitive endpoints (6 requests/minute for auth, 3/minute for account deletion)
- Audio metadata extraction using GetID3 library (duration, artist, album from uploaded files)

**Database Structure**
- Users with profile images, email verification, 2FA, password reset codes
- Music tracks belong to Albums (includes title, artist_name, file_path, cover_image, duration in seconds)
- Playlists (many-to-many with Music via `music_playlist` pivot)
- Favorites, Album likes, Playlist likes (separate tables)
- User follows (social feature)
- Donations tracking
- Account deletion requests with email confirmation
- Schema evolves via migrations - check `database/migrations/` for latest structure

**API Routing Pattern**
- Public: `/register`, `/login`, search
- Throttled: email verification, 2FA, password reset (6/min or 3/min)
- Authenticated: All CRUD operations for music/albums/playlists, favorites, user management
- Webhook: `/stripe/webhook` for payment processing

**Important Backend Files**
- `routes/api.php` - All API endpoints
- `app/Http/Middleware/` - Custom middleware (adult check, security headers)
- `app/Models/` - Eloquent models (User, Music, Album, Playlist, etc.)
- `app/Http/Controllers/` - Feature-organized controllers
- `database/migrations/` - Database schema (check latest for current structure)

### Frontend Architecture

**State Management**
- Context-based global state with 4 main providers (nested order):
  1. `PlayerProvider` - Music player state, queue management
  2. `AuthProvider` - Authentication state, user session
  3. `PlaylistProvider` - Playlist operations
  4. `UserProvider` - User profile and preferences

**Routing & Navigation**
- React Router v6 with `PrivateRoute` wrapper for auth protection
- All authenticated routes include: Navbar, Sidebar, MusicQueue, SongPlayer
- Auth pages (`/auth`, `/forgot`) and public pages (`/privacy`, `/terms`) render standalone
- Token stored in `localStorage` as `authToken`

**API Integration**
- Centralized axios instance in `src/apis/api.ts`
- Base URL: `http://127.0.0.1:8000/api`
- **Critical**: `axios.defaults.withCredentials = true` for CSRF/session cookies
- Service layer pattern: dedicated service files for each domain (AuthService, MusicService, PlaylistService, etc.)

**Internationalization**
- i18next with browser language detection
- Locale files in `src/i18n/locales/` (en, fr, es, de, it, ja, pt, zh)
- Backend syncs user's locale preference
- **Current Status**: Core implementation complete (see I18N_STATUS.md)
  - French (fr) and English (en) translations: ✅ 100% complete (~260 keys)
  - All main components internationalized: ✅ 100% complete (13+ components)
  - Other languages (es, de, it, pt, zh, ja): Structure ready, translations needed (use en.json as base)
  - Language switching: ✅ Fully functional via PreferencesPage

**Key Frontend Patterns**
- TypeScript strict mode enabled
- Path aliases configured: `@components/*`, `@utils/*`, `@models/*`
- HLS.js for audio streaming
- FontAwesome icons via React components
- Headless UI for accessible components
- Modal-based workflows for playlists, profiles, donations

**Important Frontend Files**
- `src/App.tsx` - Main routing and provider hierarchy
- `src/App.lazy.tsx` - Lazy-loaded component exports for code splitting
- `src/App.optimized.tsx` - Optimized version with React.lazy and Suspense
- `src/apis/` - API services and context providers
- `src/components/` - Reusable UI components
- `src/pages/` - Route-level page components
- `src/i18n/` - Internationalization config and translations
- `src/config/env.ts` - Centralized environment configuration
- `src/styles/` - Design system (tokens, themes)
- `src/utils/` - Utility functions (validation, accessibility, SEO)
- `src/hooks/` - Custom React hooks (useForm, etc.)

## Platform-Specific Notes

### Windows Development
This project has been developed and tested on Windows. When working on Windows:
- Use forward slashes or double backslashes in paths
- Some commands may need to be run in Git Bash or PowerShell
- Ensure line endings are set correctly (Git should handle this automatically with `.gitattributes`)
- The `composer dev` command uses `npx concurrently` which works cross-platform

### Git Workflow
- Current branch: `main`
- No upstream branch configured (local development)
- When creating PRs, specify the base branch explicitly or configure an upstream remote

## Environment Configuration

### Backend (.env)
Required environment variables:
```
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_DATABASE=musicapp
SANCTUM_STATEFUL_DOMAINS=localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_SUPPORTS_CREDENTIALS=true
STRIPE_KEY, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET
MAIL_* (configure Mailhog/Mailpit for local development)
```

### Frontend (.env)
Required environment variables:
```
REACT_APP_API_URL=http://127.0.0.1:8000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

All environment variables are validated and accessed via `src/config/env.ts`.

## Common Workflows

### Adding a New Feature

**Backend**:
1. Create migration if database changes needed: `php artisan make:migration`
2. Create/update model in `app/Models/`
3. Create controller: `php artisan make:controller`
4. Add routes to `routes/api.php`
5. Add authentication middleware if required: `->middleware('auth:sanctum')`
6. Run migration: `php artisan migrate`

**Frontend**:
1. Create service file in `src/apis/` for API calls
2. Add TypeScript interfaces/types
3. Create/update components in `src/components/`
4. Create page in `src/pages/` if new route needed
5. Update routing in `src/App.tsx`
6. Add translations to all locale files in `src/i18n/locales/`

### Internationalizing a Component

When adding user-facing text to components, always use i18next:

```typescript
// 1. Import the hook
import { useTranslation } from 'react-i18next';

// 2. Use in component
const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('section.key')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

**Steps**:
1. Add translation keys to `front/src/i18n/locales/fr.json` and `en.json`
2. Import and use `useTranslation()` hook
3. Replace hardcoded text with `{t('section.key')}`
4. Test language switching via PreferencesPage
5. See `front/I18N_GUIDE.md` for detailed patterns

### Working with Authentication
- Backend uses session-based auth (Sanctum) - ensure CSRF protection via cookie
- Frontend must call `/sanctum/csrf-cookie` before login (handled in AuthService)
- All authenticated requests require valid session cookie + CSRF token
- Token in localStorage is for quick auth checks, actual auth is cookie-based

### Audio Streaming & Metadata
- Music files streamed via HLS (HTTP Live Streaming)
- Backend handles audio file serving (check `AudioStreamController`)
- Frontend uses HLS.js for playback
- Audio metadata (duration, artist, title) extracted on upload using GetID3 library
- Supported formats: MP3, M4A, WAV, FLAC, OGG

### Payment Integration
- Stripe Checkout Sessions for donations
- Stripe Connect for creator onboarding (artists receive donations)
- Webhook handling for payment confirmation
- Age gate middleware (`adult`) on donation endpoints

## Testing Considerations

- Backend tests in `tests/Unit/` and `tests/Feature/`
- Frontend uses React Testing Library + Jest
- Mock authenticated state by setting `localStorage.authToken` in frontend tests
- Backend uses array drivers for mail/cache in test environment (see `phpunit.xml`)

## Common Debugging Scenarios

### CORS Issues
- Verify `SANCTUM_STATEFUL_DOMAINS=localhost:3000` in backend `.env`
- Ensure `CORS_ALLOWED_ORIGINS=http://localhost:3000` is set
- Check `axios.defaults.withCredentials = true` in frontend `src/apis/api.ts`
- Clear browser cookies and restart both servers

### Authentication Not Working
- Run `/sanctum/csrf-cookie` endpoint before login attempts
- Check session driver is `file` or `database` (not `array`) in production
- Verify Sanctum middleware on protected routes: `->middleware('auth:sanctum')`
- Check browser developer tools for session cookie presence

### Audio Playback Issues
- Verify audio file paths in database match actual storage locations
- Check `AudioStreamController` is properly streaming with correct headers
- Ensure HLS.js is loaded and initialized in player component
- Check browser console for CORS errors on audio files

### Migration Issues
- Always run `php artisan migrate:fresh` when testing schema changes
- Check for existing table conflicts with `SHOW TABLES` in MySQL
- Verify migration file timestamps for execution order
- Use `php artisan migrate:rollback` to undo last batch

## GDPR & Privacy Features

The app implements GDPR compliance:
- **Right to Access** (Article 15): `/account/data/summary` and `/account/data/export`
- **Right to Portability** (Article 20): Data export in JSON format
- **Right to Erasure**: Account deletion with email confirmation workflow
- Cookie consent component on frontend
- Privacy policy and terms of service pages

## New Features & Utilities

### Design System
- **Design Tokens** (`src/styles/tokens.ts`): Colors, typography, spacing, shadows, etc.
- **Theme System** (`src/styles/theme.ts`): Light and dark mode configurations
- **Documentation**: See `src/styles/README.md` for usage guide

### Form Validation
- **Validation Utilities** (`src/utils/validation.ts`): Email, password, custom rules
- **useForm Hook** (`src/hooks/useForm.ts`): Complete form state management with validation
- **Common Rules**: Pre-configured validation for email, password, username, etc.

Example:
```typescript
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { email: '', password: '' },
  validationRules: {
    email: commonValidationRules.email,
    password: commonValidationRules.password,
  },
  onSubmit: async (values) => { /* submit logic */ },
});
```

### Accessibility
- **Utilities** (`src/utils/accessibility.ts`):
  - WCAG 2.1 contrast checking
  - Screen reader announcements
  - Focus trapping for modals
  - Escape key handling
- **ESLint Plugin**: `eslint-plugin-jsx-a11y` for automated accessibility checks

### SEO
- **SEO Utilities** (`src/utils/seo.ts`): Meta tag management, structured data
- **SEOHead Component** (`src/components/SEOHead.tsx`): Easy per-page SEO configuration
- **Structured Data**: JSON-LD support for music tracks, artists, breadcrumbs

Example:
```typescript
<SEOHead
  title="Artist Name - Profile"
  description="Explore music from Artist Name"
  type="profile"
/>
```

### Performance Optimizations
- **Lazy Loading**: Use `App.optimized.tsx` for code splitting with React.lazy()
- **Bundle Analysis**: Run `npm run analyze` after build
- **Coverage Requirements**: 50% minimum for branches, functions, lines, statements

### Code Quality Tools

**Frontend:**
- ESLint with TypeScript and accessibility plugins
- Prettier for consistent formatting
- TypeScript strict mode
- Source map explorer for bundle analysis

**Backend:**
- Laravel Pint for code style (PSR-12)
- PHPStan/Larastan for static analysis (level 5)
- Composer scripts for automated checks

### CI/CD
- GitHub Actions workflows for both frontend and backend
- Automated linting, testing, building
- Code coverage reporting (Codecov integration)
- Security audits

## Important Files to Review

- `IMPROVEMENTS_SUMMARY.md` - Complete list of all improvements
- `INSTALLATION_GUIDE.md` - Setup and usage instructions
- `SECURITY.md` - Security best practices
- `front/src/styles/README.md` - Design system documentation
- `front/I18N_GUIDE.md` - Internationalization guide
- `I18N_STATUS.md` - Current i18n implementation status
- `I18N_IMPLEMENTATION_SUMMARY.md` - i18n implementation summary
- `.github/workflows/` - CI/CD pipeline configurations
