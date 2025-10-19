# Accessibility (A11y) Documentation

This document outlines the accessibility features and compliance measures implemented in the Music Streaming Platform.

## 🎯 Accessibility Standards Compliance

This application strives to meet **WCAG 2.1 Level AA** standards for web accessibility.

## ✅ Implemented Features

### 1. Keyboard Navigation

All interactive elements are fully keyboard accessible:

- **Tab Navigation**: All buttons, links, and form controls are reachable via Tab key
- **Enter/Space Activation**: Interactive elements respond to both Enter and Space keys
- **Escape Key**: Modals and dropdowns close with Escape key
- **Focus Management**: Clear visual focus indicators on all interactive elements

### 2. Screen Reader Support

#### ARIA Labels and Roles
- All form inputs have associated labels (via `<label htmlFor="...">` or `aria-label`)
- Interactive elements have appropriate ARIA roles
- Complex widgets use proper ARIA attributes

#### Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic elements used throughout (`<nav>`, `<main>`, `<article>`, `<button>`, etc.)
- Lists use proper `<ul>`/`<ol>` and `<li>` tags

### 3. Form Accessibility

All forms include:
- **Associated Labels**: Every input has a visible or ARIA label
- **Required Fields**: Marked with `required` attribute and ARIA
- **Error Messages**: Error states communicated via `aria-invalid` and `role="alert"`
- **Validation Feedback**: Real-time validation with accessible error messages

### 4. Color and Contrast

- **Text Contrast**: All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Focus Indicators**: High-contrast focus outlines (2px solid #7c3aed)
- **No Color-Only Information**: Important information is not conveyed by color alone

### 5. Responsive and Flexible

- **Text Scaling**: Interface remains usable at 200% zoom
- **Responsive Design**: Works on mobile, tablet, and desktop
- **No Fixed Sizes**: Uses relative units (rem, em, %) where appropriate

## 🔧 Technical Implementation

### ESLint Accessibility Plugin

The project uses `eslint-plugin-jsx-a11y` to catch accessibility issues during development:

```bash
npm run lint  # Checks for a11y issues
```

### Accessibility Utilities

Custom utilities in `src/utils/accessibility.ts`:

- **`checkContrast()`**: WCAG 2.1 contrast checking
- **`announceToScreenReader()`**: Screen reader announcements
- **`trapFocus()`**: Focus trapping for modals
- **`handleEscapeKey()`**: Escape key handling

### Focus Management

Modals and overlays implement proper focus management:

```typescript
import { trapFocus, handleEscapeKey } from '@utils/accessibility';

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

## 🧪 Testing

### Manual Testing Checklist

- [ ] Keyboard-only navigation through entire app
- [ ] Screen reader testing (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] 200% zoom test
- [ ] Color blindness simulation
- [ ] Mobile screen reader (TalkBack/VoiceOver)

### Automated Testing

Run accessibility tests in development:

```bash
npm test  # Includes RTL accessibility checks
```

## 📋 Component-Level Accessibility

### Buttons and Interactive Elements

```typescript
// ✅ Good: Proper button with accessible text
<button onClick={handleClick} aria-label="Close modal">
  <XIcon />
</button>

// ✅ Good: Link with descriptive text
<Link to="/profile">View Profile</Link>

// ❌ Bad: Non-semantic div with click handler
<div onClick={handleClick}>Click me</div>
```

### Form Inputs

```typescript
// ✅ Good: Label associated with input
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert">{errors.email}</span>
)}
```

### Images

```typescript
// ✅ Good: Descriptive alt text
<img src={album.cover} alt={`${album.title} album cover`} />

// ✅ Good: Decorative image
<img src={decoration.svg} alt="" role="presentation" />
```

### Modals

```typescript
// ✅ Good: Modal with proper attributes
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirmation</h2>
  <p id="modal-description">Are you sure you want to continue?</p>
  {/* Modal content */}
</div>
```

## 🐛 Common Issues Fixed

### Issue 1: Labels Not Associated with Inputs
**Problem**: Labels without `htmlFor` or inputs without `id`

**Solution**: Add matching `htmlFor` and `id` attributes
```typescript
<label htmlFor="username">Username</label>
<input id="username" type="text" />
```

### Issue 2: Non-Interactive Elements with Click Handlers
**Problem**: `<div>` or `<span>` with `onClick` handlers

**Solution**: Use `<button>` or add proper role and keyboard handlers
```typescript
// Before
<div onClick={handleClick}>Click me</div>

// After
<button onClick={handleClick}>Click me</button>
```

### Issue 3: Missing Focus Indicators
**Problem**: Interactive elements without visible focus states

**Solution**: Add CSS focus styles
```css
button:focus {
  outline: 2px solid #7c3aed;
  outline-offset: 2px;
}
```

### Issue 4: autoFocus Anti-Pattern
**Problem**: Using `autoFocus` on inputs

**Solution**: Remove `autoFocus` as it's disorienting for screen reader users
```typescript
// Before
<input autoFocus type="text" />

// After
<input type="text" />
```

## 📖 Resources

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Official accessibility guidelines
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) - Comprehensive accessibility documentation
- [A11y Project](https://www.a11yproject.com/) - Community-driven accessibility resources

### Screen Readers
- **Windows**: [NVDA (Free)](https://www.nvaccess.org/download/)
- **Windows**: [JAWS](https://www.freedomscientific.com/products/software/jaws/)
- **macOS/iOS**: VoiceOver (Built-in)
- **Android**: TalkBack (Built-in)

## 🎯 Future Improvements

- [ ] Add skip-to-content link
- [ ] Implement focus visible polyfill for older browsers
- [ ] Add keyboard shortcuts documentation
- [ ] Implement reduced motion preferences
- [ ] Add high contrast mode support
- [ ] Create accessibility statement page

## 📞 Reporting Accessibility Issues

If you encounter any accessibility barriers in this application, please:

1. Open an issue on the GitHub repository
2. Include:
   - Description of the problem
   - Steps to reproduce
   - Assistive technology used (if applicable)
   - Screenshots or screen recordings

We are committed to making this application accessible to everyone.

---

**Last Updated**: 2025-10-13
**WCAG Level**: AA (Target)
**Testing**: Manual + Automated (ESLint jsx-a11y)
