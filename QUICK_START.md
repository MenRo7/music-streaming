# Quick Start Guide - Music Streaming Platform

## ⚡ 5-Minute Setup

### 1. Backend Setup
```bash
cd back
composer install
cp .env.example .env
php artisan key:generate  # IMPORTANT: Regenerates APP_KEY
# Edit .env with your database credentials
php artisan migrate
php artisan serve         # Runs on http://localhost:8000
```

### 2. Frontend Setup
```bash
cd front
npm install
cp .env.example .env
# Edit .env with Stripe key
npm start                 # Runs on http://localhost:3000
```

## 🔑 Key Environment Variables

**Backend (.env):**
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `STRIPE_SECRET=sk_test_...`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000`

**Frontend (.env):**
- `REACT_APP_API_URL=http://127.0.0.1:8000/api`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...`

## 📦 What's New?

### ✅ All Issues Fixed
- ✅ Security: Stripe keys, CORS, .env protection
- ✅ Accessibility: WCAG tools, ESLint plugin
- ✅ Design System: Tokens, themes, documentation
- ✅ Form Validation: useForm hook, validation utils
- ✅ Code Quality: ESLint, Prettier, PHPStan, Pint
- ✅ Performance: Lazy loading, bundle optimization
- ✅ Tests: Frontend (Jest/RTL) + Backend (PHPUnit)
- ✅ SEO: Meta tags, structured data
- ✅ CI/CD: GitHub Actions workflows

### 🎨 New Frontend Features
- **Design System** → `src/styles/tokens.ts` & `src/styles/theme.ts`
- **Form Validation** → `useForm` hook in `src/hooks/useForm.ts`
- **Accessibility** → `src/utils/accessibility.ts`
- **SEO** → `<SEOHead />` component
- **Env Config** → `src/config/env.ts`

### 🛠️ New Commands

**Frontend:**
```bash
npm run lint              # Check code
npm run lint:fix          # Fix issues
npm run format            # Format code
npm run type-check        # TypeScript check
npm run test:coverage     # Tests with coverage
npm run analyze           # Bundle analysis
```

**Backend:**
```bash
composer lint             # Check code style
composer lint:fix         # Fix code style
composer analyse          # Static analysis
composer check            # All checks
composer test:coverage    # Tests with coverage
```

## 📚 Documentation

1. **IMPROVEMENTS_SUMMARY.md** - Complete details of all changes
2. **INSTALLATION_GUIDE.md** - Detailed setup instructions
3. **CLAUDE.md** - Architecture and development guide
4. **SECURITY.md** - Security best practices
5. **front/src/styles/README.md** - Design system docs

## 🚀 Enable Lazy Loading (Optional)

```bash
cd front/src
mv App.tsx App.original.tsx
cp App.optimized.tsx App.tsx
```

This enables code splitting for better performance.

## 🧪 Run Quality Checks

```bash
# Frontend
cd front
npm run lint && npm run type-check && npm run test:coverage

# Backend
cd back
composer check
```

## 🔒 Security Checklist

- [x] Stripe keys moved to .env
- [x] CORS fixed to use env()
- [x] .env added to .gitignore
- [ ] Regenerate APP_KEY (done via `php artisan key:generate`)
- [ ] Update production environment variables
- [ ] Enable FORCE_HTTPS=true in production

## 💡 Usage Examples

### Form with Validation
```typescript
import { useForm } from './hooks/useForm';
import { commonValidationRules } from './utils/validation';

const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
  initialValues: { email: '' },
  validationRules: { email: commonValidationRules.email },
  onSubmit: async (values) => { /* logic */ },
});
```

### SEO Meta Tags
```typescript
import SEOHead from './components/SEOHead';

<SEOHead
  title="Page Title"
  description="Page description"
  type="website"
/>
```

### Design Tokens
```typescript
import { designTokens } from './styles/tokens';

const styles = {
  color: designTokens.colors.primary[500],
  padding: designTokens.spacing[4],
};
```

## 🆘 Troubleshooting

**Can't connect to backend?**
→ Check CORS settings in `back/config/cors.php`

**Tests failing?**
→ Run `composer install` and `npm install`

**Stripe not working?**
→ Verify keys in both .env files

## 🎯 Next Steps

1. Review `IMPROVEMENTS_SUMMARY.md` for complete details
2. Install dependencies: `composer install` & `npm install`
3. Configure .env files
4. Run quality checks
5. Start developing!

---

**Need more help?** See `INSTALLATION_GUIDE.md` for detailed instructions.
