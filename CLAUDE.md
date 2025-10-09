# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack music streaming application with a Laravel backend and React frontend. Users can upload music, create albums/playlists, follow artists, like/favorite content, and make donations via Stripe. The application includes authentication with 2FA/email verification, role-based permissions, and audio streaming capabilities.

## Monorepo Structure

- **`back/`** - Laravel 12 backend API (PHP 8.2+)
- **`front/`** - React frontend (TypeScript, Create React App)

Each directory has its own `package.json` and must be developed independently.

## Development Commands

### Backend (Laravel)

Navigate to `back/` directory:

```bash
# Start all services (Laravel server, queue worker, Vite)
composer dev

# Individual commands
php artisan serve              # Start Laravel dev server (port 8000)
php artisan queue:listen --tries=1  # Start queue worker
npm run dev                    # Start Vite for asset compilation

# Database
php artisan migrate            # Run migrations
php artisan migrate:fresh      # Fresh migration (drops all tables)
php artisan db:seed            # Seed database

# Code quality
php artisan test               # Run PHPUnit tests
./vendor/bin/pint              # Run Laravel Pint (code formatter)

# Artisan helpers
php artisan make:controller    # Create controller
php artisan make:model         # Create model
php artisan make:migration     # Create migration
php artisan make:mail          # Create mailable class
```

### Frontend (React)

Navigate to `front/` directory:

```bash
npm start                      # Start dev server (port 3000)
npm test                       # Run tests in watch mode
npm run build                  # Production build
```

## Architecture

### Backend Architecture

#### API Structure
- All routes defined in `back/routes/api.php`
- RESTful API with Laravel Sanctum for authentication
- Token-based auth stored in `personal_access_tokens` table
- Middleware: `auth:sanctum` for protected routes, custom `adult` middleware for donation features

#### Controllers (`back/app/Http/Controllers/`)
- **AuthController** - Registration, login, 2FA verification, email verification, password reset
- **MusicController** - CRUD for music tracks, file uploads, ownership checks
- **AlbumController** - Album management, likes, user albums
- **PlaylistController** - Playlist CRUD, add/remove music, likes
- **UserController** - Profile management, subscriptions/follows, likes summary
- **FavoriteController** - User favorites for individual tracks
- **DonationController** - Stripe checkout sessions and webhooks
- **AccountController** - Email change requests (with token confirmation)
- **AccountDeletionController** - Account deletion requests (with token confirmation)
- **PreferencesController** - User preferences, locale, Stripe onboarding
- **GlobalSearchController** - Search across music, albums, playlists, users
- **AudioStreamController** - Streaming audio files (not in routes, check if used)
- **DataExportController** - GDPR data export and summary (Articles 15 & 20)

#### Models (`back/app/Models/`)
Core models with relationships:
- **User** - HasApiTokens, HasRoles, Notifiable. Relationships: music, albums, playlists, favorites, donations, followers, following
- **Music** - Belongs to user and album. Has favorites through users
- **Album** - Belongs to user. Has many music tracks and likes
- **Playlist** - Belongs to user. Many-to-many with music, has likes
- **Donation** - Belongs to user and recipient (User)
- **EmailChangeRequest** - Token-based email change verification
- **AccountDeletionRequest** - Token-based account deletion confirmation

#### Key Features
- **Authentication**: Email verification with code, 2FA with code (stored in DB), password reset with code
- **Permissions**: Uses `spatie/laravel-permission` package
- **File Storage**: Music and images stored in Laravel storage (check `storage/app/`)
- **Payments**: Stripe integration for donations with webhook handling
- **Email**: Uses Laravel mail system (check `back/app/Mail/`)
- **Middleware**:
  - `SecurityHeaders` - Sets security headers
  - `EnsureUserIsAdult` - Checks date_of_birth for donation features

### Frontend Architecture

#### Project Structure
- **React Router v6** for routing with `PrivateRoute` component
- **Context API** for state management (no Redux)

#### Contexts (`front/src/apis/`)
- **AuthContext** - User authentication state and token management
- **PlayerContext** - Global music player state, queue management, HLS streaming
- **PlaylistContext** - Playlist operations
- **UserContext** - Current user profile data

#### Services (`front/src/apis/`)
API service files handle all backend communication:
- **AuthService** - Login, register, logout
- **MusicService** - Fetch music data
- **MyMusicService** - User's uploaded music
- **AlbumService** - Album operations
- **PlaylistService** - Playlist CRUD
- **FavoritesService** - Favorite tracks
- **UserService** - User profiles, subscriptions
- **DonateService** - Stripe donation flow
- **PreferencesService** - User preferences
- **GlobalSearchService** - Search functionality
- **DataExportService** - GDPR data export

All services use `axios` configured in `front/src/services/api.ts` with the base URL.

#### Internationalization (i18n)
The application supports multiple languages using **i18next**.

**Supported Languages:**
- French (fr) - Default/Fallback
- English (en)
- Spanish (es)
- Italian (it)
- Portuguese (pt)
- German (de)
- Chinese (zh)
- Japanese (ja)

**Configuration:**
- Configuration file: `front/src/i18n/config.ts`
- Translation files: `front/src/i18n/locales/{lang}.json`
- Initialized in `front/src/index.js` before app render
- Uses `i18next-browser-languagedetector` for automatic language detection
- Detection order: localStorage → browser language → HTML lang attribute
- Language stored in localStorage as `i18nextLng`

**Backend Integration:**
- Backend stores user locale preference in `users.locale` column (fr/en only)
- PreferencesController handles locale get/set operations
- Frontend syncs language with backend via PreferencesService
- Language switcher in PreferencesPage

**Usage in Components:**
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t, i18n } = useTranslation();

  // Use translations
  return <h1>{t('common.loading')}</h1>;

  // Change language
  i18n.changeLanguage('en');
};
```

**Translation Structure:**
Translations are organized by namespace (common, nav, auth, music, etc.) in JSON files.

#### Components (`front/src/components/`)
Key components:
- **SongPlayer** - Global audio player with HLS.js support, controls, progress
- **MusicQueue** - Display and manage play queue
- **Sidebar** - Navigation with playlists
- **Navbar** - Top navigation with search
- **GlobalSearchBar** - Search with autocomplete dropdown
- **SongList** - Reusable track list with play/favorite actions
- **CreateEditPlaylistModal** - Modal for playlist creation/editing
- **DonateModal** - Stripe donation modal
- **PersonalInfoModal** - Edit user personal information
- **EditProfileModal** - Edit user profile (username, bio, profile picture)
- **CookieConsent** - GDPR cookie consent banner
- **DropdownMenu** - Reusable dropdown component using Headless UI
- **PlaylistCheckboxMenu** - Add tracks to playlists via checkbox menu
- **SearchResultsDropdown** - Display global search results
- **SongCard**, **PlaylistCard**, **ProfileCircleCard** - Reusable card components

#### Pages (`front/src/pages/`)
- **AuthPage** - Login and registration
- **ForgotPasswordPage** - Password reset flow
- **MainPage** - Home/discover feed
- **MyMusicPage** - User's uploaded tracks
- **ImportPage** - Upload new music
- **FavoritesPage** - User's favorite tracks
- **AlbumPage** - Album details and tracks
- **EditAlbumPage** - Edit album metadata
- **PlaylistPage** - Playlist details and tracks
- **ProfilePage** - User profile (own or others)
- **PreferencesPage** - User settings, Stripe onboarding, account management
- **PrivacyPolicyPage** - Privacy policy
- **TermsOfServicePage** - Terms of service

#### Routing
- All authenticated routes require `authToken` in localStorage
- Routes automatically redirect to `/auth` if not authenticated
- `PrivateRoute` component handles authentication checks
- Public routes: `/auth`, `/forgot`, `/privacy`, `/terms`

#### Audio Streaming
Uses HLS.js library for adaptive streaming. Check `PlayerContext` for implementation details.

#### Utilities (`front/src/utils/`)
- **ageCalculator.ts** - Calculate user age from date of birth for adult verification

## Database Schema

### Key Tables
- `users` - User accounts with email verification, 2FA, Stripe data, date_of_birth, locale
- `music` - Music tracks with file paths, duration, user_id, album_id
- `albums` - Albums with cover images, user_id
- `playlists` - Playlists with user_id
- `music_playlist` - Pivot table for playlist tracks
- `favorites` - User favorite tracks
- `album_likes`, `playlist_likes` - Like functionality
- `user_follows` - User subscription/follow system
- `donations` - Stripe payment records with status
- `email_change_requests` - Token-based email change
- `account_deletion_requests` - Token-based account deletion
- `personal_access_tokens` - Sanctum API tokens
- `roles` and `permissions` tables from Spatie package

## Environment Setup

### Backend
1. Copy `.env.example` to `.env` in `back/` directory
2. Set `APP_KEY` (run `php artisan key:generate`)
3. Configure database credentials (MySQL)
4. Configure mail settings (Mailhog/Mailpit for local)
5. Add Stripe keys (test mode)
6. Set `CORS_ALLOWED_ORIGINS` to frontend URL (http://localhost:3000)
7. Run `composer install`
8. Run `npm install`
9. Run `php artisan migrate`

### Frontend
1. `npm install` in `front/` directory
2. Configure API base URL in `front/src/services/api.ts` (default: http://localhost:8000/api)
3. Ensure CORS is properly configured on backend

## Important Implementation Notes

### Authentication Flow
1. User registers → email verification code sent
2. User verifies email with code
3. On login → 2FA code sent to email
4. User verifies 2FA code → receives auth token
5. Token stored in localStorage as `authToken`
6. Token sent in `Authorization: Bearer` header for API requests

### File Uploads
- Music files uploaded to `back/storage/app/` directory
- Images (album covers, profile pictures) also in storage
- Files accessed via Laravel storage routes or streaming endpoints

### Stripe Integration
- Donations require user to be 18+ (checked via `adult` middleware)
- Stripe onboarding for recipients via Stripe Connect
- Webhook endpoint at `/api/stripe/webhook` handles payment confirmations

### Email Tokens
- Email change and account deletion use signed tokens sent via email
- Routes: `account.email.confirm` and `account.delete.confirm`
- Tokens expire and are deleted after use

### Throttling
- Email/2FA endpoints throttled at 6 requests per minute
- Account deletion requests throttled at 3 requests per minute

### GDPR Compliance
- Cookie consent banner with preferences (CookieConsent component)
- Data export functionality (Articles 15 & 20) via DataExportController
- Account deletion with email confirmation
- Email change requests with verification
- Privacy policy and terms of service pages

### SEO
- `robots.txt` in `front/public/`
- `sitemap.xml` in `front/public/`

## Testing

### Backend
- PHPUnit tests in `back/tests/`
- Run with `php artisan test`

### Frontend
- Jest + React Testing Library
- Run with `npm test`

## Common Development Patterns

### Adding a New API Endpoint (Backend)
1. Add route to `back/routes/api.php`
2. Create/update controller method in `back/app/Http/Controllers/`
3. Add authorization checks (policies or manual)
4. Update frontend service file in `front/src/apis/`
5. Update TypeScript types if needed

### Adding a New Page (Frontend)
1. Create page component in `front/src/pages/`
2. Add route to `front/src/App.tsx` with appropriate `PrivateRoute` wrapper
3. Include `<Navbar />`, `<Sidebar />`, `<MusicQueue />` in route element if needed
4. Add navigation link in Sidebar component if applicable

### Working with Player Context
- Always use `PlayerContext` for playback operations
- Never manipulate audio directly in components
- Queue management methods: `addToQueue`, `removeFromQueue`, `clearQueue`, `playNext`

### Adding New Translations
1. Add translation keys to all language files in `front/src/i18n/locales/`
2. Maintain consistent key structure across all JSON files
3. Use the `useTranslation` hook in components: `const { t } = useTranslation();`
4. Access translations with dot notation: `t('namespace.key')`
5. Organize translations by logical sections (common, auth, music, etc.)
6. Backend only supports `fr` and `en` in the database; other languages are frontend-only
