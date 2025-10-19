# Security Notes

## Critical: .env File Security

**⚠️ IMPORTANT**: The `.env` file containing the `APP_KEY` was previously committed to the repository.

### Required Actions:

1. **Rotate the APP_KEY immediately**:
   ```bash
   cd back
   php artisan key:generate
   ```

2. **Verify .gitignore**:
   Ensure `.env` is in `.gitignore` (already configured)

3. **Remove from Git history** (if needed):
   If the `.env` was pushed to a remote repository, consider using tools like `git-filter-repo` or `BFG Repo-Cleaner` to remove it from history.

4. **Update production environment**:
   - Generate a new key in production
   - Update any encrypted data that depends on the old key
   - Inform all team members to regenerate their local `.env` files

## Environment Variables Checklist

### Backend (.env)
- [ ] `APP_KEY` - Generated via `php artisan key:generate`
- [ ] `DB_PASSWORD` - Never commit real credentials
- [ ] `STRIPE_SECRET` - Keep secret keys secure
- [ ] `STRIPE_WEBHOOK_SECRET` - Use different values for dev/prod

### Frontend (.env)
- [ ] `REACT_APP_STRIPE_PUBLISHABLE_KEY` - Publishable keys are safe to commit in `.env.example`
- [ ] `REACT_APP_API_URL` - Environment-specific URLs

## Stripe Webhook Signature Verification

The webhook handler should verify signatures. Check `DonationController::webhook()` implements:

```php
\Stripe\Webhook::constructEvent(
    $payload,
    $sigHeader,
    config('services.stripe.webhook_secret')
);
```

## CORS Configuration

The CORS configuration has been fixed to properly read from environment variables.

- Development: `http://localhost:3000`
- Production: Update `CORS_ALLOWED_ORIGINS` in `.env`

## Security Headers

Security headers are configured in `app/Http/Middleware/SecurityHeaders.php`:
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options

Ensure `FORCE_HTTPS=true` in production.
