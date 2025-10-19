# Changelog

## [Latest] - Design System Update

### Changed
- **Theme System Simplified**: Removed dual light/dark theme system
  - Kept single dark theme configuration matching application's existing dark design
  - Simplified `front/src/styles/theme.ts`
  - Updated documentation in `front/src/styles/README.md`
  - Export now: `import theme from './theme'` instead of `import { lightTheme, darkTheme }`

### Why?
The application already has a consistent dark design. The dual theme system was unnecessary complexity.

### Migration Guide
If you were using the old theme imports:

**Before:**
```typescript
import { lightTheme, darkTheme } from './styles/theme';
const theme = lightTheme; // or darkTheme
```

**After:**
```typescript
import theme from './styles/theme';
// Use directly - it's already configured for dark mode
```

---

## [Initial] - Complete RNCP 38606 Improvements

### Added - Security (C16, C21, C23)
- Environment variable configuration for frontend (`front/.env`)
- Centralized env config (`front/src/config/env.ts`)
- Security documentation (`back/SECURITY.md`)
- Fixed CORS configuration in `back/config/cors.php`

### Added - Accessibility (C13)
- ESLint jsx-a11y plugin
- WCAG 2.1 utilities (`front/src/utils/accessibility.ts`)
- Contrast checking, focus management, screen reader support

### Added - Design System (C14)
- Complete design tokens (`front/src/styles/tokens.ts`)
- Theme system (`front/src/styles/theme.ts`)
- Design system documentation (`front/src/styles/README.md`)

### Added - Form Validation (C15)
- Validation utilities (`front/src/utils/validation.ts`)
- Custom useForm hook (`front/src/hooks/useForm.ts`)
- Common validation rules

### Added - Code Quality Tools (C16, C19, C22, C26)
- Frontend: ESLint, Prettier, TypeScript strict mode
- Backend: PHPStan/Larastan, Laravel Pint
- Automated npm and composer scripts

### Added - Performance (C16)
- Lazy loading with React.lazy() (`front/src/App.lazy.tsx`, `App.optimized.tsx`)
- Code splitting by route
- Bundle analyzer setup

### Added - Tests (C18, C25)
- Frontend: Jest + React Testing Library setup and examples
- Backend: PHPUnit test examples
- Coverage thresholds configured

### Added - SEO (C20)
- SEO utilities (`front/src/utils/seo.ts`)
- SEOHead component (`front/src/components/SEOHead.tsx`)
- Structured data (JSON-LD) support
- Updated robots.txt

### Added - CI/CD (C19, C26)
- GitHub Actions workflows for frontend and backend
- Automated linting, testing, building
- Code coverage reporting

### Added - Documentation
- README.md - Main project documentation
- QUICK_START.md - 5-minute setup guide
- INSTALLATION_GUIDE.md - Detailed installation
- IMPROVEMENTS_SUMMARY.md - Complete improvements summary
- RNCP_CERTIFICATION_CHECKLIST.md - Certification compliance
- FILES_CREATED.md - All files created/modified
- CLAUDE.md - Architecture guide (enhanced)
