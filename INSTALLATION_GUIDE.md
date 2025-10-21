# Installation & Setup Guide

This guide will help you set up and run the improved music streaming platform with all the new features and configurations.

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **PHP** 8.2 or higher
- **Composer** 2.x
- **MySQL** 8.0 or higher
- **Git**

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd music-streaming
```

### 2. Backend Setup

```bash
cd back

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key (IMPORTANT: This replaces the old key)
php artisan key:generate

# Configure your database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=musicapp
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Configure Stripe keys in .env
# STRIPE_KEY=pk_test_...
# STRIPE_SECRET=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# Configure CORS for your frontend URL
# CORS_ALLOWED_ORIGINS=http://localhost:3000

# Run database migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Start development server
php artisan serve
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd ../front

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables in .env
# REACT_APP_API_URL=http://127.0.0.1:8000/api
# REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

---

## 🔧 Development Workflow

### Frontend Development

```bash
cd front

# Start dev server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# TypeScript type checking
npm run type-check

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Analyze bundle size (after build)
npm run build
npm run analyze
```

### Backend Development

```bash
cd back

# Start all services (server + queue + vite)
composer dev

# Or individually:
php artisan serve                    # API server
php artisan queue:listen --tries=1   # Queue worker

# Run tests
composer test
# or
vendor/bin/phpunit

# Run tests with coverage
composer test:coverage

# Check code style
composer lint

# Fix code style automatically
composer lint:fix

# Run static analysis
composer analyse

# Run all checks (lint + analyse + test)
composer check
```

---

## 🎨 Using the Design System

### Import Design Tokens

```typescript
import { designTokens } from './styles/tokens';

const styles = {
  color: designTokens.colors.primary[500],
  fontSize: designTokens.typography.fontSize.lg,
  padding: designTokens.spacing[4],
  borderRadius: designTokens.borderRadius.md,
};
```

### Using Themes

```typescript
import { lightTheme, darkTheme } from './styles/theme';

const theme = lightTheme; // or darkTheme

const buttonStyle = {
  backgroundColor: theme.colors.primary,
  color: theme.colors.text.inverse,
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
};
```

---

## ✅ Form Validation

### Using the useForm Hook

```typescript
import { useForm } from './hooks/useForm';
import { commonValidationRules } from './utils/validation';

const MyForm = () => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: {
      email: commonValidationRules.email,
      password: commonValidationRules.password,
    },
    onSubmit: async (values) => {
      await loginUser(values);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={!!errors.email}
      />
      {touched.email && errors.email && (
        <span role="alert">{errors.email}</span>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
};
```

---

## 🔍 SEO Implementation

### Adding SEO to a Page

```typescript
import SEOHead from './components/SEOHead';

const ProfilePage = () => {
  return (
    <>
      <SEOHead
        title="Artist Name - MusicApp"
        description="Discover music from Artist Name on MusicApp"
        type="profile"
        image="/artist-image.jpg"
      />

      {/* Page content */}
    </>
  );
};
```

### Adding Structured Data

```typescript
import { addStructuredData, createMusicTrackStructuredData } from './utils/seo';

// Add structured data for a music track
useEffect(() => {
  addStructuredData('MusicRecording', createMusicTrackStructuredData({
    name: track.title,
    artist: track.artist,
    album: track.album,
    duration: track.duration,
    url: window.location.href,
    image: track.coverImage,
  }));
}, [track]);
```

---

## ♿ Accessibility Features

### Focus Management

```typescript
import { trapFocus, handleEscapeKey } from './utils/accessibility';

useEffect(() => {
  if (isModalOpen) {
    const cleanupFocus = trapFocus(modalRef.current);
    const cleanupEscape = handleEscapeKey(onClose);

    return () => {
      cleanupFocus();
      cleanupEscape();
    };
  }
}, [isModalOpen]);
```

### Screen Reader Announcements

```typescript
import { announceToScreenReader } from './utils/accessibility';

const handleSave = async () => {
  await saveData();
  announceToScreenReader('Data saved successfully', 'polite');
};
```

---

## 🧪 Writing Tests

### Component Test Example

```typescript
// MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Backend Test Example

```php
// tests/Feature/MyFeatureTest.php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MyFeatureTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function authenticated_user_can_access_resource()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/resource');

        $response->assertStatus(200);
    }
}
```

---

## 🚀 Enabling Lazy Loading

To enable code splitting with lazy loading, replace the main App component:

```bash
cd front/src
mv App.tsx App.original.tsx
cp App.optimized.tsx App.tsx
```

This will activate React.lazy() for all page components, reducing initial bundle size.

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Regenerate `APP_KEY` with `php artisan key:generate`
- [ ] Update all `.env` variables with production values
- [ ] Set `FORCE_HTTPS=true` in backend `.env`
- [ ] Configure production `CORS_ALLOWED_ORIGINS`
- [ ] Update Stripe keys to live mode
- [ ] Set up SSL/TLS certificates
- [ ] Enable database backups
- [ ] Set up error monitoring (Sentry, Bugsnag, etc.)
- [ ] Configure logging and monitoring
- [ ] Review and test security headers (CSP, HSTS)
- [ ] Verify webhook signature checking for Stripe
- [ ] Remove or secure debug endpoints

---

## 📊 Running CI/CD Locally

### Frontend Checks (mimicking CI)

```bash
cd front
npm run lint
npm run format:check
npm run type-check
npm run test:coverage
npm run build
```

### Backend Checks (mimicking CI)

```bash
cd back
composer lint
composer analyse
composer test
```

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend

**Solution:** Check that:
- Backend is running on port 8000
- `.env` has correct `REACT_APP_API_URL`
- CORS is configured correctly in backend

### Issue: Database migration fails

**Solution:**
- Check database credentials in `.env`
- Ensure MySQL is running
- Create database manually: `CREATE DATABASE musicapp;`

### Issue: Stripe integration not working

**Solution:**
- Verify Stripe keys are set in both frontend and backend `.env` files
- Check console for errors
- Ensure using test mode keys for development

### Issue: Tests failing

**Solution:**
- Run `composer install` and `npm install` to ensure all dependencies are present
- Check that test database is configured
- Clear cache: `php artisan config:clear` and `php artisan cache:clear`

---

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Testing Library](https://testing-library.com)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref)
- [Stripe Documentation](https://stripe.com/docs)

---

## 💬 Getting Help

If you encounter issues not covered in this guide:

1. Check `IMPROVEMENTS_SUMMARY.md` for details on all changes
2. Review `CLAUDE.md` for architecture information
3. Check `SECURITY.md` for security-specific questions
4. Review design system docs in `front/src/styles/README.md`

---

**Happy coding! 🎉**
